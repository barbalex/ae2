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

-- ALTER TYPE rco_filter
--     ADD ATTRIBUTE relationtype text;
--
CREATE TYPE pco_property AS (
    pname text,
    pcname text
);

CREATE TYPE rco_property AS (
    pname text,
    relationtype text,
    pcname text
);

CREATE TYPE tax_field AS (
    pname text,
    taxname text
);

CREATE TYPE sort_field AS (
    tname text, -- what table the property is extracted from. One of: object, property_collection_object, relation
    pcname text, -- name of property collection or taxonomy
    pname text, -- property name
    relationtype text, -- relevant for relations
    direction text -- ASC or DESC
);

