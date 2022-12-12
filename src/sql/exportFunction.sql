--
-- example for querying pco for pco_field with pco_filter
-- with or without info of synonyms
SELECT
  ae.object.*
FROM
  ae.object
  INNER JOIN ae.taxonomy ON ae.taxonomy.id = ae.object.taxonomy_id
  -- if: with info of synonyms
  -- INNER JOIN ae.pco_of_object pcoo ON pcoo.object_id = ae.object.id
  -- INNER JOIN ae.property_collection_object pco ON pco.id = pcoo.pco_id
  -- INNER JOIN ae.property_collection pc ON pc.id = pco.property_collection_id
  -- if: without info of synonyms
  INNER JOIN ae.property_collection_object pco ON pco.object_id = ae.object.id
  INNER JOIN ae.property_collection pc ON pc.id = pco.property_collection_id
WHERE
  ae.taxonomy.name IN ('SISF (2005)')
  AND ae.object.properties ->> 'Artname vollständig' ILIKE '%rosa%'
  AND (pc.name = 'CH OeQV'
    AND pco.properties ->> 'Art ist Qualitätszeiger Liste A' = 'true');

-- Idea:
-- 0. get the following info passed from app:
--    - taxonomies (minimum one)
--    - taxFilters (optional, default: [])
--    - pcoFilters (optional, default: [])
--    - taxFields (optional, default: [])
--    - pcoFields (optional, default: [])
--    - useSynonyms (optional, default: true)
--    - onlyRowsWithProperties (optional, default: true. Is only relevant if no pco-filters were passed.
--                             TODO: IS THIS USEFUL? Nope: user may receive filtered list without realizing it...)
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
-- TODO: add relation collections?
-- TODO: how to efficiently handle previews? Sort by object_id and limit to 15?
--
-- alternative idea with temporary table and record: (https://stackoverflow.com/a/23957098/712005)
-- 1. create temporary table _tmp with column id
-- 2. for every taxonomy: select list of object_ids and tax-fields choosen while applying all filters: insert into _tmp. Limit if count was passed
-- 3. for every pc with fields choosen: add column to _tmp, then update it with above query
-- 4. select _tmp into record and return it
-- 5. TODO: how to query unknown structure with graphql? Use id and jsonb instead?
--
-- alternative idea using id and jsonb:
-- 0. define type as (id uuid, properties json)
-- 1. create temporary table _tmp with column id
-- 2. for every taxonomy: select list of object_ids and tax-fields choosen while applying all filters: insert into _tmp. Limit if count was passed
-- 3. for every pc with fields choosen: add column to _tmp, then update it with above query
-- 4. select _tmp into record and return it
-- 5. TODO: how to query unknown structure with graphql? Use id and json instead?
--    Build directly in json or convert _tmp using to_jsonb or row_to_json, then removing id using jsonb - text → jsonb?
--    Or: build _only_ json by using row_to_json. Then client reads that.
--    (https://www.postgresql.org/docs/14/functions-json.html, https://www.postgresql.org/docs/current/functions-json.html#FUNCTIONS-JSONB-OP-TABLE)
CREATE TYPE ae.export_row AS (
  id uuid,
  properties json
);

CREATE TYPE tax_field AS (
  fieldname text,
  taxname text
);

--
-- need to use a record type or jsonb, as there exists no predefined structure
-- docs: https://www.postgresql.org/docs/15/plpgsql-declarations.html#PLPGSQL-DECLARATION-RECORDS
CREATE OR REPLACE FUNCTION ae.export (taxonomies text[], tax_fields tax_field[], tax_filters tax_filter[], pco_filters pco_filter[], pcs_of_pco_filters text[], pcs_of_rco_filters text[], pco_properties pco_property[], rco_filters rco_filter[], rco_properties rco_property[], use_synonyms boolean, count integer, object_ids uuid[], line_per_rco boolean)
  RETURNS SETOF ae.export_row
  AS $$
DECLARE
  taxonomy text;
  tax_sql text;
  sql2 text;
  taxfilter tax_filter;
  taxfield tax_field;
  pcofilter pco_filter;
  rcofilter rco_filter;
  pc_of_pco_filters text;
  pc_of_rco_filters text;
  name1 text;
  name2 text;
  name3 text;
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
  taxfield_sql text;
  taxfield_sql2 text;
  object_id uuid;
  return_query text;
BEGIN
  -- create table
  DROP TABLE IF EXISTS _tmp;
  CREATE TEMPORARY TABLE _tmp (
    id uuid PRIMARY KEY
  );
  -- insert object_ids
  FOREACH taxonomy IN ARRAY taxonomies LOOP
    -- select
    tax_sql := 'INSERT INTO _tmp (id) select object.id from ae.object object';
    -- join
    tax_sql := tax_sql || ' inner join ae.taxonomy tax on tax.id = object.taxonomy_id';
    -- join to filter by pcos
    IF cardinality(pcs_of_pco_filters) > 0 THEN
      FOREACH pc_of_pco_filters IN ARRAY pcs_of_pco_filters LOOP
        name1 := trim(replace(replace(replace(LOWER(pc_of_pco_filters), ' ', '_'), '(', ''), ')', ''));
        pc_name := 'pc_' || name1;
        pco_name := 'pco_' || name1;
        pcoo_name := 'pcoo_' || name1;
        IF use_synonyms = TRUE THEN
          -- if synonyms are used, filter pcos via pco_of_object
          tax_sql := tax_sql || format(' INNER JOIN ae.pco_of_object %4$s ON %4$s.object_id = object.id
                                INNER JOIN ae.property_collection_object %1$s ON %1$s.id = %4$s.pco_id
                                INNER JOIN ae.property_collection %2$s ON %2$s.id = %1$s.property_collection_id and %2$s.name = %3$L', pco_name, pc_name, pc_of_pco_filters, pcoo_name);
        ELSE
          -- filter directly by property_collection_object
          tax_sql := tax_sql || format(' INNER JOIN ae.property_collection_object %1$s ON %1$s.object_id = object.id
                                INNER JOIN ae.property_collection %2$s ON %2$s.id = %1$s.property_collection_id and %2$s.name = %3$L', pco_name, pc_name, pc_of_pco_filters);
        END IF;
      END LOOP;
    END IF;
    -- join to filter by rcos
    IF cardinality(pcs_of_rco_filters) > 0 THEN
      FOREACH pc_of_rco_filters IN ARRAY pcs_of_rco_filters LOOP
        name1 := trim(replace(replace(replace(LOWER(pc_of_rco_filters), ' ', '_'), '(', ''), ')', ''));
        pc_name2 := 'rpc_' || name1;
        rco_name := 'rco_' || name1;
        IF use_synonyms = TRUE THEN
          tax_sql := tax_sql || format(' INNER JOIN ae.rco_of_object rcoo ON rcoo.object_id = object.id
                                INNER JOIN ae.relation %1$s ON %1$s.id = rcoo.rco_id
                                INNER JOIN ae.property_collection %2$s ON %2$s.id = %1$s.property_collection_id and %2$s.name = %3$L', rco_name, pc_name2, pc_of_rco_filters);
        ELSE
          -- filter directly by relation
          tax_sql := tax_sql || format(' INNER JOIN ae.relation %1$s ON %1$s.object_id = object.id
                                INNER JOIN ae.property_collection %2$s ON %2$s.id = %1$s.property_collection_id and %2$s.name = %3$L', rco_name, pc_name2, pc_of_rco_filters);
        END IF;
      END LOOP;
    END IF;
    -- add where clauses
    -- for taxonomies
    tax_sql := tax_sql || ' WHERE tax.name = ANY ($1)';
    IF cardinality(tax_filters) > 0 THEN
      FOREACH taxfilter IN ARRAY tax_filters LOOP
        IF taxfilter.comparator IN ('ILIKE', 'LIKE') THEN
          tax_sql := tax_sql || format(' AND object.properties->>%1$L %2$s ''%%3$s%''', taxfilter.pname, taxfilter.comparator, taxfilter.value);
        ELSE
          tax_sql := tax_sql || format(' AND object.properties->>%1$L %2$s 3$L', taxfilter.pname, taxfilter.comparator, taxfilter.value);
        END IF;
      END LOOP;
    END IF;
    -- add where clauses for pco_filters
    IF cardinality(pco_filters) > 0 THEN
      FOREACH pcofilter IN ARRAY pco_filters LOOP
        name2 := trim(replace(replace(replace(LOWER(pcofilter.pcname), ' ', '_'), '(', ''), ')', ''));
        pco_name2 := 'pco_' || name2;
        IF pcofilter.comparator IN ('ILIKE', 'LIKE') THEN
          tax_sql := tax_sql || format(' AND %1$s.properties->>%2$L %3$s ''%%4$s%''', pco_name2, pcofilter.pname, pcofilter.comparator, pcofilter.value);
        ELSE
          tax_sql := tax_sql || format(' AND %1$s.properties->>%2$L %3$s 4$L', pco_name2, pcofilter.pname, pcofilter.comparator, pcofilter.value);
        END IF;
      END LOOP;
    END IF;
    -- add where clauses for rco_filters
    IF cardinality(rco_filters) > 0 THEN
      FOREACH rcofilter IN ARRAY rco_filters LOOP
        name3 := trim(replace(replace(replace(LOWER(rcofilter.pcname), ' ', '_'), '(', ''), ')', ''));
        rco_name2 := 'rco_' || name3;
        IF rcofilter.comparator IN ('ILIKE', 'LIKE') THEN
          tax_sql := tax_sql || format(' AND %1$s.properties->>%2$L %3$s ''%%4$s%''', rco_name2, rcofilter.pname, rcofilter.comparator, rcofilter.value);
        ELSE
          tax_sql := tax_sql || format(' AND %1$s.properties->>%2$L %3$s %4$L', rco_name2, rcofilter.pname, rcofilter.comparator, rcofilter.value);
        END IF;
        tax_sql := tax_sql || format(' AND %1$s.relation_type = %2$L', rco_name2, rcofilter.relationtype);
      END LOOP;
    END IF;
    --
    -- if object_ids were passed, only use them
    IF cardinality(object_ids) > 0 THEN
      tax_sql := tax_sql || ' AND object.id = ANY ($2)';
    END IF;
    -- enable limiting for previews
    IF count > 0 THEN
      tax_sql := tax_sql || ' LIMIT ' || count;
    END IF;
    -- prevent duplicates
    tax_sql := tax_sql || ' ON CONFLICT DO NOTHING';
    -- create _tmp with all object_ids
    EXECUTE tax_sql
    USING taxonomies, object_ids;
  END LOOP;
    -- add tax_fields as extra columns
    IF cardinality(tax_fields) > 0 THEN
      FOREACH taxfield IN ARRAY tax_fields LOOP
        -- several fieldnames exist in many taxonomies, so need not add taxonmy-name if multiple taxonomies are used
        -- if only one taxonomy is used, do add taxonomy-name
        IF cardinality(taxonomies) > 1 THEN
          fieldname := 'taxonomie__' || replace(LOWER(taxfield.fieldname), ' ', '_');
        ELSE
          fieldname := trim(replace(replace(replace(LOWER(taxonomies[1]), ' ', '_'), '(', ''), ')', '')) || '__' || trim(replace(LOWER(taxfield.fieldname), ' ', '_'));
        END IF;
        EXECUTE format('ALTER TABLE _tmp ADD COLUMN %I text', fieldname);
        -- EXECUTE 'ALTER TABLE _tmp ADD COLUMN $1 text'
        -- USING fieldname;
        EXECUTE format('UPDATE _tmp SET %1$s = (SELECT properties ->> %2$L FROM ae.object WHERE id = _tmp.id)', fieldname, taxfield.fieldname);
      END LOOP;
    END IF;
    -- add property fields as extra columns
    -- and insert values
    IF cardinality(pco_properties) > 0 THEN
      FOREACH pcoproperty IN ARRAY pco_properties LOOP
        fieldname := trim(replace(replace(replace(LOWER(pcoproperty.pcname), ' ', '_'), '(', ''), ')', '')) || '__' || trim(replace(replace(replace(LOWER(pcoproperty.pname), ' ', '_'), '(', ''), ')', ''));
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
        fieldname := trim(replace(replace(replace(LOWER(rcoproperty.pcname), ' ', '_'), '(', ''), ')', '')) || '__' || trim(replace(replace(replace(LOWER(rcoproperty.relationtype), ' ', '_'), '(', ''), ')', '')) || '__' || trim(replace(replace(replace(LOWER(rcoproperty.pname), ' ', '_'), '(', ''), ')', ''));
        EXECUTE format('ALTER TABLE _tmp ADD COLUMN %I text', fieldname);
        -- join for synonyms if used
        -- TODO: deal with single/multiple rows if multiple relations exist
        -- only add rows if exactly one rco-property exists
        IF line_per_rco = TRUE AND cardinality(rco_properties) = 1 THEN
          -- create multiple rows
          -- query _tmp.* while adding rco-property, grouping over id and rco-property
          -- return this query
          -- or:
          -- add column row_number
          -- insert extra rows, setting row_number value
          --
          IF use_synonyms = TRUE THEN
            sql2 := format('
            SELECT 
              _tmp.*,
              string_agg(rel_object.name || '' ('' || rel_object.id || ''): '' || (rco.properties ->> %2$L), '' | '' ORDER BY (rco.properties ->> %2$L)) as %1$s,
              () as %1$s
            FROM _tmp
              inner join ae.rco_of_object rcoo on rcoo.object_id = _tmp.id
              INNER JOIN ae.relation rco on rco.id = rcoo.rco_id
              INNER JOIN ae.property_collection pc on pc.id = rco.property_collection_id 
              INNER JOIN ae.object rel_object ON rel_object.id = rco.object_id_relation
            WHERE
              rco.object_id = _tmp.id
              AND rco.relation_type = %4$L
              and pc.name = %3$L 
            GROUP BY 
              _tmp.id, 
              rco.properties ->> %2$L', fieldname, rcoproperty.pname, rcoproperty.pcname, rcoproperty.relationtype);
          ELSE
            sql2 := format(' UPDATE
              _tmp
            SET
              SELECT
                _tmp.*,
                string_agg(rel_object.name || '' ('' || rel_object.id || ''): '' || (rco.properties ->> %2$L), '' | '' ORDER BY (rco.properties ->> %2$L)) as %1$s
              FROM _tmp
              inner join ae.relation rco on rco.object_id = _tmp.id
              INNER JOIN ae.property_collection pc ON pc.id = rco.property_collection_id
              INNER JOIN ae.object rel_object ON rel_object.id = rco.object_id_relation
              WHERE
                rco.object_id = _tmp.id
                AND rco.relation_type = %4$L 
                AND pc.name = %3$L 
              GROUP BY 
              _tmp.id, 
              rco.properties ->> %2$L', fieldname, rcoproperty.pname, rcoproperty.pcname, rcoproperty.relationtype);
          END IF;
          -- return query
          return_query := format('
            SELECT
              row.id,
              row_to_json(ROW) AS properties
            FROM
              (%1$s) row', sql2);
        ELSE
          IF use_synonyms = TRUE THEN
            sql2 := format('
            UPDATE _tmp SET %1$s = (
              SELECT 
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
                SELECT
                  string_agg(rel_object.name || '' ('' || rel_object.id || ''): '' || (rco.properties ->> %2$L), '' | '' ORDER BY (rco.properties ->> %2$L))
                FROM ae.relation rco
                INNER JOIN ae.property_collection pc ON pc.id = rco.property_collection_id
                  AND pc.name = %3$L
                INNER JOIN ae.object rel_object ON rel_object.id = rco.object_id_relation
                WHERE
                  rco.object_id = _tmp.id
                  AND rco.relation_type = %4$L 
                GROUP BY rco.object_id)', fieldname, rcoproperty.pname, rcoproperty.pcname, rcoproperty.relationtype);
          END IF;
        END IF;
        EXECUTE sql2;
      END LOOP;
    END IF;
    -- RAISE EXCEPTION 'taxonomies: %, tax_fields: %, tax_filters: %, pco_filters: %, pcs_of_pco_filters: %, pco_properties: %, use_synonyms: %, count: %, object_ids: %, tax_sql: %, fieldname: %, taxfield_sql2: %', taxonomies, tax_fields, tax_filters, pco_filters, pcs_of_pco_filters, pco_properties, use_synonyms, count, object_ids, tax_sql, fieldname, taxfield_sql2;
    --RAISE EXCEPTION 'tax_sql: %:', tax_sql;
    IF line_per_rco = TRUE AND cardinality(rco_properties) = 1 THEN
      RETURN QUERY EXECUTE return_query;
    ELSE
      RETURN QUERY
      SELECT
        row.id,
        row_to_json(ROW) AS properties
      FROM
        _tmp ROW;
    END IF;
    DROP TABLE _tmp;
END
$$
LANGUAGE plpgsql;

ALTER FUNCTION ae.export (taxonomies text[], tax_fields tax_field[], tax_filters tax_filter[], pco_filters pco_filter[], pcs_of_pco_filters text[], pcs_of_rco_filters text[], pco_properties pco_property[], rco_filters rco_filter[], rco_properties rco_property[], use_synonyms boolean, count integer, object_ids uuid[], line_per_rco boolean) OWNER TO postgres;

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
--       "fieldname": "Artname vollständig",
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
