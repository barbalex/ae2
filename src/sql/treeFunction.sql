DROP TYPE IF EXISTS ae.tree CASCADE;

CREATE TYPE ae.tree AS (
  level integer,
  label text,
  id text,
  url text[],
  sort text[],
  children_count integer,
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
      1::integer AS level,
      name AS category,
      ARRAY[name] AS url,
      sort AS cat_sort,
      sort,
      CASE WHEN name = 'Eigenschaften-Sammlungen' THEN
      (
        SELECT
          count(id)::integer
        FROM
          ae.property_collection)
      ELSE
        (
          SELECT
            count(tax.id)::integer
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
    2::integer AS level,
    cat.name AS category,
    ARRAY[cat.name,
    tax.id::text] AS url,
    cat.sort AS cat_sort,
    ARRAY[cat.name,
    tax.name] AS sort,
    (
      SELECT
        count(ae.object.id)::integer
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
      active_url @> ARRAY[cat.name]
),
objects AS (
  WITH RECURSIVE a AS (
    SELECT
      o.id,
      o.name,
      o.parent_id,
      3::integer AS level,
      cat.name AS category,
      cat.sort AS cat_sort,
      ARRAY[cat.name,
      ae.taxonomy.id::text,
      o.id::text] AS url,
      ARRAY[cat.name,
      ae.taxonomy.name,
      o.name] AS sort,
      (
        SELECT
          count(ae.object.id)::integer
        FROM
          ae.object
        WHERE
          ae.object.parent_id = o.id) AS children_count,
      'CmObject' AS menu_type
    FROM
      ae.object o
      INNER JOIN ae.taxonomy
      INNER JOIN ae.tree_category cat ON ae.taxonomy.tree_category = cat.id ON o.taxonomy_id = ae.taxonomy.id
    WHERE
      o.parent_id IS NULL
      AND active_url @> ARRAY[cat.name,
      ae.taxonomy.id::text]
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
        count(ae.object.id)::integer
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
    AND active_url @> a.url
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
    (
      SELECT
        count(*)::integer
      FROM
        ae.property_collection_object
      WHERE
        property_collection_id = pc.id) + (
        SELECT
          count(*)::integer
        FROM
          ae.relation
        WHERE
          property_collection_id = pc.id) AS children_count,
      'CmPC' AS menu_type
    FROM
      ae.property_collection pc
      INNER JOIN ae.tree_category cat ON cat.id = '33744e59-1942-4341-8b2d-088d4ac96434'
    WHERE
      active_url @> ARRAY[cat.name]
    ORDER BY
      pc.name
),
pcs_folders AS (
  SELECT
    3 AS level,
    pcs.cat_sort AS cat_sort,
    pcs.id || '_folder' AS id,
    pcs.id AS parent_id,
    CASE WHEN folders.name LIKE 'pc' THEN
      'Eigenschaften'
    ELSE
      'Beziehungen'
    END AS name,
    CASE WHEN folders.name LIKE 'pc' THEN
      array_append(pcs.url, 'Eigenschaften')
    ELSE
      array_append(pcs.url, 'Beziehungen')
    END AS url,
    CASE WHEN folders.name LIKE 'pc' THEN
      array_append(pcs.sort, '1')
    ELSE
      array_append(pcs.sort, '2')
    END AS sort,
    CASE WHEN folders.name LIKE 'pc' THEN
    (
      SELECT
        count(*)::integer
      FROM
        ae.property_collection_object
      WHERE
        property_collection_id = pcs.id)
    ELSE
      (
        SELECT
          count(*)::integer
        FROM
          ae.relation
        WHERE
          property_collection_id = pcs.id)
    END AS children_count,
    CASE WHEN folders.name LIKE 'pc' THEN
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
    active_url @> pcs.url
  ORDER BY
    CASE WHEN folders.name LIKE 'pc' THEN
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
    to_char(children_count, 'FM999G999') AS info,
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
  to_char(children_count, 'FM999G999') AS info,
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
  to_char(children_count, 'FM999G999') AS info,
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
  to_char(children_count, 'FM999G999') AS info,
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
    to_char(children_count, 'FM999G999')
  ELSE
    to_char(children_count, 'FM999G999') || ' Taxonomien'
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

