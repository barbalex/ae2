DROP TYPE IF EXISTS ae.tree CASCADE;

CREATE TYPE ae.tree AS (
  level bigint,
  label text,
  id text,
  url text[],
  sort text[],
  children_count bigint,
  info text,
  menu_type text
);

CREATE OR REPLACE FUNCTION ae.tree_function (active_url text[])
  RETURNS SETOF ae.tree
  AS $$
  WITH tree_categories AS (
    SELECT
      id,
      name,
      NULL::uuid AS parent_id,
      1::bigint AS level,
      name AS category,
      ARRAY[name] AS url,
      sort AS cat_sort,
      sort,
      CASE WHEN name = 'Eigenschaften-Sammlungen' THEN
      (
        SELECT
          count(id)
        FROM
          ae.property_collection)
      ELSE
        (
          SELECT
            count(tax.id)
          FROM
            ae.taxonomy tax
            INNER JOIN ae.tree_category ON ae.tree_category.id = tax.tree_category
          WHERE
            tax.tree_category = cat.id
          GROUP BY
            tree_category.id)
      END AS children_count,
      CASE WHEN name = 'Eigenschaften-Sammlungen' THEN
        'CmPCFolder'
      ELSE
        'CmType'
      END AS menu_type
    FROM
      ae.tree_category cat
),
taxonomies AS (
  SELECT
    tax.id,
    tax.name,
    tax.tree_category AS parent_id,
    2::bigint AS level,
    cat.name AS category,
    ARRAY[cat.name,
    tax.id::text] AS url,
    cat.sort AS cat_sort,
    ARRAY[cat.name,
    tax.name] AS sort,
    (
      SELECT
        count(ae.object.id)
      FROM
        ae.object
        INNER JOIN ae.taxonomy ON ae.object.taxonomy_id = ae.taxonomy.id
      WHERE
        ae.object.parent_id IS NULL
        AND ae.object.taxonomy_id = tax.id
      GROUP BY
        ae.taxonomy.id) AS children_count,
      'CmTaxonomy' AS menu_type
    FROM
      ae.taxonomy tax
      INNER JOIN ae.tree_category cat ON tax.tree_category = cat.id
    WHERE
      array_to_string(active_url, '/')
      LIKE replace(cat.name, '/', '|') || '%'
),
objects AS (
  WITH RECURSIVE a AS (
    SELECT
      o.id,
      o.name,
      o.parent_id,
      3::bigint AS level,
      cat.name AS category,
      cat.sort AS cat_sort,
      ARRAY[cat.name,
      ae.taxonomy.id::text,
      o.id::text] AS url,
      ARRAY[cat.name,
      ae.taxonomy.name,
      o.name] AS sort,
      --concat(replace(cat.name, '/', '|'), '/', replace(ae.taxonomy.name, '/', '|'), '/', replace(o.name, '/', '|')) AS sort,
      (
        SELECT
          count(ae.object.id)
          FROM ae.object
        WHERE
          ae.object.parent_id = o.id) AS children_count,
    'CmObject' AS menu_type
  FROM
    ae.object o
    INNER JOIN ae.taxonomy
    INNER JOIN ae.tree_category cat ON ae.taxonomy.tree_category = cat.id ON o.taxonomy_id = ae.taxonomy.id
  WHERE
    o.parent_id IS NULL
    AND array_to_string(active_url, '/')
    LIKE concat(replace(cat.name, '/', '|'), '/', ae.taxonomy.id) || '%'
  UNION ALL
  SELECT
    o.id,
    o.name,
    o.parent_id,
    a.level + 1,
    cat.name AS category,
    cat.sort AS cat_sort,
    array_append(a.url, o.id::text) AS url,
    array_append(a.sort, o.name) AS sort,
  (
    SELECT
      count(ae.object.id)
    FROM
      ae.object
    WHERE
      ae.object.parent_id = o.id) AS children_count,
  'CmObject' AS menu_type
FROM
  ae.object o
  INNER JOIN ae.taxonomy
  INNER JOIN ae.tree_category cat ON ae.taxonomy.tree_category = cat.id ON o.taxonomy_id = ae.taxonomy.id
  JOIN a ON a.id = o.parent_id
  WHERE
    a.level <= 10
    AND array_to_string(active_url, '/')
    LIKE array_to_string(a.url, '/') || '%'
)
  SELECT
    level,
    category,
    cat_sort,
    name,
    id,
    parent_id,
    url,
    sort,
    children_count,
    menu_type
  FROM
    a
),
pcs AS (
  SELECT
    2 AS level,
    cat.sort AS cat_sort,
    pc.id,
    cat.id AS parent_id,
    pc.name,
    ARRAY[cat.name,
    pc.id::text] AS url,
    ARRAY[cat.sort::text,
    pc.name] AS sort,
    --concat(cat.sort, '/', pc.name) AS sort,
    (
      SELECT
        count(*)
        FROM ae.property_collection_object
      WHERE
        property_collection_id = pc.id) + (
      SELECT
        count(*)
      FROM
        ae.relation
      WHERE
        property_collection_id = pc.id) AS children_count,
    'CmPC' AS menu_type
  FROM
    ae.property_collection pc
    INNER JOIN ae.tree_category cat ON cat.id = '33744e59-1942-4341-8b2d-088d4ac96434'
  WHERE
    array_to_string(active_url, '/')
    LIKE replace(cat.name, '/', '|') || '%'
  ORDER BY
    pc.name
),
pcs_folders AS (
  SELECT
    3 AS level,
    pcs.cat_sort AS cat_sort,
    pcs.id || '_folder' AS id,
    pcs.id AS parent_id,
    CASE WHEN folders.name = 'pc' THEN
      'Eigenschaften'
    ELSE
      'Beziehungen'
    END AS name,
    array_append(pcs.url, folders.name) AS url,
  CASE WHEN folders.name = 'pc' THEN
    array_append(pcs.sort, '1')
  ELSE
    array_append(pcs.sort, '2')
  END AS sort,
  CASE WHEN folders.name = 'pc' THEN
  (
    SELECT
      count(*)
    FROM
      ae.property_collection_object
    WHERE
      property_collection_id = pcs.id)
  ELSE
    (
      SELECT
        count(*)
      FROM
        ae.relation
      WHERE
        property_collection_id = pcs.id)
  END AS children_count,
  CASE WHEN folders.name = 'pc' THEN
    'pCProperties'
  ELSE
    'pCRelations'
  END AS menu_type
FROM
  pcs
  INNER JOIN (
    VALUES ('pc'),
      ('rel')) AS folders (name) ON folders.name IN ('pc', 'rel')
  WHERE
    array_to_string(active_url, '/')
    LIKE concat(array_to_string(pcs.url, '/'), '%')
  ORDER BY
    CASE WHEN folders.name = 'pc' THEN
      1
    ELSE
      2
    END
),
unioned AS (
  SELECT
    level,
    cat_sort,
    name,
    id::text,
    parent_id,
    url,
    sort,
    children_count,
    children_count::text AS info,
    menu_type
  FROM
    pcs_folders
  UNION ALL
  SELECT
    level,
    cat_sort,
    name,
    id::text,
    parent_id,
    url,
    sort,
    children_count,
    children_count::text AS info,
    menu_type
  FROM
    pcs
  UNION ALL
  SELECT
    level,
    cat_sort,
    name,
    id::text,
    parent_id,
    url,
    sort,
    children_count,
    children_count::text AS info,
    menu_type
  FROM
    objects
  UNION ALL
  SELECT
    level,
    cat_sort,
    name,
    id::text,
    parent_id,
    url,
    sort,
    children_count,
    children_count::text AS info,
    menu_type
  FROM
    taxonomies
  UNION ALL
  SELECT
    level,
    cat_sort,
    name,
    id::text,
    parent_id,
    url,
    ARRAY[sort::text] AS sort,
    children_count,
    CASE WHEN name = 'Eigenschaften-Sammlungen' THEN
      children_count::text
    ELSE
      children_count::text || ' Taxonomien'
    END AS info,
    menu_type
  FROM
    tree_categories
),
sorted AS (
  SELECT
    level,
    name AS label,
    id,
    url,
    sort,
    array_to_string(sort, '/') AS sort_string,
  children_count,
  info,
  menu_type
FROM
  unioned
ORDER BY
  cat_sort,
  sort_string
)
SELECT
  level,
  label,
  id,
  url,
  sort,
  children_count,
  info,
  menu_type
FROM
  sorted
$$
LANGUAGE sql
STABLE;

ALTER FUNCTION ae.tree_function (url text[]) OWNER TO postgres;

