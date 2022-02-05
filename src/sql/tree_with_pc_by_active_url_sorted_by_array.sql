/**
 * this query is currently not in use
 * would be a very nice way to fetch data for the tree:
 * filter by passing activeNodeArray
 *
 * data for users and organizations could be added
 *
 * ISSUE: if used as view policies would not be respected :-(
 * see: https://www.postgresql.org/docs/13/sql-createpolicy.html
 * "This does not change how views work, however. As with normal queries and views, 
 * permission checks and policies for the tables which are referenced by a view will 
 * use the view owner's rights and any policies which apply to the view owner"
 *
 * maybe it could be used as a function returning a set of a type (to be created)
 * would that respect policies?
 * Seems that yes: functions have SECURITY INVOKER set by default
 * see postgresql.org/docs/current/sql-createfunction.html
 *
 * TODO: how return exactly what is shown? (openNodes)
 * needs to be queried with help of activeUrl:
 * - break activeUrl up into parent levels
 * - filter: 
 *   - this object's url equals activeUrl 
 *   - or: this object's url minus last element equals any of activeUrl's parents 
 *
 */
-- https://stackoverflow.com/a/16552441/712005
WITH constants (
  active_url
) AS (
  VALUES ('Arten/aed47d40-7b0e-11e8-b9a5-bd4f79edbcc4/aedf52b1-7b0e-11e8-b9a5-bd4f79edbcc4/aee40daa-7b0e-11e8-b9a5-bd4f79edbcc4/aef3c522-7b0e-11e8-b9a5-bd4f79edbcc4/fe3a527f-867e-4dea-9f8b-772482360fe0')
),
tree_categories AS (
  SELECT
    id, name, NULL::uuid AS parent_id, 1::bigint AS level, name AS category, ARRAY[name] AS url, lpad(sort::text, 6, '0') AS sort_string,
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
    concat(lpad(cat.sort::text, 6, '0'), '/', lpad(ROW_NUMBER() OVER (ORDER BY tax.name)::text, 6, '0')) AS sort_string,
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
  INNER JOIN ae.tree_category cat ON tax.tree_category = cat.id,
  constants c
  WHERE
    c.active_url LIKE replace(cat.name, '/', '|') || '%'
),
objects AS (
  WITH RECURSIVE a AS (
    SELECT
      o.id,
      o.name,
      o.parent_id,
      3::bigint AS level,
      cat.name AS category,
      ARRAY[cat.name,
      ae.taxonomy.id::text,
      o.id::text] AS url,
      concat(taxonomies.sort_string, '/', lpad(ROW_NUMBER() OVER (ORDER BY o.name)::text, 6, '0')) AS sort_string,
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
      LEFT JOIN taxonomies ON taxonomies.id = o.taxonomy_id
      INNER JOIN ae.taxonomy
      INNER JOIN ae.tree_category cat ON ae.taxonomy.tree_category = cat.id ON o.taxonomy_id = ae.taxonomy.id,
      constants c
    WHERE
      o.parent_id IS NULL
      AND c.active_url LIKE concat(replace(cat.name, '/', '|'), '/', ae.taxonomy.id) || '%'
    UNION ALL
    SELECT
      o.id,
      o.name,
      o.parent_id,
      a.level + 1,
      cat.name AS category,
      array_append(a.url, o.id::text) AS url,
      concat(a.sort_string, '/', lpad(ROW_NUMBER() OVER (ORDER BY o.name)::text, 6, '0')) AS sort_string,
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
      LEFT JOIN taxonomies ON taxonomies.id = o.taxonomy_id
      INNER JOIN ae.taxonomy
      INNER JOIN ae.tree_category cat ON ae.taxonomy.tree_category = cat.id ON o.taxonomy_id = ae.taxonomy.id
      JOIN a ON a.id = o.parent_id,
      constants c
    WHERE
      a.level <= 10
      AND c.active_url LIKE array_to_string(a.url, '/') || '%'
)
    SELECT
      level,
      category,
      name,
      id,
      parent_id,
      url,
      sort_string,
      children_count,
      menu_type
    FROM
      a
),
pcs AS (
  SELECT
    2 AS level,
    pc.id,
    cat.id AS parent_id,
    pc.name,
    ARRAY[cat.name,
    pc.id::text] AS url,
    concat('000003/', lpad(ROW_NUMBER() OVER (ORDER BY pc.name)::text, 6, '0')) AS sort_string,
    (
      SELECT
        count(*)
      FROM
        ae.property_collection_object
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
      INNER JOIN ae.tree_category cat ON cat.id = '33744e59-1942-4341-8b2d-088d4ac96434',
      constants c
    WHERE
      c.active_url LIKE replace(cat.name, '/', '|') || '%'
    ORDER BY
      pc.name
),
pcs_folders AS (
  SELECT
    3 AS level,
    pcs.id || '_folder' AS id,
    pcs.id AS parent_id,
    CASE WHEN folders.name = 'pc' THEN
      'Eigenschaften'
    ELSE
      'Beziehungen'
    END AS name,
    array_append(pcs.url, folders.name) AS url,
  CASE WHEN folders.name = 'pc' THEN
    concat(pcs.sort_string, '/000001')
  ELSE
    concat(pcs.sort_string, '/000002')
  END AS sort_string,
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
      ('rel')) AS folders (name) ON folders.name IN ('pc', 'rel'),
    constants c
  WHERE
    c.active_url LIKE concat(array_to_string(pcs.url, '/'), '%')
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
    name,
    id::text,
    parent_id,
    url,
    sort_string,
    children_count,
    children_count::text AS info,
    menu_type
  FROM
    pcs_folders
  UNION ALL
  SELECT
    level,
    name,
    id::text,
    parent_id,
    url,
    sort_string,
    children_count,
    children_count::text AS info,
    menu_type
  FROM
    pcs
  UNION ALL
  SELECT
    level,
    name,
    id::text,
    parent_id,
    url,
    sort_string,
    children_count,
    children_count::text AS info,
    menu_type
  FROM
    objects
  UNION ALL
  SELECT
    level,
    name,
    id::text,
    parent_id,
    url,
    sort_string,
    children_count,
    children_count::text AS info,
    menu_type
  FROM
    taxonomies
  UNION ALL
  SELECT
    level,
    name,
    id::text,
    parent_id,
    url,
    sort_string,
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
    sort_string,
    children_count,
    info,
    menu_type
  FROM
    unioned
  ORDER BY
    sort_string
)
SELECT
  level,
  label,
  id,
  url,
  sort_string,
  children_count,
  info,
  menu_type
FROM
  sorted;

