-- 1. Authentification
-- use a trigger to manually enforce the role being a foreign key to actual
-- database roles
CREATE OR REPLACE FUNCTION auth.check_role_exists ()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $$
BEGIN
  IF NOT EXISTS (
    SELECT
      1
    FROM
      pg_roles AS r
    WHERE
      r.rolname = NEW.role) THEN
  RAISE foreign_key_violation
  USING message = 'unknown database role: ' || NEW.role;
  RETURN NULL;
END IF;
  RETURN new;
END
$$;

DROP TRIGGER IF EXISTS ensure_user_role_exists ON ae.user;

CREATE CONSTRAINT TRIGGER ensure_user_role_exists
  AFTER INSERT OR UPDATE ON ae.user
  FOR EACH ROW
  EXECUTE PROCEDURE auth.check_role_exists ();

CREATE OR REPLACE FUNCTION auth.encrypt_pass ()
  RETURNS TRIGGER
  AS $$
BEGIN
  IF tg_op = 'INSERT' OR NEW.pass <> OLD.pass THEN
    NEW.pass = crypt(NEW.pass, gen_salt('bf'));
  END IF;
  RETURN new;
END
$$
LANGUAGE plpgsql;

-- We’ll use the pgcrypto extension and a trigger
-- to keep passwords safe in the user table
DROP TRIGGER IF EXISTS encrypt_pass ON ae.user;

CREATE TRIGGER encrypt_pass
  BEFORE INSERT OR UPDATE ON ae.user
  FOR EACH ROW
  EXECUTE PROCEDURE auth.encrypt_pass ();

-- Helper to check a password against the encrypted column
-- It returns the database role for a user
-- if the name and password are correct
CREATE OR REPLACE FUNCTION auth.user_role (username text, pass text)
  RETURNS name
  LANGUAGE plpgsql
  AS $$
BEGIN
  RETURN (
    SELECT
      ROLE
    FROM
      ae.user
    WHERE
      ae.user.name = $1
      AND ae.user.pass = crypt($2, ae.user.pass));
END;
$$;

-- Login function which takes an user name and password
-- and returns JWT if the credentials match a user in the internal table
-- TODO: role is not needed, remove
CREATE OR REPLACE FUNCTION ae.login (username text, pass text)
  RETURNS auth.jwt_token
  AS $$
DECLARE
  _role name;
  result auth.jwt_token;
BEGIN
  -- check username and password
  SELECT
    auth.user_role ($1, $2) INTO _role;
  IF _role IS NULL THEN
    RAISE invalid_password
    USING message = 'invalid user or password';
  END IF;
    SELECT
      auth.sign(row_to_json(r), current_setting('app.jwt_secret')) AS token
    FROM (
      SELECT
        _role AS role
        --$1 as username,
        --extract(epoch from now())::integer + 60*60*24*30 as exp
) r INTO result;
    RETURN (result.token,
      _role,
      $1,
      extract(epoch FROM (now() + interval '1 week')))::auth.jwt_token;
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION current_user_name ()
  RETURNS text
  AS $$
  SELECT
    nullif (current_setting('jwt.claims.username', TRUE), '')::text;

$$
LANGUAGE sql
STABLE
SECURITY DEFINER;

-- 1.2: pgjwt
CREATE OR REPLACE FUNCTION auth.url_encode (data bytea)
  RETURNS text
  LANGUAGE sql
  AS $$
  SELECT
    translate(encode(data, 'base64'), E'+/=\n', '-_');

$$;

CREATE OR REPLACE FUNCTION auth.url_decode (data text)
  RETURNS bytea
  LANGUAGE sql
  AS $$
  WITH t AS (
    SELECT
      translate(data, '-_', '+/') AS trans
),
rem AS (
  SELECT
    length(t.trans) % 4 AS remainder
  FROM
    t) -- compute padding size
  SELECT
    decode(t.trans || CASE WHEN rem.remainder > 0 THEN
        repeat('=', (4 - rem.remainder))
      ELSE
        ''
      END, 'base64')
  FROM
    t,
    rem;

$$;

