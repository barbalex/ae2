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

-- for rco list including relations without properties:
-- problem: no property. Property selection form should show: Beziehungspartner
-- solution: left join property count
WITH property_list AS (
  SELECT DISTINCT
    pc.id AS pc_id,
    rco.relation_type,
    jsonb_object_keys(rco.properties) AS property
  FROM
    ae.relation rco
    INNER JOIN ae.object object ON object.id = rco.object_id
    INNER JOIN ae.taxonomy tax ON tax.id = object.taxonomy_id
    INNER JOIN ae.property_collection pc ON pc.id = rco.property_collection_id
  WHERE
    tax.name IN ('SISF (2005)')
),
property_count AS (
  SELECT
    pc_id,
    relation_type,
    count(property) AS count
  FROM
    property_list
  GROUP BY
    pc_id,
    relation_type
),
relation_list AS (
  SELECT DISTINCT
    pc.id AS pc_id,
    pc.name,
    rco.relation_type
  FROM
    ae.relation rco
    INNER JOIN ae.object object ON object.id = rco.object_id
    INNER JOIN ae.taxonomy tax ON tax.id = object.taxonomy_id
    INNER JOIN ae.property_collection pc ON pc.id = rco.property_collection_id
  WHERE
    tax.name IN ('SISF (2005)'))
SELECT
  relation_list.name,
  relation_list.relation_type,
  property_count.count AS property_count
FROM
  relation_list
  LEFT JOIN property_count ON property_count.pc_id = property_count.pc_id
    AND relation_list.relation_type = property_count.relation_type
  ORDER BY
    name,
    relation_type;

-- for rco - relation type:
WITH property_list AS (
  SELECT DISTINCT
    pc.id AS pc_id,
    rco.relation_type,
    jsonb_object_keys(rco.properties) AS property
  FROM
    ae.relation rco
    INNER JOIN ae.object object ON object.id = rco.object_id
    INNER JOIN ae.taxonomy tax ON tax.id = object.taxonomy_id
    INNER JOIN ae.property_collection pc ON pc.id = rco.property_collection_id
  WHERE
    tax.name IN ('SISF (2005)')
),
relation_list AS (
  SELECT DISTINCT
    pc.id AS pc_id,
    pc.name,
    rco.relation_type
  FROM
    ae.relation rco
    INNER JOIN ae.object object ON object.id = rco.object_id
    INNER JOIN ae.taxonomy tax ON tax.id = object.taxonomy_id
    INNER JOIN ae.property_collection pc ON pc.id = rco.property_collection_id
  WHERE
    tax.name IN ('SISF (2005)'))
SELECT
  relation_list.name,
  relation_list.relation_type,
  property_list.property
FROM
  relation_list
  LEFT JOIN property_list ON property_list.pc_id = property_list.pc_id
    AND relation_list.relation_type = property_list.relation_type
  ORDER BY
    name,
    relation_type;

