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
 *
 * ONLY works on PG >= 14
 */
-- https://stackoverflow.com/a/16552441/712005
WITH constants (
  active_url
) AS (
  VALUES ('Arten/aed47d40-7b0e-11e8-b9a5-bd4f79edbcc4/aedf52b0-7b0e-11e8-b9a5-bd4f79edbcc4/aee40da0-7b0e-11e8-b9a5-bd4f79edbcc4/aef3c510-7b0e-11e8-b9a5-bd4f79edbcc4/798695e7-65ea-4e63-90e4-c8a393233f2e')
),
tree_categories AS (
  SELECT
    id, name, NULL::uuid AS parent_id, 1::bigint AS level, name AS category, replace(name, '/', '|') AS url,
    sort AS cat_sort,
    sort::text,
    (
      SELECT
        count(tax.id)
      FROM
        ae.taxonomy tax
        INNER JOIN ae.tree_category ON ae.tree_category.id = tax.tree_category
      WHERE
        tax.tree_category = cat.id
      GROUP BY
        tree_category.id) AS children_count
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
    concat(replace(cat.name, '/', '|'), '/', tax.id) AS url,
    cat.sort AS cat_sort,
    concat(replace(cat.name, '/', '|'), '/', tax.name) AS sort,
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
        ae.taxonomy.id) AS children_count
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
      cat.sort AS cat_sort,
      concat(replace(cat.name, '/', '|'), '/', ae.taxonomy.id, '/', o.id) AS url,
      concat(replace(cat.name, '/', '|'), '/', replace(ae.taxonomy.name, '/', '|'), '/', replace(o.name, '/', '|')) AS sort,
      (
        SELECT
          count(ae.object.id)
        FROM
          ae.object
        WHERE
          ae.object.parent_id = o.id) AS children_count
      FROM
        ae.object o
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
        cat.sort AS cat_sort,
        concat(a.url, '/', o.id) AS url,
        concat(a.sort, '/', replace(o.name, '/', '|')) AS sort,
        (
          SELECT
            count(ae.object.id)
          FROM
            ae.object
          WHERE
            ae.object.parent_id = o.id) AS children_count
        FROM
          ae.object o
          INNER JOIN ae.taxonomy
          INNER JOIN ae.tree_category cat ON ae.taxonomy.tree_category = cat.id ON o.taxonomy_id = ae.taxonomy.id
          JOIN a ON a.id = o.parent_id,
          constants c
        WHERE
          a.level <= 10
          AND c.active_url LIKE a.url || '%'
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
          children_count
        FROM
          a
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
      children_count
    FROM
      objects
    UNION ALL
    SELECT
      level,
      category,
      cat_sort,
      name,
      id,
      parent_id,
      url,
      sort,
      children_count
    FROM
      taxonomies
    UNION ALL
    SELECT
      level,
      category,
      cat_sort,
      name,
      id,
      parent_id,
      url,
      sort,
      children_count
    FROM
      tree_categories
    ORDER BY
      cat_sort,
      sort;