CREATE OR REPLACE FUNCTION auth.algorithm_sign (signables text, secret text, algorithm text)
  RETURNS text
  LANGUAGE sql
  AS $$
  WITH alg AS (
    SELECT
      CASE WHEN algorithm = 'HS256' THEN
        'sha256'
      WHEN algorithm = 'HS384' THEN
        'sha384'
      WHEN algorithm = 'HS512' THEN
        'sha512'
      ELSE
        ''
      END AS id) -- hmac throws error
    SELECT
      auth.url_encode (hmac(signables, secret, alg.id))
    FROM
      alg;

$$;

CREATE OR REPLACE FUNCTION auth.sign (payload json, secret text, algorithm text DEFAULT 'HS256')
  RETURNS text
  LANGUAGE sql
  AS $$
  WITH header AS (
    SELECT
      auth.url_encode (convert_to('{"alg":"' || algorithm || '","typ":"JWT"}', 'utf8')) AS data
),
payload AS (
  SELECT
    auth.url_encode (convert_to(payload::text, 'utf8')) AS data
),
signables AS (
  SELECT
    header.data || '.' || payload.data AS data
  FROM
    header,
    payload
)
SELECT
  signables.data || '.' || auth.algorithm_sign (signables.data, secret, algorithm)
FROM
  signables;

$$;

CREATE OR REPLACE FUNCTION auth.verify (token text, secret text, algorithm text DEFAULT 'HS256')
  RETURNS TABLE (
    header json,
    payload json,
    valid boolean)
  LANGUAGE sql
  AS $$
  SELECT
    convert_from(auth.url_decode (r[1]), 'utf8')::json AS header,
    convert_from(auth.url_decode (r[2]), 'utf8')::json AS payload,
    r[3] = auth.algorithm_sign (r[1] || '.' || r[2], secret, algorithm) AS valid
  FROM
    regexp_split_to_array(token, '\.') r;

$$;

-- 1.2: request
DROP SCHEMA IF EXISTS request CASCADE;

CREATE SCHEMA request;

GRANT usage ON SCHEMA request TO public;

CREATE OR REPLACE FUNCTION request.env_var (v text)
  RETURNS text
  AS $$
  SELECT
    current_setting(v, TRUE);

$$ STABLE
LANGUAGE sql;

CREATE OR REPLACE FUNCTION request.jwt_claim (c text)
  RETURNS text
  AS $$
  SELECT
    request.env_var ('request.jwt.claim.' || c);

$$ STABLE
LANGUAGE sql;

CREATE OR REPLACE FUNCTION request.cookie (c text)
  RETURNS text
  AS $$
  SELECT
    request.env_var ('request.cookie.' || c);

$$ STABLE
LANGUAGE sql;

CREATE OR REPLACE FUNCTION request.header (h text)
  RETURNS text
  AS $$
  SELECT
    request.env_var ('request.header.' || h);

$$ STABLE
LANGUAGE sql;

CREATE OR REPLACE FUNCTION request.user_name ()
  RETURNS text
  AS $$
  SELECT
    CASE request.jwt_claim ('username')
    WHEN '' then ''
  ELSE
    request.jwt_claim ('username')::text
    END
$$ STABLE
LANGUAGE sql;

CREATE OR REPLACE FUNCTION request.user_role ()
  RETURNS text
  AS $$
  SELECT
    request.jwt_claim ('role')::text;

$$ STABLE
LANGUAGE sql;

CREATE OR REPLACE FUNCTION ae.object_by_object_name (object_name text)
  RETURNS SETOF ae.object
  AS $$
  SELECT
    *
  FROM
    ae.object
  WHERE
    ae.object.name ILIKE ('%' || $1 || '%')
$$
LANGUAGE sql
STABLE;

ALTER FUNCTION ae.object_by_object_name (object_name text) OWNER TO postgres;

CREATE OR REPLACE FUNCTION ae.object_object (taxonomy_object ae.object, taxonomy_id uuid)
  RETURNS SETOF ae.object
  AS $$
  SELECT
    to1.*
  FROM
    ae.object AS to1
    INNER JOIN ae.object AS to2 ON to2.parent_id = to1.id
  WHERE
    to1.id = object_object.taxonomy_object.id
    AND 1 = CASE WHEN $2 IS NULL THEN
      1
    WHEN to1.id = $2 THEN
      1
    ELSE
      2
    END
