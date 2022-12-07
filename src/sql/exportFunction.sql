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
  properties jsonb
);

CREATE TYPE tax_field AS (
  fieldname text,
  taxname text
);

--
-- need to use a record type or jsonb, as there exists no predefined structure
-- docs: https://www.postgresql.org/docs/15/plpgsql-declarations.html#PLPGSQL-DECLARATION-RECORDS
CREATE OR REPLACE FUNCTION ae.export (taxonomies text[], tax_fields tax_field[], tax_filters tax_filter[], pco_filters pco_filter[], pcs_of_pco_filters text[], pco_properties pco_property[], use_synonyms boolean, count integer, object_ids uuid[])
  RETURNS SETOF ae.export_row
  AS $$
DECLARE
  taxonomy text;
  tax_sql text;
  taxfilter tax_filter;
  taxfield tax_field;
  pcofilter pco_filter;
  pc_of_pco_filters text;
  name text;
  pc_name text;
  pco_name text;
  pcoproperty pco_property;
  tmprow record;
  object record;
BEGIN
  -- create table
  DROP TABLE IF EXISTS _temp;
  CREATE TEMPORARY TABLE _tmp (
    id uuid,
    properties jsonb
  );
  -- insert object_ids
  FOREACH taxonomy IN ARRAY taxonomies LOOP
    -- select
    tax_sql := 'INSERT INTO _tmp (id) select object.id from ae.object object';
    -- join
    tax_sql := tax_sql || ' inner join ae.taxonomy tax on tax.id = object.taxonomy_id';
    -- join to filter by pcos
    FOREACH pc_of_pco_filters IN ARRAY pcs_of_pco_filters LOOP
      name := replace(replace(replace(pc_of_pco_filters, ' ', ''), '(', ''), ')', '');
      pc_name := quote_ident('pc_' || name);
      pco_name := quote_ident('pco_' || name);
      IF use_synonyms = TRUE THEN
        -- if synonyms are used, filter pcos via pco_of_object
        tax_sql := tax_sql || ' INNER JOIN ae.pco_of_object pcoo ON pcoo.object_id = object.id
                                INNER JOIN ae.property_collection_object ' || pco_name || ' ON ' || pco_name || '.id = pcoo.pco_id
                                INNER JOIN ae.property_collection ' || pc_name || ' ON ' || pc_name || '.id = ' || pco_name || '.property_collection_id';
      ELSE
        -- filter directly by property_collection_object
        tax_sql := tax_sql || ' INNER JOIN ae.property_collection_object ' || pco_name || ' ON ' || pco_name || '.object_id = object.id
                                INNER JOIN ae.property_collection ' || pc_name || ' ON ' || pc_name || '.id = ' || pco_name || '.property_collection_id';
      END IF;
    END LOOP;
    -- add where clauses
    -- for taxonomies
    tax_sql := tax_sql || ' WHERE tax.name = ANY ($1)';
    -- FOREACH taxfilter IN ARRAY tax_filters LOOP
    --   IF taxfilter.comparator IN ('ILIKE', 'LIKE') THEN
    --     tax_sql := tax_sql || ' AND object.properties->>' || quote_literal(taxfilter.pname) || ' ' || taxfilter.comparator || ' ' || quote_literal('%' || taxfilter.value || '%');
    --   ELSE
    --     tax_sql := tax_sql || ' AND object.properties->>' || quote_literal(taxfilter.pname) || ' ' || taxfilter.comparator || ' ' || quote_literal(taxfilter.value);
    --   END IF;
    -- END LOOP;
    -- add where clauses for pco_filters
    FOREACH pcofilter IN ARRAY pco_filters LOOP
      name := replace(replace(replace(pcofilter.pcname, ' ', ''), '(', ''), ')', '');
      pc_name := quote_ident('pc_' || name);
      pco_name := quote_ident('pco_' || name);
      IF pcofilter.comparator IN ('ILIKE', 'LIKE') THEN
        tax_sql := tax_sql || ' AND ' || pco_name || '.properties->>' || quote_literal(pcofilter.pname) || ' ' || pcofilter.comparator || ' ' || quote_literal('%' || pcofilter.value || '%');
      ELSE
        tax_sql := tax_sql || ' AND ' || pco_name || '.properties->>' || quote_literal(pcofilter.pname) || ' ' || pcofilter.comparator || ' ' || quote_literal(pcofilter.value);
      END IF;
    END LOOP;
    -- create _tmp with all object_ids
    EXECUTE tax_sql
    USING taxonomies;
  END LOOP;
    -- TODO: add tax_fields
    -- FOREACH taxfield IN ARRAY tax_fields LOOP
    --   FOR tmprow IN
    --   SELECT
    --     *
    --   FROM
    --     _tmp LOOP
    --       UPDATE
    --         _tmp
    --       SET
    --         properties = jsonb_set(properties, '{' || taxfield.fieldname || '}', (
    --             SELECT
    --               object.properties ->> quote_ident(taxfield.fieldname)
    --             FROM ae.object
    --             WHERE
    --               id = tmprow.id));
    --     END LOOP;
    -- END LOOP;
    -- TODO: add pco_fields
    -- RAISE EXCEPTION 'taxonomies: %, tax_fields: %, tax_filters: %, pco_filters: %, pcs_of_pco_filters: %, pco_properties: %, use_synonyms: %, count: %, object_ids: %, tax_sql: %:', taxonomies, tax_fields, tax_filters, pco_filters, pcs_of_pco_filters, pco_properties, use_synonyms, count, object_ids, tax_sql;
    --RAISE EXCEPTION 'sql: %:', sql;
    -- does this work?:
    RETURN QUERY
    SELECT
      *
    FROM
      _tmp;
    DROP TABLE _tmp;
END
$$
LANGUAGE plpgsql;

-- fehlerhafte Arraykonstante: »)«
ALTER FUNCTION ae.export (taxonomies text[], tax_fields tax_field[], tax_filters tax_filter[], pco_filters pco_filter[], pcs_of_pco_filters text[], pco_properties pco_property[], use_synonyms boolean, count integer, object_ids uuid[]) OWNER TO postgres;

-- test from grqphiql:
-- mutation exportDataMutation($taxonomies: [String]!, $taxFields: [TaxFieldInput]!, $taxFilters: [TaxFilterInput]!, $pcoFilters: [PcoFilterInput]!, $pcsOfPcoFilters: [String]!, $pcoProperties: [PcoPropertyInput]!, $useSynonyms: Boolean!, $count: Int! $objectIds: [UUID]!) {
--   export(
--     input: {taxonomies: $taxonomies, taxFields: $taxFields, taxFilters: $taxFilters, pcoFilters: $pcoFilters, pcsOfPcoFilters: $pcsOfPcoFilters, pcoProperties: $pcoProperties, useSynonyms: $useSynonyms, count: $count, objectIds: $objectIds}
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
--     "SISF (2005)"
--   ],
--   "taxFields": [],
--   "taxFilters": [],
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
--   "pcoProperties": [
--     {
--       "pcname": "CH OeQV",
--       "pname": "Art ist Qualitätszeiger Liste A"
--     }
--   ],
--   "useSynonyms": true,
--   "count": 10,
--   "objectIds": []
-- }
