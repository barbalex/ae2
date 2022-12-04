--
-- example for querying pco for pco_field with pco_filter
-- with or without info of synonyms
SELECT
  ae.object.*
FROM
  ae.object
  INNER JOIN ae.taxonomy ON ae.taxonomy.id = ae.object.taxonomy_id
  -- if: with info of synonyms
  -- inner JOIN ae.pco_of_object pcoo ON pcoo.object_id = ae.object.id
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
-- alternative idea with temporary table: (https://stackoverflow.com/a/23957098/712005)
-- 1. create temporary table _tmp with column id
-- 2. select list of object_ids while applying all filters: insert into _tmp. Limit if count was passed
-- 3. for every tax field choosen: add column to _tmp, then update it's value
-- 4. for every pc with fields choosen: add column to _tmp, then update it with above query
-- 5. select _tmp into record and return it
--
-- need to use a record type, as there exists no predefined structure
-- docs: https://www.postgresql.org/docs/15/plpgsql-declarations.html#PLPGSQL-DECLARATION-RECORDS
CREATE OR REPLACE FUNCTION ae.export (taxonomies text[], tax_fields text[], tax_filters tax_filter[], pco_filters pco_filter[], pco_properties pco_property[], object_ids uuid[], use_synonyms boolean, only_rows_with_properties boolean, count integer)
  RETURNS RECORD
  AS $$
DECLARE
  rec RECORD;
  sql text := 'SELECT
                    ae.object.*
                  FROM
                    ae.object
                    INNER JOIN ae.taxonomy
                    ON ae.taxonomy.id = ae.object.taxonomy_id
                  WHERE
                    ae.taxonomy.name = ANY($1)';
  tf tax_filter;
BEGIN
  FOREACH tf IN ARRAY tax_filters LOOP
    IF tf.comparator IN ('ILIKE', 'LIKE') THEN
      sql := sql || ' AND ae.object.properties->>' || quote_literal(tf.pname) || ' ' || tf.comparator || ' ' || quote_literal('%' || tf.value || '%');
    ELSE
      sql := sql || ' AND ae.object.properties->>' || quote_literal(tf.pname) || ' ' || tf.comparator || ' ' || quote_literal(tf.value);
    END IF;
  END LOOP;
  --RAISE EXCEPTION  'taxonomies: %, tax_filters: %, sql: %:', taxonomies, tax_filters, sql;
  --RAISE EXCEPTION 'sql: %:', sql;
  -- does this work?:
  EXECUTE sql INTO rec;
  RETURN rec;
  USING taxonomies, tax_fields, tax_filters, pco_filters, pco_properties, object_ids, use_synonyms, only_rows_with_properties, count;
END
$$
LANGUAGE plpgsql
STABLE;

ALTER FUNCTION ae.export (taxonomies text[], tax_fields text[], tax_filters tax_filter[], pco_filters pco_filter[], pco_properties pco_property[], object_ids uuid[], use_synonyms boolean, only_rows_with_properties boolean, count integer) OWNER TO postgres;