$$
LANGUAGE sql
STABLE;

ALTER FUNCTION ae.object_object (taxonomy_object ae.object, taxonomy_id UUID) OWNER TO postgres;

DROP TABLE IF EXISTS ae.pco_properties_by_taxonomy CASCADE;

CREATE TYPE ae.pco_properties_by_taxonomy AS (
  property_collection_name text,
  property_name text,
  jsontype text,
  count bigint
);

-- TODO: drop
DROP FUNCTION ae.pco_properties_by_taxonomies_function;

-- example query for prop_values_function:
--SELECT distinct properties->'Artwert' AS value
--FROM ae.property_collection_object
--INNER JOIN ae.property_collection ON ae.property_collection_object.property_collection_id = ae.property_collection.id
--WHERE ae.property_collection.name = 'ZH Artwert (2000)'
--ORDER BY value
DROP TABLE IF EXISTS ae.prop_value CASCADE;

CREATE TYPE ae.prop_value AS (
  value text
);

-- TODO: ater fetching with apollo (sometimes?) last row is null
CREATE OR REPLACE FUNCTION ae.prop_values_function (table_name text, prop_name text, pc_field_name text, pc_table_name text, pc_name text)
  RETURNS SETOF ae.prop_value
  AS $$
DECLARE
  sql text := 'SELECT DISTINCT properties->>' || quote_literal(prop_name) || ' AS value FROM ae.' || table_name || ' INNER JOIN ae.' || pc_table_name || ' ON ae.' || table_name || '.' || pc_field_name || ' = ae.' || pc_table_name || '.id WHERE ae.' || pc_table_name || '.name = ' || quote_literal(pc_name) || ' ORDER BY value';
BEGIN
  --RAISE EXCEPTION  'sql: %', sql;
  RETURN QUERY EXECUTE sql;
END
$$
LANGUAGE plpgsql
STABLE;

ALTER FUNCTION ae.prop_values_function (table_name text, prop_name text, pc_field_name text, pc_table_name text, pc_name text) OWNER TO postgres;

-- example query for prop_values_function:
--SELECT distinct properties->'Artwert' AS value
--FROM ae.property_collection_object
--INNER JOIN ae.property_collection ON ae.property_collection_object.property_collection_id = ae.property_collection.id
--WHERE ae.property_collection.name = 'ZH Artwert (2000)' and ae.property_collection_object.properties->>'Artwert' like '2'
--ORDER BY value
CREATE OR REPLACE FUNCTION ae.prop_values_filtered_function (table_name text, prop_name text, pc_field_name text, pc_table_name text, pc_name text, prop_value text)
  RETURNS SETOF ae.prop_value
  AS $$
