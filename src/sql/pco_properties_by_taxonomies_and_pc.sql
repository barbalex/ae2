CREATE OR REPLACE FUNCTION ae.pco_properties_by_taxonomies_and_pc (taxonomy_names text[], pc_name text)
  RETURNS SETOF ae.property_and_type
  AS $$
  SELECT DISTINCT
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
    END AS type
  FROM
    ae.object
    INNER JOIN ae.taxonomy ON ae.object.taxonomy_id = ae.taxonomy.id
    INNER JOIN ae.pco_of_object ON ae.pco_of_object.object_id = ae.object.id
    INNER JOIN ae.property_collection_object ON ae.property_collection_object.id = ae.pco_of_object.pco_id
    INNER JOIN ae.property_collection pc ON pc.id = ae.property_collection_object.property_collection_id,
    jsonb_each(ae.property_collection_object.properties) AS json_data
WHERE
  ae.taxonomy.name = ANY (taxonomy_names)
  AND pc.name = pc_name
ORDER BY
  property,
  type
$$
LANGUAGE sql
STABLE;

ALTER FUNCTION ae.pco_properties_by_taxonomies_and_pc (taxonomy_names text[], pc_name text) OWNER TO postgres;

