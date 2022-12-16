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

-- function for pco, per taxonomies:
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

-- function for rco, per taxonomies:
CREATE OR REPLACE FUNCTION ae.rco_properties_by_taxonomies_count_function (export_taxonomies text[])
  RETURNS integer
  AS $$
  WITH rco_properties AS (
    SELECT DISTINCT
      jsonb_object_keys(rco.properties) AS property
    FROM
      ae.relation rco
      INNER JOIN ae.object object ON object.id = rco.object_id
      INNER JOIN ae.taxonomy tax ON tax.id = object.taxonomy_id
    WHERE
      tax.name = ANY (export_taxonomies))
  SELECT
    count(*)
  FROM
    rco_properties
$$
LANGUAGE sql
STABLE;

ALTER FUNCTION ae.rco_properties_by_taxonomies_count_function (export_taxonomies text[]) OWNER TO postgres;

-- function for pco per pc:
CREATE OR REPLACE FUNCTION ae.pco_properties_by_taxonomies_count_per_pc (export_taxonomies text[])
  RETURNS SETOF ae.pc_count
  AS $$
  WITH pco_properties AS (
    SELECT DISTINCT
      pc.name,
      jsonb_object_keys(pco.properties) AS property
    FROM
      ae.property_collection_object pco
      INNER JOIN ae.property_collection pc ON pc.id = pco.property_collection_id
      INNER JOIN ae.object object ON object.id = pco.object_id
      INNER JOIN ae.taxonomy tax ON tax.id = object.taxonomy_id
    WHERE
      tax.name = ANY (export_taxonomies))
  SELECT
    pp.name,
    count(pp.name)::integer
  FROM
    pco_properties pp
  GROUP BY
    pp.name
  ORDER BY
    pp.name
$$
LANGUAGE sql
STABLE;

ALTER FUNCTION ae.pco_properties_by_taxonomies_count_per_pc (export_taxonomies text[]) OWNER TO postgres;

