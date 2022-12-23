CREATE TYPE rco_count AS (
  pc_reltype_count bigint,
  property_count bigint
);

CREATE OR REPLACE FUNCTION ae.export_rco_count (export_taxonomies text[])
  RETURNS rco_count
  AS $$
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
      tax.name = ANY (export_taxonomies)
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
    tax.name = ANY (export_taxonomies))
SELECT
  count(relation_list.name) AS pc_reltype_count,
  sum(property_count.count) AS property_count
FROM
  relation_list
  LEFT JOIN property_count ON property_count.pc_id = property_count.pc_id
    AND relation_list.relation_type = property_count.relation_type
$$
LANGUAGE sql
STABLE;

ALTER FUNCTION ae.export_rco_count (export_taxonomies text[]) OWNER TO postgres;

-- example query:
-- WITH property_list AS (
--   SELECT DISTINCT
--     pc.id AS pc_id,
--     rco.relation_type,
--     jsonb_object_keys(rco.properties) AS property
--   FROM
--     ae.relation rco
--     INNER JOIN ae.object object ON object.id = rco.object_id
--     INNER JOIN ae.taxonomy tax ON tax.id = object.taxonomy_id
--     INNER JOIN ae.property_collection pc ON pc.id = rco.property_collection_id
--   WHERE
--     tax.name IN ('SISF (2005)')
-- ),
-- property_count AS (
--   SELECT
--     pc_id,
--     relation_type,
--     count(property) AS count
--   FROM
--     property_list
--   GROUP BY
--     pc_id,
--     relation_type
-- ),
-- relation_list AS (
--   SELECT DISTINCT
--     pc.id AS pc_id,
--     pc.name,
--     rco.relation_type
--   FROM
--     ae.relation rco
--     INNER JOIN ae.object object ON object.id = rco.object_id
--     INNER JOIN ae.taxonomy tax ON tax.id = object.taxonomy_id
--     INNER JOIN ae.property_collection pc ON pc.id = rco.property_collection_id
--   WHERE
--     tax.name IN ('SISF (2005)'))
-- SELECT
--   count(relation_list.name) AS pc_reltype_count,
--   sum(property_count.count) AS property_count
-- FROM
--   relation_list
--   LEFT JOIN property_count ON property_count.pc_id = property_count.pc_id
--     AND relation_list.relation_type = property_count.relation_type;
CREATE TYPE rco_property_count AS (
  pcname text,
  relationtype text,
  count integer
);

CREATE OR REPLACE FUNCTION ae.export_rco_list (export_taxonomies text[])
  RETURNS SETOF rco_property_count
  AS $$
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
      tax.name = ANY (export_taxonomies)
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
    tax.name = ANY (export_taxonomies))
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
    relation_type
$$
LANGUAGE sql
STABLE;

ALTER FUNCTION ae.export_rco_list (export_taxonomies text[]) OWNER TO postgres;

-- for rco list including relations without properties:
-- problem: no property. Property selection form should show: Beziehungspartner
-- solution: left join property count
-- WITH property_list AS (
--   SELECT DISTINCT
--     pc.id AS pc_id,
--     rco.relation_type,
--     jsonb_object_keys(rco.properties) AS property
--   FROM
--     ae.relation rco
--     INNER JOIN ae.object object ON object.id = rco.object_id
--     INNER JOIN ae.taxonomy tax ON tax.id = object.taxonomy_id
--     INNER JOIN ae.property_collection pc ON pc.id = rco.property_collection_id
--   WHERE
--     tax.name IN ('SISF (2005)')
-- ),
-- property_count AS (
--   SELECT
--     pc_id,
--     relation_type,
--     count(property) AS count
--   FROM
--     property_list
--   GROUP BY
--     pc_id,
--     relation_type
-- ),
-- relation_list AS (
--   SELECT DISTINCT
--     pc.id AS pc_id,
--     pc.name,
--     rco.relation_type
--   FROM
--     ae.relation rco
--     INNER JOIN ae.object object ON object.id = rco.object_id
--     INNER JOIN ae.taxonomy tax ON tax.id = object.taxonomy_id
--     INNER JOIN ae.property_collection pc ON pc.id = rco.property_collection_id
--   WHERE
--     tax.name IN ('SISF (2005)'))
-- SELECT
--   relation_list.name,
--   relation_list.relation_type,
--   property_count.count AS property_count
-- FROM
--   relation_list
--   LEFT JOIN property_count ON property_count.pc_id = property_count.pc_id
--     AND relation_list.relation_type = property_count.relation_type
--   ORDER BY
--     name,
--     relation_type;
-- function for rco - relation:
CREATE TYPE rco_per_rco_relation AS (
  pcname text,
  relationtype text,
  property text,
  jsontype text
);

