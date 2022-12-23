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

CREATE TYPE rco_property_count AS (
    pcname text,
    relationtype text,
    count integer
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

CREATE TYPE ae.export_data AS (
    id uuid, -- needed for apollo
    count integer, -- enable passing total count while only returning limited data for preview
    export_data json -- this is a json array
);

DROP TYPE ae.pc_count CASCADE;

CREATE TYPE ae.pc_count AS (
    name text,
    count integer
);

CREATE TYPE AE.property_and_type AS (
    property text,
    type text
);

CREATE TYPE rco_property_count AS (
    pcname text,
    relationtype text,
    count integer
);

CREATE TYPE rco_per_rco_relation AS (
    pcname text,
    relationtype text,
    property text,
    jsontype text
);

