/**
 * this query is currently not in use
 * would be a very nice way to fetch data for the tree:
 * filter by level and category
 * data for users and organizations could be added
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
 * would need to pass in activeNodeArray to create full tree?
 *
 * TODO: how return exactly what is shown? (openNodes)
 * needs to be queried with help of activeUrl:
 * - break activeUrl up into parent levels
 * - filter: 
 *   - this object's url equals activeUrl 
 *   - or: this object's url minus last element equals any of activeUrl's parents 
 */
WITH tree_categories AS (
  SELECT
    id,
    name,
    NULL::uuid AS parent_id,
    1::bigint AS level,
    name AS category,
    replace(name, '/', '|') AS url,
    replace(name, '/', '|') AS sort
  FROM
    ae.tree_category
),
taxonomies AS (
  SELECT
    tax.id,
    tax.name,
    tax.tree_category AS parent_id,
    2::bigint AS level,
    cat.name AS category,
    concat(replace(cat.name, '/', '|'), '/', tax.id) AS url,
    concat(replace(cat.name, '/', '|'), '/', tax.name) AS sort
  FROM
    ae.taxonomy tax
    INNER JOIN ae.tree_category cat ON tax.tree_category = cat.id
),
objects AS (
  WITH RECURSIVE a AS (
    SELECT
      ae.object.id,
      ae.object.name,
      ae.object.parent_id,
      3::bigint AS level,
      cat.name AS category,
      concat(replace(cat.name, '/', '|'), '/', ae.taxonomy.id, '/', ae.object.id) AS url,
      concat(replace(cat.name, '/', '|'), '/', replace(ae.taxonomy.name, '/', '|'), '/', replace(ae.object.name, '/', '|')) AS sort
    FROM
      ae.object
      INNER JOIN ae.taxonomy
      INNER JOIN ae.tree_category cat ON ae.taxonomy.tree_category = cat.id ON ae.object.taxonomy_id = ae.taxonomy.id
    WHERE
      ae.object.parent_id IS NULL
    UNION ALL
    SELECT
      o.id,
      o.name,
      o.parent_id,
      a.level + 1,
      cat.name AS category,
      concat(a.url, '/', o.id) AS url,
      concat(a.sort, '/', replace(o.name, '/', '|')) AS sort
    FROM
      ae.object o
      INNER JOIN ae.taxonomy
      INNER JOIN ae.tree_category cat ON ae.taxonomy.tree_category = cat.id ON o.taxonomy_id = ae.taxonomy.id
      JOIN a ON a.id = o.parent_id
    WHERE
      a.level <= 10
)
    SELECT
      level,
      category,
      name,
      id,
      parent_id,
      url,
      sort
    FROM
      a
)
  SELECT
    level,
    category,
    name,
    id,
    parent_id,
    url,
    sort
  FROM
    objects
  UNION ALL
  SELECT
    level,
    category,
    name,
    id,
    parent_id,
    url,
    sort
  FROM
    taxonomies
  UNION ALL
  SELECT
    level,
    category,
    name,
    id,
    parent_id,
    url,
    sort
  FROM
    tree_categories
    -- maybe not sort to make query faster?
  ORDER BY
    sort;