CREATE OR REPLACE FUNCTION ae.export_rco_per_rco_relation (export_taxonomies text[], pcname text, relationtype text)
  RETURNS SETOF rco_per_rco_relation
  AS $$
  WITH property_list_with_type AS (
    SELECT DISTINCT
      pc.id AS pc_id,
      rco.relation_type,
      -- jsonb_object_keys(rco.properties) AS property
      json_data.key AS property,
      CASE WHEN
    LEFT (json_data.value::text,
      1) = '"' THEN
        'String'
      WHEN json_data.value::text ~ '^-?\d' THEN
        CASE WHEN json_data.value::text ~ '\.' THEN
          'Number'
        ELSE
          'Integer'
      END
      WHEN
    LEFT (json_data.value::text,
      1) = '[' THEN
        'Array'
      WHEN
    LEFT (json_data.value::text,
      1) = '{' THEN
        'Object'
      WHEN json_data.value::text IN ('true', 'false') THEN
        'Boolean'
      WHEN json_data.value::text = 'null' THEN
        'Null'
      ELSE
        'unknown'
      END AS jsontype
    FROM
      ae.relation rco
      INNER JOIN ae.object object ON object.id = rco.object_id
      INNER JOIN ae.taxonomy tax ON tax.id = object.taxonomy_id
      INNER JOIN ae.property_collection pc ON pc.id = rco.property_collection_id,
      jsonb_each(rco.properties) AS json_data
    WHERE
      tax.name = ANY (export_taxonomies)
      AND pc.name = pcname
      AND rco.relation_type = relationtype
),
property_list_type_count AS (
  SELECT
    pc_id,
    relation_type,
    property,
    min(jsontype) AS jsontype,
    count(jsontype) AS jsontype_count
  FROM
    property_list_with_type
  GROUP BY
    pc_id,
    relation_type,
    property
),
property_list AS (
  SELECT
    pc_id,
    relation_type,
    property,
    CASE WHEN jsontype_count = 1 THEN
      jsontype
    ELSE
      -- it is possible that a field contains different types of values
      -- in this case we return 'String' as a default type
      'String'
    END AS jsontype
  FROM
    property_list_type_count
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
    tax.name = ANY (export_taxonomies)
    AND pc.name = pcname
    AND rco.relation_type = relationtype
)
SELECT
  relation_list.name AS pcname,
  relation_list.relation_type AS relationtype,
  property_list.property,
  property_list.jsontype
FROM
  relation_list
  LEFT JOIN property_list ON property_list.pc_id = property_list.pc_id
    AND relation_list.relation_type = property_list.relation_type
  ORDER BY
    pcname,
    relationtype
$$
LANGUAGE sql
STABLE;

ALTER FUNCTION ae.export_rco_per_rco_relation (export_taxonomies text[], pcname text, relationtype text) OWNER TO postgres;

-- for rco - relation type:
-- done: return jsontype
-- WITH property_list_with_type AS (
--   SELECT DISTINCT
--     pc.id AS pc_id,
--     rco.relation_type,
--     -- jsonb_object_keys(rco.properties) AS property
--     json_data.key AS property,
--     CASE WHEN
--     LEFT (json_data.value::text,
--       1) = '"' THEN
--       'String'
--     WHEN json_data.value::text ~ '^-?\d' THEN
--       CASE WHEN json_data.value::text ~ '\.' THEN
--         'Number'
--       ELSE
--         'Integer'
--       END
--     WHEN
--     LEFT (json_data.value::text,
--       1) = '[' THEN
--       'Array'
--     WHEN
--     LEFT (json_data.value::text,
--       1) = '{' THEN
--       'Object'
--     WHEN json_data.value::text IN ('true', 'false') THEN
--       'Boolean'
--     WHEN json_data.value::text = 'null' THEN
--       'Null'
--     ELSE
--       'unknown'
--     END AS jsontype
--   FROM
--     ae.relation rco
--     INNER JOIN ae.object object ON object.id = rco.object_id
--     INNER JOIN ae.taxonomy tax ON tax.id = object.taxonomy_id
--     INNER JOIN ae.property_collection pc ON pc.id = rco.property_collection_id,
--     jsonb_each(rco.properties) AS json_data
--   WHERE
--     tax.name IN ('SISF (2005)')
-- ),
-- property_list_type_count AS (
--   SELECT
--     pc_id,
--     relation_type,
--     property,
--     min(jsontype) AS jsontype,
--     count(jsontype) AS jsontype_count
--   FROM
--     property_list_with_type
--   GROUP BY
--     pc_id,
--     relation_type,
--     property
-- ),
-- property_list AS (
--   SELECT
--     pc_id,
--     relation_type,
--     property,
--     CASE WHEN jsontype_count = 1 THEN
--       jsontype
--     ELSE
--       -- it is possible that a field contains different types of values
--       -- in this case we return 'String' as a default type
--       'String'
--     END AS jsontype
--   FROM
--     property_list_type_count
-- ),
-- relation_list AS (
--   SELECT DISTINCT
--     pc.id AS pc_id,
--     pc.name,
--     rco.relation_type
--   FROM
--     ae.relation rco
--     INNER JOIN ae.object object ON object.id = rco.object_id
--     INNER JOIN ae.taxonomy tax ON tax.id = object.taxonomy_id
--     INNER JOIN ae.property_collection pc ON pc.id = rco.property_collection_id
--   WHERE
--     tax.name IN ('SISF (2005)'))
-- SELECT
--   relation_list.name AS pcname,
--   relation_list.relation_type AS relationtype,
--   property_list.property,
--   property_list.jsontype
-- FROM
--   relation_list
--   LEFT JOIN property_list ON property_list.pc_id = property_list.pc_id
--     AND relation_list.relation_type = property_list.relation_type
--   ORDER BY
--     pcname,
--     relationtype;
