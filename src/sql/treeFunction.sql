DROP TYPE IF EXISTS ae.tree CASCADE;

CREATE TYPE ae.tree AS (
  label text,
  id text,
  url text[],
  children_count integer,
  info text,
  menu_type text
);

DROP FUNCTION IF EXISTS ae.tree_function;

CREATE OR REPLACE FUNCTION ae.tree_function (active_url text[], has_token boolean)
  RETURNS SETOF ae.tree
  AS $$
  WITH tree_categories AS (
    SELECT
      id,
      name,
      1::integer AS level,
      name AS category,
      ARRAY[name] AS url,
      lpad(sort::text, 6, '0') AS sort_string,
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
    2::integer AS level,
    cat.name AS category,
    ARRAY[cat.name,
    tax.id::text] AS url,
    concat(lpad(cat.sort::text, 6, '0'), '/', lpad(ROW_NUMBER() OVER (ORDER BY tax.name)::text, 6, '0')) AS sort_string,
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
      o.parent_id::text,
      3::integer AS level,
      cat.name AS category,
      ARRAY[cat.name,
      ae.taxonomy.id::text,
      o.id::text] AS url,
      concat(taxonomies.sort_string, '/', lpad(ROW_NUMBER() OVER (ORDER BY o.name)::text, 6, '0')) AS sort_string,
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
        INNER JOIN taxonomies ON taxonomies.id = o.taxonomy_id
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
        o.parent_id::text,
        a.level + 1,
        cat.name AS category,
        array_append(a.url, o.id::text) AS url,
        concat(a.sort_string, '/', lpad(ROW_NUMBER() OVER (ORDER BY o.name)::text, 6, '0')) AS sort_string,
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
          name,
          id,
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
    pc.name,
    ARRAY[cat.name,
    pc.id::text] AS url,
    concat('000003/', lpad(ROW_NUMBER() OVER (ORDER BY pc.name)::text, 6, '0')) AS sort_string,
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
),
pc_folder_values AS (
  SELECT
    *
  FROM (
    VALUES ('pc'),
      ('rel')) AS folders (name)
ORDER BY
  name
),
pcs_folders AS (
  SELECT
    3 AS level,
    CASE WHEN pc_folder_values.name LIKE 'pc' THEN
      pcs.id || '_pc_folder'
    ELSE
      pcs.id || '_rel_folder'
    END AS id,
    CASE WHEN pc_folder_values.name LIKE 'pc' THEN
      'Eigenschaften'
    ELSE
      'Beziehungen'
    END AS name,
    CASE WHEN pc_folder_values.name LIKE 'pc' THEN
      array_append(pcs.url, 'Eigenschaften')
    ELSE
      array_append(pcs.url, 'Beziehungen')
    END AS url,
    CASE WHEN pc_folder_values.name = 'pc' THEN
      concat(pcs.sort_string, '/000001')
    ELSE
      concat(pcs.sort_string, '/000002')
    END AS sort_string,
    0 AS children_count,
    CASE WHEN pc_folder_values.name LIKE 'pc' THEN
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
    END AS info_count,
    CASE WHEN pc_folder_values.name LIKE 'pc' THEN
      'pCProperties'
    ELSE
      'pCRelations'
    END AS menu_type
  FROM
    pcs
    INNER JOIN pc_folder_values ON pc_folder_values.name IN ('pc', 'rel')
  WHERE
    active_url @> pcs.url
),
users AS (
  SELECT
    2::integer AS level,
    us.id,
    us.name,
    ARRAY['Benutzer',
    us.id]::text[] AS url,
    concat('000004/', lpad(ROW_NUMBER() OVER (ORDER BY us.name)::text, 6, '0')) AS sort_string,
  0::integer AS children_count,
  'CmBenutzer' AS menu_type
FROM
  ae.user us
  WHERE
    active_url @> ARRAY['Benutzer']::text[]
    AND has_token IS TRUE
),
users_folder AS (
  SELECT
    *
  FROM (
    VALUES (1::integer, 'userfolderid', 'Benutzer', ARRAY['Benutzer']::text[], '000004', (
          SELECT
            count(*)::integer
          FROM
            ae.user
          WHERE
            has_token IS TRUE),
          'CmBenutzerFolder')) AS users_folders (level,
        id,
        name,
        url,
        sort_string,
        children_count,
        menu_type)
),
orgs AS (
  SELECT
    2::integer AS level,
    org.id,
    org.name,
    ARRAY['Organisationen',
    org.id]::text[] AS url,
    concat('000005/', lpad((ROW_NUMBER() OVER (ORDER BY org.name)::text), 6, '0')) AS sort_string,
  0::integer AS children_count,
  'organization' AS menu_type
FROM
  ae.organization org
  WHERE
    active_url @> ARRAY['Organisationen']::text[]
    AND has_token IS TRUE
),
orgs_folder AS (
  SELECT
    *
  FROM (
    VALUES (1::integer, 'orgsfolderid', 'Organisationen', ARRAY['Organisationen']::text[], '000005', (
          SELECT
            count(*)::integer
          FROM
            ae.organization
          WHERE
            has_token IS TRUE),
          'orgFolder')) AS orgs_folders (level,
        id,
        name,
        url,
        sort_string,
        children_count,
        menu_type)
),
unioned AS (
  SELECT
    level,
    name,
    id::text,
    url,
    sort_string,
    children_count,
    to_char(info_count, 'FM999G999') AS info,
  menu_type
FROM
  pcs_folders
UNION ALL
SELECT
  level,
  name,
  id::text,
  url,
  sort_string,
  children_count,
  NULL AS info,
  menu_type
FROM
  users
UNION ALL
SELECT
  level,
  name,
  id::text,
  url,
  sort_string,
  children_count,
  CASE WHEN children_count > 0 THEN
    to_char(children_count, 'FM999G999')
  ELSE
    NULL
  END AS info,
  menu_type
FROM
  users_folder
  WHERE
    has_token IS TRUE
  UNION ALL
  SELECT
    level,
    name,
    id::text,
    url,
    sort_string,
    children_count,
    NULL AS info,
    menu_type
  FROM
    orgs
  UNION ALL
  SELECT
    level,
    name,
    id::text,
    url,
    sort_string,
    children_count,
    CASE WHEN children_count > 0 THEN
      to_char(children_count, 'FM999G999')
    ELSE
      NULL
    END AS info,
    menu_type
  FROM
    orgs_folder
  WHERE
    has_token IS TRUE
  UNION ALL
  SELECT
    level,
    name,
    id::text,
    url,
    sort_string,
    children_count,
    CASE WHEN children_count > 0 THEN
      to_char(children_count, 'FM999G999')
    ELSE
      NULL
    END AS info,
    menu_type
  FROM
    pcs
  UNION ALL
  SELECT
    level,
    name,
    id::text,
    url,
    sort_string,
    children_count,
    CASE WHEN children_count > 0 THEN
      to_char(children_count, 'FM999G999')
    ELSE
      NULL
    END AS info,
    menu_type
  FROM
    objects
  UNION ALL
  SELECT
    level,
    name,
    id::text,
    url,
    sort_string,
    children_count,
    CASE WHEN children_count > 0 THEN
      to_char(children_count, 'FM999G999')
    ELSE
      NULL
    END AS info,
    menu_type
  FROM
    taxonomies
  UNION ALL
  SELECT
    level,
    name,
    id::text,
    url,
    sort_string,
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
    children_count,
    info,
    menu_type
  FROM
    unioned
  ORDER BY
    sort_string
)
SELECT
  label,
  id,
  url,
  children_count,
  info,
  menu_type
FROM
  sorted
$$
LANGUAGE sql
STABLE;

ALTER FUNCTION ae.tree_function (active_url text[], has_token boolean) OWNER TO postgres;

