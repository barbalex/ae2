-- object and pc
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

-- TODO:
-- - add (only) choosen columns
-- - add exporting all taxa, even such without pc or rc data. union vs intersect?
--   see: https://www.enterprisedb.com/postgres-tutorials/how-combine-multiple-queries-single-result-set-using-union-intersect-and-except
-- - add relation collections?
--
-- Idea:
-- 0. get the following info passed from app:
--    - taxonomies
--    - taxFilters
--    - pcFilters
--    - taxFields
--    - pcFields
--    - useSynonyms
--    - onlyRowsWithProperties
--    - list of objectIds (optional)
-- 1. for every pc with fields choosen, select: object_id, fieldname, value (while applying all filters)
--    Use above query as template
-- 2. get list of object_ids (with empty columns fieldname and value) while applying all filters
-- 3. for every tax field choosen, select: object_id, fieldname, value (while applying all filters)
-- 4. combine all tables using either union or intersect
-- 5. use crosstab to get list of objects with all columns (https://stackoverflow.com/a/11751905/712005, safe form)
