CREATE TYPE auth.jwt_token AS (
    token text,
    ROLE text,
    username text,
    exp integer
);

CREATE TYPE tax_filter AS (
    comparator text,
    pname text,
    taxname text,
    value text
);

CREATE TYPE tax_field AS (
    fieldname text,
    taxname text
);

CREATE TYPE pco_filter AS (
    comparator text,
    pname text,
    pcname text,
    value text
);

CREATE TYPE rco_filter AS (
    comparator text,
    pname text,
    pcname text,
    relationtype text,
    value text
);

ALTER TYPE rco_filter
    ADD ATTRIBUTE relationtype text;

CREATE TYPE pco_property AS (
    pname text,
    pcname text
);

CREATE TYPE rco_property AS (
    pname text,
    relationtype text,
    pcname text
);

