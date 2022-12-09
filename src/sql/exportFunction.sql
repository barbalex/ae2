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
CREATE OR REPLACE FUNCTION ae.export (taxonomies text[], tax_fields tax_field[], tax_filters tax_filter[], pco_filters pco_filter[], pcs_of_pco_filters text[], pcs_of_rco_filters text[], pco_properties pco_property[], rco_filters rco_filter[], rco_properties rco_property[], use_synonyms boolean, count integer, object_ids uuid[])
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
  pco_name2 text;
  rco_name text;
  rco_name2 text;
  pcoproperty pco_property;
  tmprow record;
  tmprow2 record;
  object record;
  fieldname text;
  taxfield_sql text;
  taxfield_sql2 text;
  object_id uuid;
BEGIN
  -- create table
  DROP TABLE IF EXISTS _tmp;
  -- TODO: redeclare temporary
  CREATE TABLE _tmp (
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
        IF use_synonyms = TRUE THEN
          -- if synonyms are used, filter pcos via pco_of_object
          tax_sql := tax_sql || format(' INNER JOIN ae.pco_of_object pcoo ON pcoo.object_id = object.id
                                INNER JOIN ae.property_collection_object %1$s ON %1$s.id = pcoo.pco_id
                                INNER JOIN ae.property_collection %2$s ON %2$s.id = %1$s.property_collection_id', pco_name, pc_name);
        ELSE
          -- filter directly by property_collection_object
          tax_sql := tax_sql || format(' INNER JOIN ae.property_collection_object %1$s ON %1$s.object_id = object.id
                                INNER JOIN ae.property_collection %2$s ON %2$s.id = %1$s.property_collection_id', pco_name, pc_name);
        END IF;
      END LOOP;
    END IF;
    -- TODO:
    -- join to filter by rcos
    IF cardinality(pcs_of_rco_filters) > 0 THEN
      FOREACH pc_of_rco_filters IN ARRAY pcs_of_rco_filters LOOP
        name1 := trim(replace(replace(replace(LOWER(pc_of_rco_filters), ' ', '_'), '(', ''), ')', ''));
        pc_name2 := 'rpc_' || name1;
        rco_name := 'rco_' || name1;
        IF use_synonyms = TRUE THEN
          -- TODO: if synonyms are used, filter rcos via rco_of_object
          tax_sql := tax_sql || ' INNER JOIN ae.rco_of_object rcoo ON rcoo.object_id = object.id
                                INNER JOIN ae.relation ' || quote_ident(rco_name) || ' ON ' || quote_ident(rco_name) || '.id = rcoo.rco_id
                                INNER JOIN ae.property_collection ' || quote_ident(pc_name2) || ' ON ' || quote_ident(pc_name2) || '.id = ' || quote_ident(rco_name) || '.property_collection_id';
        ELSE
          -- filter directly by relation
          tax_sql := tax_sql || ' INNER JOIN ae.relation ' || quote_ident(rco_name) || ' ON ' || quote_ident(rco_name) || '.object_id = object.id
                                INNER JOIN ae.property_collection ' || quote_ident(pc_name2) || ' ON ' || quote_ident(pc_name2) || '.id = ' || quote_ident(rco_name) || '.property_collection_id';
        END IF;
      END LOOP;
    END IF;
    -- add where clauses
    -- for taxonomies
    tax_sql := tax_sql || ' WHERE tax.name = ANY ($1)';
    IF cardinality(tax_filters) > 0 THEN
      FOREACH taxfilter IN ARRAY tax_filters LOOP
        IF taxfilter.comparator IN ('ILIKE', 'LIKE') THEN
          tax_sql := tax_sql || ' AND object.properties->>' || quote_literal(taxfilter.pname) || ' ' || taxfilter.comparator || ' ' || quote_literal('%' || taxfilter.value || '%');
        ELSE
          tax_sql := tax_sql || ' AND object.properties->>' || quote_literal(taxfilter.pname) || ' ' || taxfilter.comparator || ' ' || quote_literal(taxfilter.value);
        END IF;
      END LOOP;
    END IF;
    -- add where clauses for pco_filters
    IF cardinality(pco_filters) > 0 THEN
      FOREACH pcofilter IN ARRAY pco_filters LOOP
        name2 := trim(replace(replace(replace(LOWER(pcofilter.pcname), ' ', '_'), '(', ''), ')', ''));
        pco_name2 := 'pco_' || name2;
        IF pcofilter.comparator IN ('ILIKE', 'LIKE') THEN
          tax_sql := tax_sql || ' AND ' || quote_ident(pco_name2) || '.properties->>' || quote_literal(pcofilter.pname) || ' ' || pcofilter.comparator || ' ' || quote_literal('%' || pcofilter.value::text || '%');
        ELSE
          tax_sql := tax_sql || ' AND ' || quote_ident(pco_name2) || '.properties->>' || quote_literal(pcofilter.pname) || ' ' || pcofilter.comparator || ' ' || quote_literal(pcofilter.value::text);
        END IF;
      END LOOP;
    END IF;
    -- add where clauses for rco_filters
    IF cardinality(rco_filters) > 0 THEN
      FOREACH rcofilter IN ARRAY rco_filters LOOP
        name3 := trim(replace(replace(replace(LOWER(rcofilter.pcname), ' ', '_'), '(', ''), ')', ''));
        rco_name2 := 'rco_' || name3;
        IF rcofilter.comparator IN ('ILIKE', 'LIKE') THEN
          tax_sql := tax_sql || ' AND ' || quote_ident(rco_name2) || '.properties->>' || quote_literal(rcofilter.pname) || ' ' || rcofilter.comparator || ' ' || quote_literal('%' || rcofilter.value::text || '%');
        ELSE
          tax_sql := tax_sql || ' AND ' || quote_ident(rco_name2) || '.properties->>' || quote_literal(rcofilter.pname) || ' ' || rcofilter.comparator || ' ' || quote_literal(rcofilter.value::text);
        END IF;
        tax_sql := tax_sql || ' AND ' || quote_ident(rco_name2) || '.relation_type = ' || quote_literal(rcofilter.relationtype);
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
    -- add tax_fields in properties
    -- this always returns an error, no mather how many hours are put into it
    -- FOREACH taxfield IN ARRAY tax_fields LOOP
    --   FOR tmprow IN
    --   SELECT
    --     *
    --   FROM
    --     _tmp LOOP
    --       EXECUTE format('UPDATE _tmp SET properties = jsonb_set(properties, %1$L, (SELECT properties ->> %2$L FROM ae.object WHERE id = %3$L)::jsonb)', ARRAY[quote_literal(taxfield.fieldname)], taxfield.fieldname, tmprow.id);
    --     END LOOP;
    -- END LOOP;
    -- add tax_fields as extra columns
    -- TODO: when filtering for rco, value is always same
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
    IF cardinality(pco_properties) > 0 THEN
      FOREACH pcoproperty IN ARRAY pco_properties LOOP
        fieldname := trim(replace(replace(replace(LOWER(pcoproperty.pcname), ' ', '_'), '(', ''), ')', '')) || '__' || trim(replace(LOWER(pcoproperty.pname), ' ', '_'));
        EXECUTE format('ALTER TABLE _tmp ADD COLUMN %I text', fieldname);
        name1 := trim(replace(replace(replace(LOWER(pcoproperty.pcname), ' ', '_'), '(', ''), ')', ''));
        pc_name := 'pc_' || name1;
        pco_name := 'pco_' || name1;
        -- TODO: join for synonyms if used
        IF use_synonyms = TRUE THEN
          sql2 := format('
            UPDATE _tmp SET %1$s = (
            SELECT distinct on (pcoo.object_id) pco.properties ->> %2$L 
            FROM ae.pco_of_object pcoo
              INNER JOIN ae.property_collection_object pco on pco.id = pcoo.pco_id
              INNER JOIN ae.property_collection pc on pc.id = pco.property_collection_id
            WHERE 
              pcoo.object_id = _tmp.id and pc.name = %3$L)', fieldname, pcoproperty.pname, pcoproperty.pcname);
        ELSE
          sql2 := format('
            UPDATE _tmp SET %1$s = (
            SELECT properties ->> %2$L 
            FROM ae.property_collection_object pco 
            inner join ae.property_collection pc on pc.id = pco.property_collection_id 
            WHERE pco.object_id = _tmp.id and pc.name = %3$L)', fieldname, pcoproperty.pname, pcoproperty.pcname);
        END IF;
        EXECUTE sql2;
      END LOOP;
    END IF;
    -- TODO: add rco-properties
    -- RAISE EXCEPTION 'taxonomies: %, tax_fields: %, tax_filters: %, pco_filters: %, pcs_of_pco_filters: %, pco_properties: %, use_synonyms: %, count: %, object_ids: %, tax_sql: %, fieldname: %, taxfield_sql2: %', taxonomies, tax_fields, tax_filters, pco_filters, pcs_of_pco_filters, pco_properties, use_synonyms, count, object_ids, tax_sql, fieldname, taxfield_sql2;
    --RAISE EXCEPTION 'tax_sql: %:', tax_sql;
    RETURN QUERY
    SELECT
      row.id,
      row_to_json(ROW) AS properties
    FROM
      _tmp ROW;
    -- DROP TABLE _tmp;
END
$$
LANGUAGE plpgsql;

-- fehlerhafte Arraykonstante: »)«
ALTER FUNCTION ae.export (taxonomies text[], tax_fields tax_field[], tax_filters tax_filter[], pco_filters pco_filter[], pcs_of_pco_filters text[], pcs_of_rco_filters text[], pco_properties pco_property[], rco_filters rco_filter[], rco_properties rco_property[], use_synonyms boolean, count integer, object_ids uuid[]) OWNER TO postgres;

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
--     {
--       "comparator": "ILIKE",
--       "pcname": "ZH AP FM (2010)",
--       "pname": "Biotopbindung",
--       "relationtype": "Art ist an Lebensraum gebunden",
--       "value": "2"
--     }
--   ],
--   "rcoProperties": [
--     {
--       "pcname": "ZH AP FM (2010)",
--       "pname": "Biotopbindung",
--       "relationtype": "Art ist an Lebensraum gebunden"
--     }
--   ],
--   "useSynonyms": false,
--   "count": 0,
--   "objectIds": []
-- }
