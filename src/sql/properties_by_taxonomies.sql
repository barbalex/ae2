-- This to count pc's:
-- Can be done directly in graphql
WITH pcs AS (
  SELECT DISTINCT
    pco.property_collection_id
  FROM
    ae.property_collection_object pco
    INNER JOIN ae.object object ON object.id = pco.object_id
    INNER JOIN ae.taxonomy tax ON tax.id = object.taxonomy_id
  WHERE
    tax.name IN ('SISF (2005)'))
SELECT
  count(*)
FROM
  pcs;

-- Count properties:
WITH pco_properties AS (
  SELECT DISTINCT
    jsonb_object_keys(pco.properties) AS property
  FROM
    ae.property_collection_object pco
    INNER JOIN ae.object object ON object.id = pco.object_id
    INNER JOIN ae.taxonomy tax ON tax.id = object.taxonomy_id
  WHERE
    tax.name IN ('SISF (2005)'))
SELECT
  count(*)
FROM
  pco_properties;

-- function:
CREATE OR REPLACE FUNCTION ae.pco_properties_by_taxonomies_count_function (export_taxonomies text[])
  RETURNS integer
  AS $$
  WITH pco_properties AS (
    SELECT DISTINCT
      jsonb_object_keys(pco.properties) AS property
    FROM
      ae.property_collection_object pco
      INNER JOIN ae.object object ON object.id = pco.object_id
      INNER JOIN ae.taxonomy tax ON tax.id = object.taxonomy_id
    WHERE
      tax.name = ANY (export_taxonomies))
  SELECT
    count(*)
  FROM
    pco_properties
$$
LANGUAGE sql
STABLE;

ALTER FUNCTION ae.pco_properties_by_taxonomies_count_function (export_taxonomies text[]) OWNER TO postgres;

