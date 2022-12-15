-- Idea:
-- 0. get the following info passed from app:
--    - taxonomies (minimum one)
--    - taxFilters (optional, default: [])
--    - pcoFilters (optional, default: [])
--    - taxFields (optional, default: [])
--    - pcoFields (optional, default: [])
--    - useSynonyms (optional, default: true)
--    - list of objectIds (optional)
--    - count (optional, limit is reserved word)
-- 1. for every pc with fields choosen, select: object_id, fieldname, value (while applying all filters)
--    Use above query as template
-- 2. get list of object_ids (with empty columns fieldname and value) while applying all filters
-- 3. for every tax field choosen, select: object_id, fieldname, value (while applying all filters)
-- 4. combine all tables using either union or intersect
--    see: https://www.enterprisedb.com/postgres-tutorials/how-combine-multiple-queries-single-result-set-using-union-intersect-and-except
--    or: select into rec? (https://stackoverflow.com/a/6085167/712005)
-- 5. use crosstab to get list of objects with all columns (https://stackoverflow.com/a/11751905/712005, safe form)
-- add relation collections?
-- how to efficiently handle previews? Sort by object_id and limit to 15?
--
-- alternative idea with temporary table and record: (https://stackoverflow.com/a/23957098/712005)
-- 1. create temporary table _tmp with column id
-- 2. for every taxonomy: select list of object_ids and tax-fields choosen while applying all filters: insert into _tmp. Limit if count was passed
-- 3. for every pc with fields choosen: add column to _tmp, then update it with above query
-- 4. select _tmp into record and return it
-- 5. how to query unknown structure with graphql? Use id and jsonb instead!
--
-- alternative idea using id and jsonb:
-- 0. define type as (id uuid, properties json)
-- 1. create temporary table _tmp with column id
-- 2. for every taxonomy: select list of object_ids and tax-fields choosen while applying all filters: insert into _tmp. Limit if count was passed
-- 3. for every pc with fields choosen: add column to _tmp, then update it with above query
-- 4. select _tmp into record and return it
-- 5. how to query unknown structure with graphql? Use id and json instead.
--    Build directly in json or convert _tmp using to_jsonb or row_to_json, then removing id using jsonb - text → jsonb?
--    Or: build _only_ json by using row_to_json. Then client reads that.
--    (https://www.postgresql.org/docs/14/functions-json.html, https://www.postgresql.org/docs/current/functions-json.html#FUNCTIONS-JSONB-OP-TABLE)
CREATE TYPE ae.export_data AS (
  id uuid, -- needed for apollo
  count integer, -- enable passing total count while only returning limited data for preview
  export_data json -- this is a json array
);

CREATE TYPE tax_field AS (
  pname text,
  taxname text
);

CREATE TYPE sort_field AS (
  tname text, -- what table the property is extracted from. One of: object, property_collection_object, relation
  pcname text, -- name of property collection or taxonomy
  pname text, -- property name
  relationtype text, -- relevant for relations
  direction text -- ASC or DESC
);

CREATE OR REPLACE FUNCTION ae.remove_bad_chars (var text)
  RETURNS text
  AS $$
BEGIN
  RETURN trim(replace(replace(replace(replace(replace(LOWER(var), ' ', '_'), '(', ''), ')', ''), '-', ''), '↵', ''));
END;
$$
LANGUAGE plpgsql
IMMUTABLE STRICT;

--
-- need to use a record type or jsonb, as there exists no predefined structure
-- docs: https://www.postgresql.org/docs/15/plpgsql-declarations.html#PLPGSQL-DECLARATION-RECORDS
-- need count of all, even when limited. Thus returning ae.export_data
CREATE OR REPLACE FUNCTION ae.export_all (taxonomies text[], tax_fields tax_field[], tax_filters tax_filter[], pco_filters pco_filter[], pcs_of_pco_filters text[], pcs_of_rco_filters text[], pco_properties pco_property[], rco_filters rco_filter[], rco_properties rco_property[], use_synonyms boolean, count integer, object_ids uuid[], row_per_rco boolean, sort_fields sort_field[])
  RETURNS ae.export_data
  AS $$
DECLARE
  taxonomy text;
  rows_sql text;
  count_sql text;
  count_count_sql text;
  row_count integer;
  sql text;
  sql2 text;
  taxfilter tax_filter;
  taxfield tax_field;
  pcofilter pco_filter;
  rcofilter rco_filter;
  pc_of_pco_filters text;
  --pcs_of_pco_filters text[];
  pc_of_rco_filters text;
  name1 text;
  pc_name text;
  pc_name2 text;
  pco_name text;
  pcoo_name text;
  pco_name2 text;
  rco_name text;
  rco_name2 text;
  pcoproperty pco_property;
  rcoproperty rco_property;
  tmprow record;
  tmprow2 record;
  object record;
  fieldname text;
  tablename text;
  sortfield sort_field;
  taxfield_sql text;
  taxfield_sql2 text;
  object_id uuid;
  return_query text;
  return_data ae.export_data;
  return_data_json jsonb;
  sort_field sort_field;
  orderby_sql text;
BEGIN
  -- pcs_of_pco_filters: = SELECT DISTINCT
  --   pcname
  -- FROM
  --   pco_filters;
  -- create table
  DROP TABLE IF EXISTS _tmp;
  -- TODO: re-declare temporary
  CREATE TABLE _tmp (
    id uuid PRIMARY KEY
  );
  DROP TABLE IF EXISTS _tmp_count;
  -- TODO: re-declare temporary
  CREATE TABLE _tmp_count (
    id uuid PRIMARY KEY
  );
  -- insert object_ids
  FOREACH taxonomy IN ARRAY taxonomies LOOP
    -- select
    rows_sql := 'INSERT INTO _tmp (id) select object.id from ae.object object';
    count_sql := 'INSERT INTO _tmp_count (id) select object.id from ae.object object';
    -- join
    sql := ' inner join ae.taxonomy tax on tax.id = object.taxonomy_id';
    rows_sql := rows_sql || sql;
    count_sql := count_sql || sql;
    -- join to filter by pcos
    IF cardinality(pcs_of_pco_filters) > 0 THEN
      FOREACH pc_of_pco_filters IN ARRAY pcs_of_pco_filters LOOP
        name1 := ae.remove_bad_chars (pc_of_pco_filters);
        pc_name := 'pc_' || name1;
        pco_name := 'pco_' || name1;
        pcoo_name := 'pcoo_' || name1;
        IF use_synonyms = TRUE THEN
          -- if synonyms are used, filter pcos via pco_of_object
          sql := format(' INNER JOIN ae.pco_of_object %4$s ON %4$s.object_id = object.id
                          INNER JOIN ae.property_collection_object %1$s ON %1$s.id = %4$s.pco_id
                          INNER JOIN ae.property_collection %2$s ON %2$s.id = %1$s.property_collection_id and %2$s.name = %3$L', pco_name, pc_name, pc_of_pco_filters, pcoo_name);
          rows_sql := rows_sql || sql;
          count_sql := count_sql || sql;
        ELSE
          -- filter directly by property_collection_object
          sql := format(' INNER JOIN ae.property_collection_object %1$s ON %1$s.object_id = object.id
                          INNER JOIN ae.property_collection %2$s ON %2$s.id = %1$s.property_collection_id and %2$s.name = %3$L', pco_name, pc_name, pc_of_pco_filters);
          rows_sql := rows_sql || sql;
          count_sql := count_sql || sql;
        END IF;
      END LOOP;
    END IF;
    -- join to filter by rcos
    IF cardinality(pcs_of_rco_filters) > 0 THEN
      FOREACH pc_of_rco_filters IN ARRAY pcs_of_rco_filters LOOP
        name1 := ae.remove_bad_chars (pc_of_rco_filters);
        pc_name2 := 'rpc_' || name1;
        rco_name := 'rco_' || name1;
        IF use_synonyms = TRUE THEN
          sql := format(' INNER JOIN ae.rco_of_object rcoo ON rcoo.object_id = object.id
                          INNER JOIN ae.relation %1$s ON %1$s.id = rcoo.rco_id
                          INNER JOIN ae.property_collection %2$s ON %2$s.id = %1$s.property_collection_id and %2$s.name = %3$L', rco_name, pc_name2, pc_of_rco_filters);
          rows_sql := rows_sql || sql;
          count_sql := count_sql || sql;
        ELSE
          -- filter directly by relation
          sql := format(' INNER JOIN ae.relation %1$s ON %1$s.object_id = object.id
                          INNER JOIN ae.property_collection %2$s ON %2$s.id = %1$s.property_collection_id and %2$s.name = %3$L', rco_name, pc_name2, pc_of_rco_filters);
          rows_sql := rows_sql || sql;
          count_sql := count_sql || sql;
        END IF;
      END LOOP;
    END IF;
    -- add where clauses
    -- for taxonomies
    sql := ' WHERE tax.name = ANY ($1)';
    rows_sql := rows_sql || sql;
    count_sql := count_sql || sql;
    -- include only objects with Taxonomie ID (exclude objects added for hierarchy)
    sql := format(' AND object.properties->>%L is not null', 'Taxonomie ID');
    rows_sql := rows_sql || sql;
    count_sql := count_sql || sql;
    IF cardinality(tax_filters) > 0 THEN
      FOREACH taxfilter IN ARRAY tax_filters LOOP
        IF taxfilter.comparator IN ('ILIKE', 'LIKE') THEN
          sql := format(' AND object.properties->>%1$L %2$s %3$L', taxfilter.pname, taxfilter.comparator, '%' || taxfilter.value || '%');
          rows_sql := rows_sql || sql;
          count_sql := count_sql || sql;
        ELSE
          sql := format(' AND object.properties->>%1$L %2$s %3$L', taxfilter.pname, taxfilter.comparator, taxfilter.value);
          rows_sql := rows_sql || sql;
          count_sql := count_sql || sql;
        END IF;
      END LOOP;
    END IF;
    -- add where clauses for pco_filters
    IF cardinality(pco_filters) > 0 THEN
      FOREACH pcofilter IN ARRAY pco_filters LOOP
        pco_name2 := 'pco_' || ae.remove_bad_chars (pcofilter.pcname);
        IF pcofilter.comparator IN ('ILIKE', 'LIKE') THEN
          sql := format(' AND %1$s.properties->>%2$L %3$s %4$L', pco_name2, pcofilter.pname, pcofilter.comparator, '%' || pcofilter.value || '%');
          rows_sql := rows_sql || sql;
          count_sql := count_sql || sql;
        ELSE
          sql := format(' AND %1$s.properties->>%2$L %3$s %4$L', pco_name2, pcofilter.pname, pcofilter.comparator, pcofilter.value);
          rows_sql := rows_sql || sql;
          count_sql := count_sql || sql;
        END IF;
      END LOOP;
    END IF;
    -- add where clauses for rco_filters
    IF cardinality(rco_filters) > 0 THEN
      FOREACH rcofilter IN ARRAY rco_filters LOOP
        rco_name2 := 'rco_' || ae.remove_bad_chars (rcofilter.pcname);
        IF rcofilter.comparator IN ('ILIKE', 'LIKE') THEN
          sql := format(' AND %1$s.properties->>%2$L %3$s %4$L', rco_name2, rcofilter.pname, rcofilter.comparator, '%' || rcofilter.value || '%');
          rows_sql := rows_sql || sql;
          count_sql := count_sql || sql;
        ELSE
          sql := format(' AND %1$s.properties->>%2$L %3$s %4$L', rco_name2, rcofilter.pname, rcofilter.comparator, rcofilter.value);
          rows_sql := rows_sql || sql;
          count_sql := count_sql || sql;
        END IF;
        sql := format(' AND %1$s.relation_type = %2$L', rco_name2, rcofilter.relationtype);
        rows_sql := rows_sql || sql;
        count_sql := count_sql || sql;
      END LOOP;
    END IF;
    --
    -- if object_ids were passed, only use them
    IF cardinality(object_ids) > 0 THEN
      sql := ' AND object.id = ANY ($2)';
      rows_sql := rows_sql || sql;
      count_sql := count_sql || sql;
    END IF;
    -- TODO: if sorting was passed, add it
    -- enable limiting for previews
    IF cardinality(sort_fields) > 0 THEN
      orderby_sql := ' ORDER BY';
      FOR i IN 1..array_upper(sort_fields, 1)
      LOOP
        sortfield := sort_fields[i];
        CASE sortfield.tname
        WHEN 'property_collection_object' THEN
          fieldname := ae.remove_bad_chars (sortfield.pcname || '__' || sortfield.pname);
        WHEN 'relation' THEN
          fieldname := ae.remove_bad_chars (sortfield.pcname || '__' || sortfield.relationtype || '__' || sortfield.pname);
        ELSE
          IF cardinality(taxonomies) > 1 THEN
              fieldname := 'taxonomie__' || ae.remove_bad_chars (sortfield.pname);
            ELSE
              fieldname := ae.remove_bad_chars (sortfield.pcname || '__' || sortfield.pname);
            END IF;
        END CASE;
        IF i = 1 THEN
          -- TODO: need to name the table as when setting the properties
          orderby_sql := orderby_sql || format(' %1$s %2$s', fieldname, sortfield.direction);
        ELSE
          orderby_sql := orderby_sql || format(', %1$s %2$s', fieldname, sortfield.direction);
        END IF;
      END LOOP;
      rows_sql := rows_sql || orderby_sql;
    END IF;
    IF count > 0 THEN
      rows_sql := rows_sql || ' LIMIT ' || count;
    END IF;
    -- prevent duplicates
    sql := ' ON CONFLICT DO NOTHING';
    rows_sql := rows_sql || sql;
    count_sql := count_sql || sql;
    -- create _tmp with all object_ids
    --RAISE EXCEPTION 'rows_sql: %:', rows_sql;
    EXECUTE rows_sql
    USING taxonomies, object_ids;
    EXECUTE count_sql
    USING taxonomies, object_ids;
    -- if 1 rco_property was passed and row_per_rco = TRUE, need to join for count
    IF cardinality(rco_properties) = 1 AND row_per_rco = TRUE THEN
      rcoproperty := rco_properties[1];
      IF use_synonyms = TRUE THEN
        count_count_sql := format('
            WITH properties_per_object as (
              SELECT
                ae.rco_of_object.object_id
              FROM ae.rco_of_object
                INNER JOIN ae.relation ON ae.relation.id = ae.rco_of_object.rco_id
                INNER JOIN ae.property_collection ON ae.property_collection.id = ae.relation.property_collection_id 
                INNER JOIN ae.object rel_object ON rel_object.id = ae.relation.object_id_relation
              WHERE
                ae.relation.relation_type = %2$L
                AND ae.property_collection.name = %1$L
            ) 
            SELECT 
              count(*)
            FROM 
              _tmp_count 
              LEFT JOIN properties_per_object on properties_per_object.object_id = _tmp_count.id', rcoproperty.pcname, rcoproperty.relationtype);
      ELSE
        count_count_sql := format('
            WITH properties_per_object as (
              SELECT
                ae.relation.object_id
              FROM ae.relation
                INNER JOIN ae.property_collection ON ae.property_collection.id = ae.relation.property_collection_id 
                INNER JOIN ae.object rel_object ON rel_object.id = ae.relation.object_id_relation
              WHERE
                ae.relation.relation_type = %2$L
                AND ae.property_collection.name = %1$L 
            ) 
            SELECT 
              count(*)
            FROM 
              _tmp_count 
              LEFT JOIN properties_per_object ON properties_per_object.object_id = _tmp_count.id', rcoproperty.pcname, rcoproperty.relationtype);
      END IF;
    ELSE
      count_count_sql := 'SELECT count(*) FROM _tmp_count';
    END IF;
    EXECUTE count_count_sql INTO row_count;
  END LOOP;
    -- add tax_fields as extra columns
    IF cardinality(tax_fields) > 0 THEN
      FOREACH taxfield IN ARRAY tax_fields LOOP
        -- several fieldnames exist in many taxonomies, so need not add taxonmy-name if multiple taxonomies are used
        -- if only one taxonomy is used, do add taxonomy-name
        IF cardinality(taxonomies) > 1 THEN
          fieldname := 'taxonomie__' || ae.remove_bad_chars (taxfield.pname);
        ELSE
          fieldname := ae.remove_bad_chars (taxonomies[1] || '__' || taxfield.pname);
        END IF;
        EXECUTE format('ALTER TABLE _tmp ADD COLUMN %I text', fieldname);
        EXECUTE format('UPDATE _tmp SET %1$s = (SELECT properties ->> %2$L FROM ae.object WHERE id = _tmp.id)', fieldname, taxfield.pname);
      END LOOP;
    END IF;
    -- add property fields as extra columns
    -- and insert values
    IF cardinality(pco_properties) > 0 THEN
      FOREACH pcoproperty IN ARRAY pco_properties LOOP
        fieldname := ae.remove_bad_chars (pcoproperty.pcname || '__' || pcoproperty.pname);
        EXECUTE format('ALTER TABLE _tmp ADD COLUMN %I text', fieldname);
        -- join for synonyms if used
        IF use_synonyms = TRUE THEN
          sql2 := format('
            UPDATE _tmp SET %1$s = (
            SELECT distinct on (pcoo.object_id) pco.properties ->> %2$L 
            FROM ae.pco_of_object pcoo
              INNER JOIN ae.property_collection_object pco on pco.id = pcoo.pco_id
              INNER JOIN ae.property_collection pc on pc.id = pco.property_collection_id and pc.name = %3$L
            WHERE 
              pcoo.object_id = _tmp.id)', fieldname, pcoproperty.pname, pcoproperty.pcname);
        ELSE
          sql2 := format('
            UPDATE _tmp SET %1$s = (
            SELECT properties ->> %2$L 
            FROM ae.property_collection_object pco 
            inner join ae.property_collection pc on pc.id = pco.property_collection_id and pc.name = %3$L
            WHERE pco.object_id = _tmp.id)', fieldname, pcoproperty.pname, pcoproperty.pcname);
        END IF;
        EXECUTE sql2;
      END LOOP;
    END IF;
    -- add rco-properties
    IF cardinality(rco_properties) > 0 THEN
      FOREACH rcoproperty IN ARRAY rco_properties LOOP
        -- field naming: pcname__relationtype__pname
        fieldname := ae.remove_bad_chars (rcoproperty.pcname || '__' || rcoproperty.relationtype || '__' || rcoproperty.pname);
        EXECUTE format('ALTER TABLE _tmp ADD COLUMN %I text', fieldname);
        -- join for synonyms if used
        -- deal with single/multiple rows if multiple relations exist
        -- only add rows if exactly one rco-property exists
        IF row_per_rco = TRUE AND cardinality(rco_properties) = 1 THEN
          -- create multiple rows
          -- query object_id, property
          -- inner join _tmp with query on object_id
          IF use_synonyms = TRUE THEN
            sql2 := format('
            WITH properties_per_object as (
              SELECT DISTINCT
                rcoo.object_id,
                rel_object.name || '' ('' || rel_object.id || ''): '' || (rco.properties ->> %2$L) AS %1$s
              FROM ae.rco_of_object rcoo
                INNER JOIN ae.relation rco ON rco.id = rcoo.rco_id
                INNER JOIN ae.property_collection pc ON pc.id = rco.property_collection_id 
                INNER JOIN ae.object rel_object ON rel_object.id = rco.object_id_relation
              WHERE
                rco.relation_type = %4$L
                AND pc.name = %3$L
            ) 
            SELECT 
              _tmp.*, 
              properties_per_object.%1$s 
            FROM 
              _tmp 
              LEFT JOIN properties_per_object on properties_per_object.object_id = _tmp.id', fieldname, rcoproperty.pname, rcoproperty.pcname, rcoproperty.relationtype);
          ELSE
            sql2 := format('
            WITH properties_per_object as (
              SELECT DISTINCT
                rco.object_id,
                rel_object.name || '' ('' || rel_object.id || ''): '' || (rco.properties ->> %2$L) AS %1$s
              FROM ae.relation rco
                INNER JOIN ae.property_collection pc ON pc.id = rco.property_collection_id 
                INNER JOIN ae.object rel_object ON rel_object.id = rco.object_id_relation
              WHERE
                rco.relation_type = %4$L
                AND pc.name = %3$L 
            ) 
            SELECT 
              _tmp.*, 
              properties_per_object.%1$s 
            FROM 
              _tmp 
              LEFT JOIN properties_per_object ON properties_per_object.object_id = _tmp.id
            %5$s', fieldname, rcoproperty.pname, rcoproperty.pcname, rcoproperty.relationtype, orderby_sql);
          END IF;
          -- return query
          return_query := format('
            SELECT
              json_agg(ROW)
            FROM
              (%1$s) row', sql2);
          -- IF count > 0 THEN
          --   return_query := return_query || ' LIMIT ' || count;
          -- END IF;
        ELSE
          IF use_synonyms = TRUE THEN
            sql2 := format('
            UPDATE _tmp SET %1$s = (
              SELECT distinct
                string_agg(rel_object.name || '' ('' || rel_object.id || ''): '' || (rco.properties ->> %2$L), '' | '' ORDER BY (rco.properties ->> %2$L))
              FROM ae.rco_of_object rcoo
                INNER JOIN ae.relation rco on rco.id = rcoo.rco_id
                INNER JOIN ae.property_collection pc on pc.id = rco.property_collection_id and pc.name = %3$L
                INNER JOIN ae.object rel_object ON rel_object.id = rco.object_id_relation
              WHERE
                rco.object_id = _tmp.id
                AND rco.relation_type = %4$L 
              GROUP BY rco.object_id)', fieldname, rcoproperty.pname, rcoproperty.pcname, rcoproperty.relationtype);
          ELSE
            sql2 := format(' UPDATE
              _tmp
            SET
              %1$s = (
                SELECT distinct
                  string_agg(rel_object.name || '' ('' || rel_object.id || ''): '' || (rco.properties ->> %2$L), '' | '' ORDER BY (rco.properties ->> %2$L))
                FROM ae.relation rco
                  INNER JOIN ae.property_collection pc ON pc.id = rco.property_collection_id
                  INNER JOIN ae.object rel_object ON rel_object.id = rco.object_id_relation
                WHERE
                  rco.object_id = _tmp.id
                  AND rco.relation_type = %4$L 
                  AND pc.name = %3$L 
                GROUP BY rco.object_id)', fieldname, rcoproperty.pname, rcoproperty.pcname, rcoproperty.relationtype);
          END IF;
        END IF;
        EXECUTE sql2;
      END LOOP;
    END IF;
    -- RAISE EXCEPTION 'taxonomies: %, tax_fields: %, tax_filters: %, pco_filters: %, pcs_of_pco_filters: %, pco_properties: %, use_synonyms: %, count: %, object_ids: %, rows_sql: %, fieldname: %, taxfield_sql2: %', taxonomies, tax_fields, tax_filters, pco_filters, pcs_of_pco_filters, pco_properties, use_synonyms, count, object_ids, rows_sql, fieldname, taxfield_sql2;
    --RAISE EXCEPTION 'rows_sql: %:', rows_sql;
    return_data.id := gen_random_uuid ()::uuid;
    return_data.count = row_count;
    -- TODO: sort
    IF row_per_rco = TRUE AND cardinality(rco_properties) = 1 THEN
      EXECUTE return_query INTO return_data.export_data;
    ELSE
      return_query := '
      SELECT
        json_agg(ROW)
      FROM
        _tmp ROW';
      EXECUTE return_query INTO return_data.export_data;
    END IF;
    RETURN return_data;
    -- DROP TABLE _tmp; TODO: re-enable
    -- DROP TABLE _tmp_count; TODO: re-enable
END
$$
LANGUAGE plpgsql;

ALTER FUNCTION ae.export_all (taxonomies text[], tax_fields tax_field[], tax_filters tax_filter[], pco_filters pco_filter[], pcs_of_pco_filters text[], pcs_of_rco_filters text[], pco_properties pco_property[], rco_filters rco_filter[], rco_properties rco_property[], use_synonyms boolean, count integer, object_ids uuid[], row_per_rco boolean, sort_fields sort_field[]) OWNER TO postgres;

-- test from grqphiql:
-- mutation exportDataMutation($taxonomies: [String]!, $taxFields: [TaxFieldInput]!, $taxFilters: [TaxFilterInput]!, $pcoFilters: [PcoFilterInput]!, $pcsOfPcoFilters: [String]!, $pcsOfRcoFilters: [String]!, $pcoProperties: [PcoPropertyInput]!, $rcoFilters: [RcoFilterInput]!, $rcoProperties: [RcoPropertyInput]!, $useSynonyms: Boolean!, $count: Int!, $objectIds: [UUID]!) {
--   export(
--     input: {taxonomies: $taxonomies, taxFields: $taxFields, taxFilters: $taxFilters, pcoFilters: $pcoFilters, pcsOfPcoFilters: $pcsOfPcoFilters, pcsOfRcoFilters: $pcsOfRcoFilters, pcoProperties: $pcoProperties, rcoFilters: $rcoFilters, rcoProperties: $rcoProperties, useSynonyms: $useSynonyms, count: $count, objectIds: $objectIds}
--   ) {
--     exportRows {
--       id
--       properties
--     }
--   }
-- }
--
-- variables:
-- {
--   "taxonomies": [
--     "SISF (2005)",
--     "DB-Taxref (2017)"
--   ],
--   "taxFields": [
--     {
--       "pname": "Artname vollständig",
--       "taxname": "SISF (2005)"
--     }
--   ],
--   "taxFilters": [
--     {
--       "comparator": "ILIKE",
--       "pname": "Art",
--       "taxname": "SISF (2005)",
--       "value": "el"
--     }
--   ],
--   "pcoFilters": [
--     {
--       "pcname": "CH OeQV",
--       "pname": "Art ist Qualitätszeiger Liste A",
--       "comparator": "=",
--       "value": "true"
--     }
--   ],
--   "pcsOfPcoFilters": [
--     "CH OeQV"
--   ],
--   "pcsOfRcoFilters": ["ZH AP FM (2010)"],
--   "pcoProperties": [
--     {
--       "pcname": "CH OeQV",
--       "pname": "Art ist Qualitätszeiger Liste A"
--     }
--   ],
--   "rcoFilters": [
--   {
--     "pcname": "ZH AP FM (2010)",
--     "pname": "Biotopbindung",
--     "relationtype": "Art ist an Lebensraum gebunden",
--     "value": "2",
--     "comparator": "="
--   }
-- ],
--   "rcoProperties": [
--   {
--     "pcname": "ZH AP FM (2010)",
--     "pname": "Biotopbindung",
--     "relationtype": "Art ist an Lebensraum gebunden"
--   }
-- ],
--   "useSynonyms": false,
--   "count": 0,
--   "objectIds": []
-- }
