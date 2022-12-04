-- Idea:
-- 0. get the following info passed from app:
--    - taxonomies (minimum one)
--    - taxFilters (optional, default: [])
--    - pcoFilters (optional, default: [])
--    - taxFields (optional, default: [])
--    - pcoFields (optional, default: [])
--    - useSynonyms (optional, default: true)
--    - onlyRowsWithProperties (optional, default: true)
--    - list of objectIds (optional)
--    - count (optional, limit is reserved word)
-- 1. for every pc with fields choosen, select: object_id, fieldname, value (while applying all filters)
--    Use above query as template
-- 2. get list of object_ids (with empty columns fieldname and value) while applying all filters
-- 3. for every tax field choosen, select: object_id, fieldname, value (while applying all filters)
-- 4. combine all tables using either union or intersect
--    see: https://www.enterprisedb.com/postgres-tutorials/how-combine-multiple-queries-single-result-set-using-union-intersect-and-except
-- 5. use crosstab to get list of objects with all columns (https://stackoverflow.com/a/11751905/712005, safe form)
-- TODO: add relation collections?
-- TODO: how to efficiently handle previews? Sort by object_id and limit to 15?
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
  RETURN QUERY EXECUTE sql
  USING taxonomies, tax_filters;
END
$$
LANGUAGE plpgsql
STABLE;

ALTER FUNCTION ae.export (taxonomies text[], tax_fields text[], tax_filters tax_filter[], pco_filters pco_filter[], pco_properties pco_property[], object_ids uuid[], use_synonyms boolean, only_rows_with_properties boolean, count integer) OWNER TO postgres;