DECLARE
  sql text := format('
  SELECT DISTINCT properties->>%1$L AS value 
  FROM ae.%2$s 
    INNER JOIN ae.%3$s ON ae.%2$s.%4$s = ae.%3$s.id 
  WHERE 
    ae.%3$s.name = %5$L 
    and ae.%2$s.properties->>%1$L like %6$L 
  ORDER BY value', prop_name, table_name, pc_table_name, pc_field_name, pc_name, '%' || prop_value || '%');
BEGIN
  --RAISE EXCEPTION  'sql: %', sql;
  RETURN QUERY EXECUTE sql;
END
$$
LANGUAGE plpgsql
STABLE;

ALTER FUNCTION ae.prop_values_filtered_function (table_name text, prop_name text, pc_field_name text, pc_table_name text, pc_name text, prop_value text) OWNER TO postgres;

CREATE OR REPLACE FUNCTION ae.property_collection_by_property_name (property_name text)
  RETURNS SETOF ae.property_collection
  AS $$
  SELECT
    *
  FROM
    ae.property_collection
  WHERE
    ae.property_collection.name ILIKE ('%' || $1 || '%')
$$
LANGUAGE sql
STABLE;

ALTER FUNCTION ae.property_collection_by_property_name (property_name text) OWNER TO postgres;

DROP TABLE IF EXISTS ae.rco_count_by_taxonomy_relation_type CASCADE;

CREATE TYPE ae.rco_count_by_taxonomy_relation_type AS (
  property_collection_name text,
  relation_type text,
  count bigint
);

CREATE OR REPLACE FUNCTION ae.rco_count_by_taxonomy_relation_type_function ()
  RETURNS SETOF ae.rco_count_by_taxonomy_relation_type
  AS $$
  SELECT
    ae.property_collection.name AS property_collection_name,
    ae.relation.relation_type,
    count(*)
  FROM
    ae.relation
    INNER JOIN ae.property_collection ON ae.property_collection.id = ae.relation.property_collection_id
  GROUP BY
    property_collection_name,
    relation_type
  ORDER BY
    property_collection_name,
    relation_type
$$
LANGUAGE sql
STABLE;

ALTER FUNCTION ae.rco_count_by_taxonomy_relation_type_function () OWNER TO postgres;

DROP TABLE IF EXISTS ae.rco_properties_by_taxonomy CASCADE;

CREATE TYPE ae.rco_properties_by_taxonomy AS (
  property_collection_name text,
  relation_type text,
  property_name text,
  jsontype text,
  count bigint
);

-- TODO: do not load this for all taxonomies, but only for the selected rc
CREATE OR REPLACE FUNCTION ae.rco_properties_by_taxonomies_function (taxonomy_names text[])
  RETURNS SETOF ae.rco_properties_by_taxonomy
  AS $$
  WITH jsontypes AS (
    WITH object_ids AS (
      SELECT
        ae.object.id
      FROM
        ae.object
        INNER JOIN ae.taxonomy ON ae.object.taxonomy_id = ae.taxonomy.id
      WHERE
        ae.taxonomy.name = ANY (taxonomy_names))
      SELECT
        ae.property_collection.name AS property_collection_name,
        ae.relation.relation_type,
        json_data.key AS property_name,
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
        ae.object
        INNER JOIN ae.taxonomy ON ae.object.taxonomy_id = ae.taxonomy.id
        INNER JOIN ae.relation ON ae.object.id = ae.relation.object_id
        INNER JOIN ae.property_collection ON ae.property_collection.id = ae.relation.property_collection_id,
        jsonb_each(ae.relation.properties) AS json_data
      WHERE
        ae.taxonomy.name = ANY (taxonomy_names)
      UNION
      SELECT
        ae.property_collection.name AS property_collection_name,
        ae.relation.relation_type,
        json_data.key AS property_name,
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
        ae.object
        INNER JOIN ae.synonym ON ae.synonym.object_id = ae.object.id
        INNER JOIN ae.taxonomy ON ae.object.taxonomy_id = ae.taxonomy.id
        INNER JOIN ae.relation ON ae.object.id = ae.relation.object_id
        INNER JOIN ae.property_collection ON ae.property_collection.id = ae.relation.property_collection_id,
        jsonb_each(ae.relation.properties) AS json_data
      WHERE
        ae.synonym.object_id_synonym IN (
          SELECT
            *
          FROM
            object_ids)
        UNION
        SELECT
          ae.property_collection.name AS property_collection_name,
          ae.relation.relation_type,
          json_data.key AS property_name,
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
          ae.object
          INNER JOIN ae.synonym ON ae.synonym.object_id_synonym = ae.object.id
          INNER JOIN ae.taxonomy ON ae.object.taxonomy_id = ae.taxonomy.id
          INNER JOIN ae.relation ON ae.object.id = ae.relation.object_id
          INNER JOIN ae.property_collection ON ae.property_collection.id = ae.relation.property_collection_id,
          jsonb_each(ae.relation.properties) AS json_data
        WHERE
          ae.synonym.object_id IN (
            SELECT
              *
            FROM
              object_ids))
      SELECT
        *,
        count(*)
    FROM
      jsontypes
    GROUP BY
      property_collection_name,
      relation_type,
      property_name,
      jsontype
    ORDER BY
      property_collection_name,
      relation_type,
      property_name,
      jsontype
$$
LANGUAGE sql
STABLE;

ALTER FUNCTION ae.rco_properties_by_taxonomies_function (taxonomy_names text[]) OWNER TO postgres;

DROP TABLE IF EXISTS ae.tax_properties_by_taxonomy CASCADE;

CREATE TYPE ae.tax_properties_by_taxonomy AS (
  taxonomy_name text,
  property_name text,
  jsontype text,
  count bigint
);

CREATE OR REPLACE FUNCTION ae.tax_properties_by_taxonomies_function (taxonomy_names text[])
  RETURNS SETOF ae.tax_properties_by_taxonomy
  AS $$
  WITH jsontypes AS (
    WITH object_ids AS (
      SELECT
        ae.object.id
      FROM
        ae.object
        INNER JOIN ae.taxonomy ON ae.object.taxonomy_id = ae.taxonomy.id
      WHERE
        ae.taxonomy.name = ANY (taxonomy_names))
      SELECT
        ae.taxonomy.name AS taxonomy_name,
        json_data.key AS property_name,
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
        ae.object
        INNER JOIN ae.taxonomy ON ae.taxonomy.id = ae.object.taxonomy_id,
        jsonb_each(ae.object.properties) AS json_data
      WHERE
        ae.taxonomy.name = ANY (taxonomy_names)
      UNION
      SELECT
        ae.taxonomy.name AS taxonomy_name,
        json_data.key AS property_name,
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
        ae.object
        INNER JOIN ae.synonym ON ae.synonym.object_id = ae.object.id
        INNER JOIN ae.taxonomy ON ae.taxonomy.id = ae.object.taxonomy_id,
        jsonb_each(ae.object.properties) AS json_data
      WHERE
        ae.synonym.object_id_synonym IN (
          SELECT
            *
          FROM
            object_ids)
        UNION
        SELECT
          ae.taxonomy.name AS taxonomy_name,
          json_data.key AS property_name,
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
          ae.object
          INNER JOIN ae.synonym ON ae.synonym.object_id_synonym = ae.object.id
          INNER JOIN ae.taxonomy ON ae.taxonomy.id = ae.object.taxonomy_id,
          jsonb_each(ae.object.properties) AS json_data
        WHERE
          ae.synonym.object_id IN (
            SELECT
              *
            FROM
              object_ids))
      SELECT
        *,
        count(*)
    FROM
      jsontypes
    GROUP BY
      taxonomy_name,
      property_name,
      jsontype
    ORDER BY
      taxonomy_name,
      property_name,
      jsontype
$$
LANGUAGE sql
STABLE;

ALTER FUNCTION ae.tax_properties_by_taxonomies_function (taxonomy_names text[]) OWNER TO postgres;

CREATE OR REPLACE FUNCTION ae.delete_pco_of_pc (pc_id uuid)
  RETURNS SETOF ae.taxonomy
  AS $$
DECLARE
  sqldel text := 'delete from ae.property_collection_object where property_collection_id = ' || quote_literal(pc_id);
  sqlreturn text := 'select * from ae.taxonomy';
BEGIN
  --RAISE EXCEPTION  'sql: %', sql;
  EXECUTE sqldel;
  RETURN QUERY EXECUTE sqlreturn;
END
$$
LANGUAGE plpgsql;

ALTER FUNCTION ae.delete_pco_of_pc (pc_id uuid) OWNER TO postgres;

CREATE OR REPLACE FUNCTION ae.delete_rco_of_pc (pc_id uuid)
  RETURNS SETOF ae.taxonomy
  AS $$
DECLARE
  sqldel text := 'delete from ae.relation where property_collection_id = ' || quote_literal(pc_id);
  sqlreturn text := 'select * from ae.taxonomy';
BEGIN
  --RAISE EXCEPTION  'sql: %', sql;
  EXECUTE sqldel;
  RETURN QUERY EXECUTE sqlreturn;
END
$$
LANGUAGE plpgsql;

ALTER FUNCTION ae.delete_rco_of_pc (pc_id uuid) OWNER TO postgres;

