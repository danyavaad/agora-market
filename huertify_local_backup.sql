--
-- PostgreSQL database dump
--

\restrict Tt13hjrQ92Y9UDCwzhiDUo8rRfw4JynRoXeslkaw77NzJFVMbZvhTRGxRaSO4Fi

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: dbsudoluxgarden
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO dbsudoluxgarden;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: dbsudoluxgarden
--

COMMENT ON SCHEMA public IS '';


--
-- Name: EventType; Type: TYPE; Schema: public; Owner: dbsudoluxgarden
--

CREATE TYPE public."EventType" AS ENUM (
    'planting',
    'frost',
    'pest',
    'harvest',
    'other'
);


ALTER TYPE public."EventType" OWNER TO dbsudoluxgarden;

--
-- Name: IncidentType; Type: TYPE; Schema: public; Owner: dbsudoluxgarden
--

CREATE TYPE public."IncidentType" AS ENUM (
    'overripe',
    'underweight',
    'wrong_item'
);


ALTER TYPE public."IncidentType" OWNER TO dbsudoluxgarden;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: dbsudoluxgarden
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'pending',
    'confirmed',
    'delivered',
    'cancelled'
);


ALTER TYPE public."OrderStatus" OWNER TO dbsudoluxgarden;

--
-- Name: QrType; Type: TYPE; Schema: public; Owner: dbsudoluxgarden
--

CREATE TYPE public."QrType" AS ENUM (
    'delivery',
    'pickup'
);


ALTER TYPE public."QrType" OWNER TO dbsudoluxgarden;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: dbsudoluxgarden
--

CREATE TYPE public."Role" AS ENUM (
    'producer',
    'consumer',
    'captain',
    'admin',
    'repartidor'
);


ALTER TYPE public."Role" OWNER TO dbsudoluxgarden;

--
-- Name: SeasonStatus; Type: TYPE; Schema: public; Owner: dbsudoluxgarden
--

CREATE TYPE public."SeasonStatus" AS ENUM (
    'DRAFT',
    'ACTIVE',
    'ARCHIVED'
);


ALTER TYPE public."SeasonStatus" OWNER TO dbsudoluxgarden;

--
-- Name: UnitType; Type: TYPE; Schema: public; Owner: dbsudoluxgarden
--

CREATE TYPE public."UnitType" AS ENUM (
    'weight_fixed',
    'weight_variable',
    'bunch',
    'unit'
);


ALTER TYPE public."UnitType" OWNER TO dbsudoluxgarden;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: dbsudoluxgarden
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO dbsudoluxgarden;

--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: dbsudoluxgarden
--

CREATE TABLE public.chat_messages (
    id text NOT NULL,
    tenant_id text NOT NULL,
    sender_id text NOT NULL,
    receiver_id text NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.chat_messages OWNER TO dbsudoluxgarden;

--
-- Name: credits; Type: TABLE; Schema: public; Owner: dbsudoluxgarden
--

CREATE TABLE public.credits (
    id text NOT NULL,
    tenant_id text NOT NULL,
    consumer_id text NOT NULL,
    order_item_id text,
    amount numeric(65,30) NOT NULL,
    reason text NOT NULL,
    is_used boolean DEFAULT false NOT NULL,
    used_in_order text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.credits OWNER TO dbsudoluxgarden;

--
-- Name: deliveries; Type: TABLE; Schema: public; Owner: dbsudoluxgarden
--

CREATE TABLE public.deliveries (
    id text NOT NULL,
    tenant_id text NOT NULL,
    order_id text NOT NULL,
    producer_id text NOT NULL,
    bin_number integer NOT NULL,
    delivery_qr_token uuid,
    confirmed_at timestamp(3) without time zone,
    confirmed_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.deliveries OWNER TO dbsudoluxgarden;

--
-- Name: feed_likes; Type: TABLE; Schema: public; Owner: dbsudoluxgarden
--

CREATE TABLE public.feed_likes (
    id text NOT NULL,
    post_id text NOT NULL,
    consumer_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.feed_likes OWNER TO dbsudoluxgarden;

--
-- Name: feed_posts; Type: TABLE; Schema: public; Owner: dbsudoluxgarden
--

CREATE TABLE public.feed_posts (
    id text NOT NULL,
    tenant_id text NOT NULL,
    producer_id text NOT NULL,
    product_id text,
    message text,
    photo_url text,
    event_type public."EventType",
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.feed_posts OWNER TO dbsudoluxgarden;

--
-- Name: offers; Type: TABLE; Schema: public; Owner: dbsudoluxgarden
--

CREATE TABLE public.offers (
    id text NOT NULL,
    tenant_id text NOT NULL,
    producer_id text NOT NULL,
    product_id text NOT NULL,
    week date NOT NULL,
    available_quantity_kg numeric(65,30),
    available_units integer,
    available_min_kg numeric(65,30),
    available_max_kg numeric(65,30),
    is_confirmed boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    photo_url text
);


ALTER TABLE public.offers OWNER TO dbsudoluxgarden;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: dbsudoluxgarden
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    order_id text NOT NULL,
    product_id text NOT NULL,
    estimated_quantity_kg numeric(65,30),
    estimated_units integer,
    estimated_price numeric(65,30),
    assigned_to_producer text,
    actual_weight_kg numeric(65,30),
    final_price numeric(65,30),
    has_incident boolean DEFAULT false NOT NULL,
    incident_type public."IncidentType",
    incident_photo_url text,
    credit_issued numeric(65,30) DEFAULT 0.00
);


ALTER TABLE public.order_items OWNER TO dbsudoluxgarden;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: dbsudoluxgarden
--

CREATE TABLE public.orders (
    id text NOT NULL,
    tenant_id text NOT NULL,
    consumer_id text NOT NULL,
    week date NOT NULL,
    status public."OrderStatus" DEFAULT 'pending'::public."OrderStatus" NOT NULL,
    pickup_qr_token uuid,
    pickup_confirmed_at timestamp(3) without time zone,
    pickup_confirmed_by text,
    total_estimated numeric(65,30),
    total_final numeric(65,30),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    bin_number integer,
    delivery_distance_km numeric(65,30),
    delivery_fee numeric(65,30) DEFAULT 0.00
);


ALTER TABLE public.orders OWNER TO dbsudoluxgarden;

--
-- Name: producer_priorities; Type: TABLE; Schema: public; Owner: dbsudoluxgarden
--

CREATE TABLE public.producer_priorities (
    id text NOT NULL,
    tenant_id text NOT NULL,
    season_id text NOT NULL,
    priority_order integer NOT NULL,
    producer_id text NOT NULL,
    product_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.producer_priorities OWNER TO dbsudoluxgarden;

--
-- Name: products; Type: TABLE; Schema: public; Owner: dbsudoluxgarden
--

CREATE TABLE public.products (
    id text NOT NULL,
    tenant_id text NOT NULL,
    name text NOT NULL,
    latin_name text,
    local_name text,
    unit_type public."UnitType" NOT NULL,
    price_per_kg numeric(65,30),
    min_weight_kg numeric(65,30),
    max_weight_kg numeric(65,30),
    items_per_bunch_min integer,
    items_per_bunch_max integer,
    price_per_bunch numeric(65,30),
    nutritional_info jsonb,
    recipes jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    unit_description text,
    price_per_unit numeric(65,30),
    image_url text
);


ALTER TABLE public.products OWNER TO dbsudoluxgarden;

--
-- Name: qr_tokens; Type: TABLE; Schema: public; Owner: dbsudoluxgarden
--

CREATE TABLE public.qr_tokens (
    token text NOT NULL,
    tenant_id text NOT NULL,
    user_id text,
    type public."QrType" NOT NULL,
    resource_id text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    used_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.qr_tokens OWNER TO dbsudoluxgarden;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: dbsudoluxgarden
--

CREATE TABLE public.reviews (
    id text NOT NULL,
    tenant_id text NOT NULL,
    consumer_id text NOT NULL,
    product_id text NOT NULL,
    producer_id text NOT NULL,
    order_item_id text,
    rating integer DEFAULT 5 NOT NULL,
    comment text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.reviews OWNER TO dbsudoluxgarden;

--
-- Name: season_allocations; Type: TABLE; Schema: public; Owner: dbsudoluxgarden
--

CREATE TABLE public.season_allocations (
    id text NOT NULL,
    tenant_id text NOT NULL,
    season_id text NOT NULL,
    producer_id text NOT NULL,
    product_id text NOT NULL,
    assigned_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.season_allocations OWNER TO dbsudoluxgarden;

--
-- Name: seasons; Type: TABLE; Schema: public; Owner: dbsudoluxgarden
--

CREATE TABLE public.seasons (
    id text NOT NULL,
    tenant_id text NOT NULL,
    name text NOT NULL,
    start_date timestamp(3) without time zone NOT NULL,
    end_date timestamp(3) without time zone,
    is_active boolean DEFAULT false NOT NULL,
    status public."SeasonStatus" DEFAULT 'DRAFT'::public."SeasonStatus" NOT NULL,
    producer_rotation jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.seasons OWNER TO dbsudoluxgarden;

--
-- Name: settlements; Type: TABLE; Schema: public; Owner: dbsudoluxgarden
--

CREATE TABLE public.settlements (
    id text NOT NULL,
    tenant_id text NOT NULL,
    producer_id text NOT NULL,
    week date NOT NULL,
    total_sales numeric(65,30),
    total_refunds numeric(65,30),
    total_weight_adjustments numeric(65,30),
    net_amount numeric(65,30),
    is_closed boolean DEFAULT false NOT NULL,
    closed_by text,
    closed_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.settlements OWNER TO dbsudoluxgarden;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: dbsudoluxgarden
--

CREATE TABLE public.tenants (
    id text NOT NULL,
    name text NOT NULL,
    currency_code text DEFAULT 'EUR'::text NOT NULL,
    km_rate numeric(65,30) DEFAULT 0.30 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tenants OWNER TO dbsudoluxgarden;

--
-- Name: users; Type: TABLE; Schema: public; Owner: dbsudoluxgarden
--

CREATE TABLE public.users (
    id text NOT NULL,
    tenant_id text NOT NULL,
    role public."Role" NOT NULL,
    name text NOT NULL,
    email text,
    password_hash text,
    phone text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    address text,
    latitude double precision,
    longitude double precision
);


ALTER TABLE public.users OWNER TO dbsudoluxgarden;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: dbsudoluxgarden
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
df740ec2-a324-4c45-a266-e9a1f3d33d7c	33e6a7ad14e033dd37f5caa545b60eeed00b2eabdd185e5cab5b93cf55d7be81	2026-01-28 00:12:20.612062+00	20260115160904_init_v2	\N	\N	2026-01-28 00:12:20.508042+00	1
27333665-1951-4c61-aa7d-48e2d94a2a0f	e6c8251e64cc365af6fccd84b25b6ee9c9f64496e204b51b96f8dd93d49504e7	2026-01-28 00:12:20.616679+00	20260115164656_add_unit_fields	\N	\N	2026-01-28 00:12:20.613131+00	1
dc35e5d0-2f51-4d43-86f9-d434c89f2b13	f0bae54fdc58c9c2431e23e71b3c80d5733d777c2397be1f061b30deeb1f38d8	2026-01-28 00:12:20.631654+00	20260115170326_add_season_allocations	\N	\N	2026-01-28 00:12:20.618335+00	1
de58a096-d4a1-4827-aca1-58a82b6a89e4	0945c21a6fb8d601bd145976737cc2f65401c0b1dcf5d3ff7552d06bf4818b9a	2026-01-28 00:12:20.637664+00	20260128000440_add_geo_to_user	\N	\N	2026-01-28 00:12:20.633074+00	1
c0ec929a-c933-41b9-a437-93399750be24	d6cd4f6d3e8fc98e642c0b5a3fb1c1c40fdc6664e13a12769e6d50f122d066c4	2026-01-28 00:12:20.64263+00	20260128000927_add_repartidor_role	\N	\N	2026-01-28 00:12:20.638639+00	1
4c02aed5-b2af-4aa4-8e2e-f4c11bab0540	774b57950866604681dee8abe0648bc3b705322353eab8cf15b76d1beeefba09	2026-01-28 00:15:24.080134+00	20260128001524_add_price_per_unit	\N	\N	2026-01-28 00:15:24.076319+00	1
fbf3a381-0350-48ab-8047-ab636ac4b5f3	47bb2214b4576a5500eb9dc64d5cd3e7b98bed1ed5db6bb5d87690d3739762fd	2026-01-28 00:23:23.364121+00	20260128002323_add_reviews_and_messaging_v2	\N	\N	2026-01-28 00:23:23.337703+00	1
0d102d5a-45b0-44cd-9cbf-9d8c8c07da0b	486c7650a6c2f9e993734b95cda346e9fe12bad9786f4ad601cbc75b0c1b6340	2026-01-28 13:20:13.028934+00	20260128132013_add_photo_url_to_offer	\N	\N	2026-01-28 13:20:13.011808+00	1
fb51cd2a-8836-4687-ac6e-552acf0b9ebe	329a0161a2d1f6020729c50902158f94ff1975a810f84af00285dfcf4cf65692	2026-01-29 08:24:26.701831+00	20260129082426_add_image_url_to_product	\N	\N	2026-01-29 08:24:26.697321+00	1
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: dbsudoluxgarden
--

COPY public.chat_messages (id, tenant_id, sender_id, receiver_id, content, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: credits; Type: TABLE DATA; Schema: public; Owner: dbsudoluxgarden
--

COPY public.credits (id, tenant_id, consumer_id, order_item_id, amount, reason, is_used, used_in_order, created_at) FROM stdin;
\.


--
-- Data for Name: deliveries; Type: TABLE DATA; Schema: public; Owner: dbsudoluxgarden
--

COPY public.deliveries (id, tenant_id, order_id, producer_id, bin_number, delivery_qr_token, confirmed_at, confirmed_by, created_at) FROM stdin;
\.


--
-- Data for Name: feed_likes; Type: TABLE DATA; Schema: public; Owner: dbsudoluxgarden
--

COPY public.feed_likes (id, post_id, consumer_id, created_at) FROM stdin;
\.


--
-- Data for Name: feed_posts; Type: TABLE DATA; Schema: public; Owner: dbsudoluxgarden
--

COPY public.feed_posts (id, tenant_id, producer_id, product_id, message, photo_url, event_type, created_at) FROM stdin;
\.


--
-- Data for Name: offers; Type: TABLE DATA; Schema: public; Owner: dbsudoluxgarden
--

COPY public.offers (id, tenant_id, producer_id, product_id, week, available_quantity_kg, available_units, available_min_kg, available_max_kg, is_confirmed, created_at, photo_url) FROM stdin;
8bd03962-3646-4cc6-98f3-e2e51c34f092	nodo-caceres-id	128a329a-1a89-451d-83cc-e915a864324d	9862f8ad-1556-419a-b2e9-05740356e2bb	2026-02-02	\N	26	\N	\N	t	2026-02-03 09:31:47.254	/uploads/miel.png
594d8b0f-6247-461b-8bc7-cee8d3222e78	nodo-caceres-id	128a329a-1a89-451d-83cc-e915a864324d	9862f8ad-1556-419a-b2e9-05740356e2bb	2026-02-09	\N	25	\N	\N	t	2026-02-03 09:31:47.257	/uploads/miel.png
eedc579d-6a12-436a-8b9c-afd0558cd995	nodo-caceres-id	128a329a-1a89-451d-83cc-e915a864324d	9a32949d-9cd4-4959-b468-ea65e2c159b5	2026-02-02	\N	14	\N	\N	t	2026-02-03 09:31:47.262	/uploads/miel.png
135de99b-453b-4892-8cd3-e983853b2b39	nodo-caceres-id	128a329a-1a89-451d-83cc-e915a864324d	9a32949d-9cd4-4959-b468-ea65e2c159b5	2026-02-09	\N	14	\N	\N	t	2026-02-03 09:31:47.264	/uploads/miel.png
f32db8f1-78af-4030-bac2-d9199291a98e	nodo-caceres-id	832304f0-5cc6-49e5-9bf7-d5d037eef62f	23ff96a4-de60-403f-9aee-3fdf0c663372	2026-02-02	27.254267473176810000000000000000	\N	\N	\N	t	2026-02-03 09:31:47.27	/uploads/tomaterosa.png
dd6e693a-f7bf-4441-94a4-53c57895d81f	nodo-caceres-id	832304f0-5cc6-49e5-9bf7-d5d037eef62f	23ff96a4-de60-403f-9aee-3fdf0c663372	2026-02-09	30.169771936607280000000000000000	\N	\N	\N	t	2026-02-03 09:31:47.273	/uploads/tomaterosa.png
99a1d422-735c-483c-99dc-da004bd1ec9f	nodo-caceres-id	832304f0-5cc6-49e5-9bf7-d5d037eef62f	5d55ceba-8b03-4107-850c-7b0957319a1e	2026-02-02	\N	17	\N	\N	t	2026-02-03 09:31:47.279	/uploads/calabacinluna.png
03fef311-5737-4ee8-9e02-15492c653d64	nodo-caceres-id	832304f0-5cc6-49e5-9bf7-d5d037eef62f	5d55ceba-8b03-4107-850c-7b0957319a1e	2026-02-09	\N	28	\N	\N	t	2026-02-03 09:31:47.28	/uploads/calabacinluna.png
16674898-c44e-40b4-b29d-c6e5a65e2fc4	nodo-caceres-id	c5c141cc-672f-4fff-81c9-f25f9db7cb40	9cc48aa2-f6bb-43a9-a50c-ef56d3684311	2026-02-02	45.470197231543710000000000000000	\N	\N	\N	t	2026-02-03 09:31:47.286	/uploads/berenjenablanca.png
09d57392-dfcd-4004-97d4-eba24fa4d180	nodo-caceres-id	c5c141cc-672f-4fff-81c9-f25f9db7cb40	9cc48aa2-f6bb-43a9-a50c-ef56d3684311	2026-02-09	36.177191988355990000000000000000	\N	\N	\N	t	2026-02-03 09:31:47.288	/uploads/berenjenablanca.png
84b682c3-57e0-49fa-a54a-61c52da493c7	nodo-caceres-id	c5c141cc-672f-4fff-81c9-f25f9db7cb40	8f14c9cc-a78a-47e9-b767-49e3ea772424	2026-02-02	39.027540474935820000000000000000	\N	\N	\N	t	2026-02-03 09:31:47.293	/uploads/pimientosdelpadron.png
b1e7f7ad-5d18-4706-be55-41ea3179a79b	nodo-caceres-id	c5c141cc-672f-4fff-81c9-f25f9db7cb40	8f14c9cc-a78a-47e9-b767-49e3ea772424	2026-02-09	39.017400286860960000000000000000	\N	\N	\N	t	2026-02-03 09:31:47.295	/uploads/pimientosdelpadron.png
1ed7fa56-3502-40e8-a67e-9f7026ac8dc3	nodo-caceres-id	419b91c4-bddf-4d38-859b-dd3b888af6c1	757dfa3c-de23-4722-83f9-dc8bc074bf1a	2026-02-02	37.138087407120660000000000000000	\N	\N	\N	t	2026-02-03 09:31:47.302	/uploads/brocolifractal.png
c1f7ce6b-b6b2-4382-bc21-393f55804346	nodo-caceres-id	419b91c4-bddf-4d38-859b-dd3b888af6c1	757dfa3c-de23-4722-83f9-dc8bc074bf1a	2026-02-09	34.882999576598620000000000000000	\N	\N	\N	t	2026-02-03 09:31:47.304	/uploads/brocolifractal.png
7e1027fd-b891-44fe-8963-b97e115e37f9	nodo-caceres-id	419b91c4-bddf-4d38-859b-dd3b888af6c1	767bda20-0398-4ab4-a56c-307d0915e3ed	2026-02-02	\N	12	\N	\N	t	2026-02-03 09:31:47.309	/uploads/coliflorpurpura.png
eeda85ff-7fc0-48f8-9f1f-e3f6d49da2d6	nodo-caceres-id	419b91c4-bddf-4d38-859b-dd3b888af6c1	767bda20-0398-4ab4-a56c-307d0915e3ed	2026-02-09	\N	25	\N	\N	t	2026-02-03 09:31:47.311	/uploads/coliflorpurpura.png
ae866309-fb8c-4469-bb8e-e6676c71542d	nodo-caceres-id	491e9734-2e95-4382-8d23-80c110115601	555e33a6-dbd8-47e7-a683-f6c1aeecdde7	2026-02-02	\N	10	\N	\N	t	2026-02-03 09:31:47.316	/uploads/Esparragotriguer.png
25e1956b-7cd8-4809-a42c-5b3a47310a62	nodo-caceres-id	491e9734-2e95-4382-8d23-80c110115601	555e33a6-dbd8-47e7-a683-f6c1aeecdde7	2026-02-09	\N	12	\N	\N	t	2026-02-03 09:31:47.318	/uploads/Esparragotriguer.png
4f799027-c8ed-4395-850e-9e88e44dd032	nodo-caceres-id	491e9734-2e95-4382-8d23-80c110115601	45ddd61c-f67d-47be-9a83-515353b59f23	2026-02-02	29.979911237478350000000000000000	\N	\N	\N	t	2026-02-03 09:31:47.323	/uploads/judiaverdeplana.png
6101c62f-fabe-4871-bdf0-90dcb0e13e14	nodo-caceres-id	491e9734-2e95-4382-8d23-80c110115601	45ddd61c-f67d-47be-9a83-515353b59f23	2026-02-09	35.826445689539840000000000000000	\N	\N	\N	t	2026-02-03 09:31:47.324	/uploads/judiaverdeplana.png
8c699517-b1c7-4296-959e-8d5ed6738dfe	nodo-caceres-id	832304f0-5cc6-49e5-9bf7-d5d037eef62f	f63c1a6a-8e97-4361-913e-6539471c399f	2026-02-02	28.647558483278110000000000000000	\N	\N	\N	t	2026-02-03 09:31:47.33	/uploads/patata.png
23371ac8-aa69-4cf0-b11d-7b51ee168522	nodo-caceres-id	832304f0-5cc6-49e5-9bf7-d5d037eef62f	f63c1a6a-8e97-4361-913e-6539471c399f	2026-02-09	46.904320129970490000000000000000	\N	\N	\N	t	2026-02-03 09:31:47.331	/uploads/patata.png
0588087c-736a-4156-aad1-5f8542280ca4	nodo-caceres-id	c5c141cc-672f-4fff-81c9-f25f9db7cb40	6c7d5024-fddb-44b7-ba61-3a161c4e23d1	2026-02-02	41.482381006600080000000000000000	\N	\N	\N	t	2026-02-03 09:31:47.336	/uploads/batatadulce.png
330b494a-385b-49a8-9926-aba161380e71	nodo-caceres-id	c5c141cc-672f-4fff-81c9-f25f9db7cb40	6c7d5024-fddb-44b7-ba61-3a161c4e23d1	2026-02-09	44.231511149731530000000000000000	\N	\N	\N	t	2026-02-03 09:31:47.338	/uploads/batatadulce.png
8f86738a-433f-4164-a700-c78e5229f394	nodo-caceres-id	419b91c4-bddf-4d38-859b-dd3b888af6c1	066b1476-ddea-46eb-a5de-0f3de9449656	2026-02-02	28.856790764569720000000000000000	\N	\N	\N	t	2026-02-03 09:31:47.345	/uploads/cebollamorada.png
1819365a-3a14-4fcc-aa8d-d4355c7e88f8	nodo-caceres-id	419b91c4-bddf-4d38-859b-dd3b888af6c1	066b1476-ddea-46eb-a5de-0f3de9449656	2026-02-09	34.687794335228280000000000000000	\N	\N	\N	t	2026-02-03 09:31:47.347	/uploads/cebollamorada.png
ae04042e-77c7-4587-ae21-a11e4beb726a	nodo-caceres-id	128a329a-1a89-451d-83cc-e915a864324d	00864fdf-34b8-4338-80e8-593a28489c39	2026-02-02	\N	11	\N	\N	t	2026-02-03 09:31:47.352	/uploads/ajonegro.png
d717cf74-459d-4f31-99da-d9c7799d08cc	nodo-caceres-id	128a329a-1a89-451d-83cc-e915a864324d	00864fdf-34b8-4338-80e8-593a28489c39	2026-02-09	\N	22	\N	\N	t	2026-02-03 09:31:47.354	/uploads/ajonegro.png
26a1cf6a-7e0a-401b-97e4-af48bc97e6c9	nodo-caceres-id	491e9734-2e95-4382-8d23-80c110115601	4cf9a1fa-8ac2-49ab-8deb-679fe3b2abb8	2026-02-02	\N	15	\N	\N	t	2026-02-03 09:31:47.361	/uploads/apio.png
16dddbe5-a18c-406f-95ac-5c89429d97d6	nodo-caceres-id	491e9734-2e95-4382-8d23-80c110115601	4cf9a1fa-8ac2-49ab-8deb-679fe3b2abb8	2026-02-09	\N	23	\N	\N	t	2026-02-03 09:31:47.363	/uploads/apio.png
042b76c6-e687-4435-aa94-f81e405f8926	nodo-caceres-id	832304f0-5cc6-49e5-9bf7-d5d037eef62f	d2c73691-c063-417e-8586-2a118d969695	2026-02-02	\N	11	\N	\N	t	2026-02-03 09:31:47.369	/uploads/acelgaarcoiris.png
a1040440-c2ca-4609-b229-8ed61b51a40b	nodo-caceres-id	832304f0-5cc6-49e5-9bf7-d5d037eef62f	d2c73691-c063-417e-8586-2a118d969695	2026-02-09	\N	22	\N	\N	t	2026-02-03 09:31:47.371	/uploads/acelgaarcoiris.png
0662fd4d-2a6f-4886-a678-d488b63d87c0	nodo-caceres-id	c5c141cc-672f-4fff-81c9-f25f9db7cb40	16dfc01d-fd50-4e7e-9103-6b6f62f81a1a	2026-02-02	\N	16	\N	\N	t	2026-02-03 09:31:47.377	/uploads/espinacahojaancha.png
be659bb5-1e07-48f6-af89-38afa42cfb3f	nodo-caceres-id	c5c141cc-672f-4fff-81c9-f25f9db7cb40	16dfc01d-fd50-4e7e-9103-6b6f62f81a1a	2026-02-09	\N	19	\N	\N	t	2026-02-03 09:31:47.379	/uploads/espinacahojaancha.png
87a5db2c-ee5d-4f52-b368-459629409afd	nodo-caceres-id	419b91c4-bddf-4d38-859b-dd3b888af6c1	676e0850-3bf2-4fc5-88d8-97e364e5f42d	2026-02-02	\N	13	\N	\N	t	2026-02-03 09:31:47.384	/uploads/rucula.png
bf6da739-ec51-40d9-ab77-bc9352de6e78	nodo-caceres-id	419b91c4-bddf-4d38-859b-dd3b888af6c1	676e0850-3bf2-4fc5-88d8-97e364e5f42d	2026-02-09	\N	26	\N	\N	t	2026-02-03 09:31:47.386	/uploads/rucula.png
5f90fe3e-737a-46b1-9784-5039b8e83c81	nodo-caceres-id	491e9734-2e95-4382-8d23-80c110115601	ab10c5b3-6ce0-4124-b6b4-6e4077fdf9a1	2026-02-02	\N	16	\N	\N	t	2026-02-03 09:31:47.394	/uploads/kalerizadobio.png
a5b0bed2-7cda-4be5-ad3e-d46d9fe8ed5d	nodo-caceres-id	491e9734-2e95-4382-8d23-80c110115601	ab10c5b3-6ce0-4124-b6b4-6e4077fdf9a1	2026-02-09	\N	10	\N	\N	t	2026-02-03 09:31:47.396	/uploads/kalerizadobio.png
3db8c56b-393c-4dc2-ae23-b5e5632aa8c5	nodo-caceres-id	832304f0-5cc6-49e5-9bf7-d5d037eef62f	3d9cd8fd-d92a-4661-9693-5194737f5ffe	2026-02-02	\N	10	\N	\N	t	2026-02-03 09:31:47.401	/uploads/puerro.png
ed7d9fca-e003-4eed-9873-5c409ff8801a	nodo-caceres-id	832304f0-5cc6-49e5-9bf7-d5d037eef62f	3d9cd8fd-d92a-4661-9693-5194737f5ffe	2026-02-09	\N	11	\N	\N	t	2026-02-03 09:31:47.403	/uploads/puerro.png
319587b7-d82a-4cf9-9d96-418c3491254f	nodo-caceres-id	c5c141cc-672f-4fff-81c9-f25f9db7cb40	37924777-fdde-4e96-83be-0a3507adeaf0	2026-02-02	49.910771512693690000000000000000	\N	\N	\N	t	2026-02-03 09:31:47.409	/uploads/chirivia.png
99f38686-109e-4d51-bd14-441a5333649f	nodo-caceres-id	c5c141cc-672f-4fff-81c9-f25f9db7cb40	37924777-fdde-4e96-83be-0a3507adeaf0	2026-02-09	36.027212317334170000000000000000	\N	\N	\N	t	2026-02-03 09:31:47.411	/uploads/chirivia.png
eee36ac6-be0f-4db0-aff6-93a4a72be93c	nodo-caceres-id	419b91c4-bddf-4d38-859b-dd3b888af6c1	f7ee3f85-c4ab-4baa-acd4-3a4f4af13d94	2026-02-02	\N	25	\N	\N	t	2026-02-03 09:31:47.417	/uploads/rabano.png
76cdbbb1-b750-4dcc-af6e-52a15a9fccc7	nodo-caceres-id	419b91c4-bddf-4d38-859b-dd3b888af6c1	f7ee3f85-c4ab-4baa-acd4-3a4f4af13d94	2026-02-09	\N	26	\N	\N	t	2026-02-03 09:31:47.419	/uploads/rabano.png
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: dbsudoluxgarden
--

COPY public.order_items (id, order_id, product_id, estimated_quantity_kg, estimated_units, estimated_price, assigned_to_producer, actual_weight_kg, final_price, has_incident, incident_type, incident_photo_url, credit_issued) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: dbsudoluxgarden
--

COPY public.orders (id, tenant_id, consumer_id, week, status, pickup_qr_token, pickup_confirmed_at, pickup_confirmed_by, total_estimated, total_final, created_at, bin_number, delivery_distance_km, delivery_fee) FROM stdin;
\.


--
-- Data for Name: producer_priorities; Type: TABLE DATA; Schema: public; Owner: dbsudoluxgarden
--

COPY public.producer_priorities (id, tenant_id, season_id, priority_order, producer_id, product_id, created_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: dbsudoluxgarden
--

COPY public.products (id, tenant_id, name, latin_name, local_name, unit_type, price_per_kg, min_weight_kg, max_weight_kg, items_per_bunch_min, items_per_bunch_max, price_per_bunch, nutritional_info, recipes, created_at, unit_description, price_per_unit, image_url) FROM stdin;
ab10c5b3-6ce0-4124-b6b4-6e4077fdf9a1	nodo-caceres-id	Kale Rizado Bio	\N	\N	bunch	\N	\N	\N	\N	\N	2.500000000000000000000000000000	\N	\N	2026-02-03 09:31:47.39	Súper alimento del huerto.	\N	/uploads/kalerizadobio.png
3d9cd8fd-d92a-4661-9693-5194737f5ffe	nodo-caceres-id	Puerro Fino de Arena	\N	\N	bunch	\N	\N	\N	\N	\N	2.000000000000000000000000000000	\N	\N	2026-02-03 09:31:47.399	Sabor delicado para tus cremas.	\N	/uploads/puerro.png
37924777-fdde-4e96-83be-0a3507adeaf0	nodo-caceres-id	Chirivía Dulce	\N	\N	weight_variable	2.300000000000000000000000000000	\N	\N	\N	\N	\N	\N	\N	2026-02-03 09:31:47.407	Pura esencia de invierno.	\N	/uploads/chirivia.png
f7ee3f85-c4ab-4baa-acd4-3a4f4af13d94	nodo-caceres-id	Rábano Sandía (Red Meat)	\N	\N	bunch	\N	\N	\N	\N	\N	2.600000000000000000000000000000	\N	\N	2026-02-03 09:31:47.415	Rosa por dentro, verde por fuera.	\N	/uploads/rabano.png
9862f8ad-1556-419a-b2e9-05740356e2bb	nodo-caceres-id	Miel de Milflores Silvestres	\N	\N	unit	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-03 09:31:47.251	Cosecha de primavera en la Sierra de Gata.	8.500000000000000000000000000000	/uploads/miel.png
9a32949d-9cd4-4959-b468-ea65e2c159b5	nodo-caceres-id	Miel de Encina Pura	\N	\N	unit	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-03 09:31:47.26	Oscura, densa y con toques de bosque.	12.000000000000000000000000000000	/uploads/miel.png
23ff96a4-de60-403f-9aee-3fdf0c663372	nodo-caceres-id	Tomate Rosa de Aliseda	\N	\N	weight_variable	4.500000000000000000000000000000	\N	\N	\N	\N	\N	\N	\N	2026-02-03 09:31:47.268	Gigante, carnoso y con el sabor de antes.	\N	/uploads/tomaterosa.png
5d55ceba-8b03-4107-850c-7b0957319a1e	nodo-caceres-id	Calabacín Luna (Redondo)	\N	\N	unit	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-03 09:31:47.276	Perfecto para rellenar, piel tierna.	1.800000000000000000000000000000	/uploads/calabacinluna.png
9cc48aa2-f6bb-43a9-a50c-ef56d3684311	nodo-caceres-id	Berenjena Blanca Preciosa	\N	\N	weight_variable	3.200000000000000000000000000000	\N	\N	\N	\N	\N	\N	\N	2026-02-03 09:31:47.283	Dulzura extrema sin amargor.	\N	/uploads/berenjenablanca.png
8f14c9cc-a78a-47e9-b767-49e3ea772424	nodo-caceres-id	Pimiento de Padrón Peligroso	\N	\N	weight_fixed	2.500000000000000000000000000000	\N	\N	\N	\N	\N	\N	\N	2026-02-03 09:31:47.29	Unos pican y otros no.	\N	/uploads/pimientosdelpadron.png
757dfa3c-de23-4722-83f9-dc8bc074bf1a	nodo-caceres-id	Brócoli Fractal (Romanesco)	\N	\N	weight_fixed	3.800000000000000000000000000000	\N	\N	\N	\N	\N	\N	\N	2026-02-03 09:31:47.299	Geometría perfecta en tu plato.	\N	/uploads/brocolifractal.png
767bda20-0398-4ab4-a56c-307d0915e3ed	nodo-caceres-id	Coliflor Púrpura Real	\N	\N	unit	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-03 09:31:47.307	Mantiene su color tras el vapor.	4.200000000000000000000000000000	/uploads/coliflorpurpura.png
555e33a6-dbd8-47e7-a683-f6c1aeecdde7	nodo-caceres-id	Espárrago Triguero de Rivera	\N	\N	bunch	\N	\N	\N	\N	\N	4.500000000000000000000000000000	\N	\N	2026-02-03 09:31:47.314	Finos y con un toque amargo delicioso.	\N	/uploads/Esparragotriguer.png
45ddd61c-f67d-47be-9a83-515353b59f23	nodo-caceres-id	Judía Verde Plana Extra	\N	\N	weight_fixed	3.100000000000000000000000000000	\N	\N	\N	\N	\N	\N	\N	2026-02-03 09:31:47.32	Sin hebras, crujiente total.	\N	/uploads/judiaverdeplana.png
f63c1a6a-8e97-4361-913e-6539471c399f	nodo-caceres-id	Patata Agria de Secano	\N	\N	weight_fixed	1.200000000000000000000000000000	\N	\N	\N	\N	\N	\N	\N	2026-02-03 09:31:47.328	La reina de las patatas fritas.	\N	/uploads/patata.png
6c7d5024-fddb-44b7-ba61-3a161c4e23d1	nodo-caceres-id	Batata Dulce de la Huerta	\N	\N	weight_variable	2.400000000000000000000000000000	\N	\N	\N	\N	\N	\N	\N	2026-02-03 09:31:47.334	Textura suave, ideal para asar.	\N	/uploads/batatadulce.png
066b1476-ddea-46eb-a5de-0f3de9449656	nodo-caceres-id	Cebolla Morada de Verano	\N	\N	weight_fixed	1.800000000000000000000000000000	\N	\N	\N	\N	\N	\N	\N	2026-02-03 09:31:47.343	Dulce, ideal para ensaladas crudas.	\N	/uploads/cebollamorada.png
00864fdf-34b8-4338-80e8-593a28489c39	nodo-caceres-id	Ajo Negro Fermentado	\N	\N	unit	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-03 09:31:47.35	Sabor umami, textura de gominola.	6.000000000000000000000000000000	/uploads/ajonegro.png
4cf9a1fa-8ac2-49ab-8deb-679fe3b2abb8	nodo-caceres-id	Apio Crujiente de Montaña	\N	\N	unit	\N	\N	\N	\N	\N	\N	\N	\N	2026-02-03 09:31:47.357	Tallos gruesos y llenos de agua.	1.500000000000000000000000000000	/uploads/apio.png
d2c73691-c063-417e-8586-2a118d969695	nodo-caceres-id	Acelga Arcoíris	\N	\N	bunch	\N	\N	\N	\N	\N	2.800000000000000000000000000000	\N	\N	2026-02-03 09:31:47.367	Tallos de colores vibrantes.	\N	/uploads/acelgaarcoiris.png
16dfc01d-fd50-4e7e-9103-6b6f62f81a1a	nodo-caceres-id	Espinaca de Hoja Ancha	\N	\N	bunch	\N	\N	\N	\N	\N	2.200000000000000000000000000000	\N	\N	2026-02-03 09:31:47.374	Tiernas y recién cortadas.	\N	/uploads/espinacahojaancha.png
676e0850-3bf2-4fc5-88d8-97e364e5f42d	nodo-caceres-id	Rúcula Selvática Picante	\N	\N	bunch	\N	\N	\N	\N	\N	1.900000000000000000000000000000	\N	\N	2026-02-03 09:31:47.382	Mucho más sabor que la de super.	\N	/uploads/rucula.png
\.


--
-- Data for Name: qr_tokens; Type: TABLE DATA; Schema: public; Owner: dbsudoluxgarden
--

COPY public.qr_tokens (token, tenant_id, user_id, type, resource_id, expires_at, used_at, created_at) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: dbsudoluxgarden
--

COPY public.reviews (id, tenant_id, consumer_id, product_id, producer_id, order_item_id, rating, comment, created_at) FROM stdin;
\.


--
-- Data for Name: season_allocations; Type: TABLE DATA; Schema: public; Owner: dbsudoluxgarden
--

COPY public.season_allocations (id, tenant_id, season_id, producer_id, product_id, assigned_at) FROM stdin;
\.


--
-- Data for Name: seasons; Type: TABLE DATA; Schema: public; Owner: dbsudoluxgarden
--

COPY public.seasons (id, tenant_id, name, start_date, end_date, is_active, status, producer_rotation, created_at) FROM stdin;
\.


--
-- Data for Name: settlements; Type: TABLE DATA; Schema: public; Owner: dbsudoluxgarden
--

COPY public.settlements (id, tenant_id, producer_id, week, total_sales, total_refunds, total_weight_adjustments, net_amount, is_closed, closed_by, closed_at, created_at) FROM stdin;
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: dbsudoluxgarden
--

COPY public.tenants (id, name, currency_code, km_rate, created_at) FROM stdin;
nodo-caceres-id	Nodo Cáceres	EUR	0.300000000000000000000000000000	2026-01-28 00:16:21.167
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: dbsudoluxgarden
--

COPY public.users (id, tenant_id, role, name, email, password_hash, phone, is_active, created_at, address, latitude, longitude) FROM stdin;
5cd60eac-a604-4448-9d19-76e72e93ad4b	nodo-caceres-id	consumer	Aura Galáctica	consumer0@huertify.test	$2b$10$Pe7etUdjWTXLMRN7qckIdeJqgaQ8MlFcJGDgw5I/UrygpsPorSrE2	\N	t	2026-01-28 00:16:21.19	Calle Falsa 10, Cáceres	39.47928750324358	-6.368006986876242
9b9f1659-6d3c-48d5-8eac-b2d45f8a9edf	nodo-caceres-id	consumer	Marcos El Gourmet	consumer1@huertify.test	$2b$10$Pe7etUdjWTXLMRN7qckIdeJqgaQ8MlFcJGDgw5I/UrygpsPorSrE2	\N	t	2026-01-28 00:16:21.192	Calle Falsa 11, Cáceres	39.47668306425643	-6.37419975466605
d77c0f6e-05f9-4ade-b027-136f1f35b328	nodo-caceres-id	consumer	Selma La Sostenible	consumer2@huertify.test	$2b$10$Pe7etUdjWTXLMRN7qckIdeJqgaQ8MlFcJGDgw5I/UrygpsPorSrE2	\N	t	2026-01-28 00:16:21.195	Calle Falsa 12, Cáceres	39.47538659142964	-6.376943828809877
addf4b71-b621-4dc8-a10d-035938fb67ed	nodo-caceres-id	consumer	Hugo El Cocinillas	consumer3@huertify.test	$2b$10$Pe7etUdjWTXLMRN7qckIdeJqgaQ8MlFcJGDgw5I/UrygpsPorSrE2	\N	t	2026-01-28 00:16:21.197	Calle Falsa 13, Cáceres	39.47976648384036	-6.370014644041414
985b1421-97e5-4184-be56-10099fd80c6a	nodo-caceres-id	consumer	Elena Eco-Warrior	consumer4@huertify.test	$2b$10$Pe7etUdjWTXLMRN7qckIdeJqgaQ8MlFcJGDgw5I/UrygpsPorSrE2	\N	t	2026-01-28 00:16:21.2	Calle Falsa 14, Cáceres	39.47009418879985	-6.367966933558134
37c13a3b-e4cb-4ab5-a827-9728f71d1103	nodo-caceres-id	consumer	Zoe La Vegana	consumer5@huertify.test	$2b$10$Pe7etUdjWTXLMRN7qckIdeJqgaQ8MlFcJGDgw5I/UrygpsPorSrE2	\N	t	2026-01-28 00:16:21.203	Calle Falsa 15, Cáceres	39.47150259108809	-6.37272499791057
554e52a6-db83-4dd1-9e76-61baefe12000	nodo-caceres-id	consumer	Bruno Delicatesen	consumer6@huertify.test	$2b$10$Pe7etUdjWTXLMRN7qckIdeJqgaQ8MlFcJGDgw5I/UrygpsPorSrE2	\N	t	2026-01-28 00:16:21.205	Calle Falsa 16, Cáceres	39.47715352414247	-6.369459779850505
cd005147-8542-4dbc-b4c5-de75ca0080ff	nodo-caceres-id	consumer	Nina Natural	consumer7@huertify.test	$2b$10$Pe7etUdjWTXLMRN7qckIdeJqgaQ8MlFcJGDgw5I/UrygpsPorSrE2	\N	t	2026-01-28 00:16:21.208	Calle Falsa 17, Cáceres	39.47307091620161	-6.376611669152897
ebfcf48a-9d9c-4666-aaee-c875018d70a9	nodo-caceres-id	consumer	Leo Sabores	consumer8@huertify.test	$2b$10$Pe7etUdjWTXLMRN7qckIdeJqgaQ8MlFcJGDgw5I/UrygpsPorSrE2	\N	t	2026-01-28 00:16:21.21	Calle Falsa 18, Cáceres	39.47475882082593	-6.370984747036045
d43b3a64-2714-45cd-8179-d8972d1da9cf	nodo-caceres-id	consumer	Alma Raíces	consumer9@huertify.test	$2b$10$Pe7etUdjWTXLMRN7qckIdeJqgaQ8MlFcJGDgw5I/UrygpsPorSrE2	\N	t	2026-01-28 00:16:21.213	Calle Falsa 19, Cáceres	39.47127477377909	-6.371555419449496
ee37402d-70d7-43d0-8eba-fe49db06b84c	nodo-caceres-id	consumer	Silvio Gourmet	consumer10@huertify.test	$2b$10$Pe7etUdjWTXLMRN7qckIdeJqgaQ8MlFcJGDgw5I/UrygpsPorSrE2	\N	t	2026-01-28 00:16:21.215	Calle Falsa 20, Cáceres	39.47592448262689	-6.369178828916731
834a41b4-1539-429a-ac50-7df9e074386d	nodo-caceres-id	consumer	Lola Pura Vida	consumer11@huertify.test	$2b$10$Pe7etUdjWTXLMRN7qckIdeJqgaQ8MlFcJGDgw5I/UrygpsPorSrE2	\N	t	2026-01-28 00:16:21.218	Calle Falsa 21, Cáceres	39.47900273290423	-6.37622015757434
e5426430-8df1-470a-95c2-2cb68ef747ec	nodo-caceres-id	producer	Producer One	producer1@test.com	$2b$10$cMD6PfMkvjB3S8nzCmGw1eVMTgJEev2SESNIrBrP8CYVvAyA0k8C2	\N	t	2026-01-30 08:43:44.164	\N	\N	\N
128a329a-1a89-451d-83cc-e915a864324d	nodo-caceres-id	producer	Bea "La de la Miel"	bea@la-colmena.es	$2b$10$qSqcoMZlUVVD2/sfEhSPEu1wIrTVdF5eOmVhkpLhc71muN7hPCIfa	\N	t	2026-01-28 00:16:21.174	Calle Colmena 1, Cáceres	39.475	-6.372
832304f0-5cc6-49e5-9bf7-d5d037eef62f	nodo-caceres-id	producer	Abuelo Paco	paco@huerto-tradicion.es	$2b$10$Pe7etUdjWTXLMRN7qckIdeJqgaQ8MlFcJGDgw5I/UrygpsPorSrE2	\N	t	2026-01-28 00:16:21.179	Camino del Río 5, Cáceres	39.478	-6.375
c5c141cc-672f-4fff-81c9-f25f9db7cb40	nodo-caceres-id	producer	Hortelanos Reales	info@hortelanos-reales.es	$2b$10$Pe7etUdjWTXLMRN7qckIdeJqgaQ8MlFcJGDgw5I/UrygpsPorSrE2	\N	t	2026-01-28 00:16:21.182	Avenida del Campo 12, Cáceres	39.48	-6.37
419b91c4-bddf-4d38-859b-dd3b888af6c1	nodo-caceres-id	producer	Tierra y Libertad	cooperativa@tierra.org	$2b$10$Pe7etUdjWTXLMRN7qckIdeJqgaQ8MlFcJGDgw5I/UrygpsPorSrE2	\N	t	2026-01-28 00:16:21.184	Plaza del Grano 3, Cáceres	39.472	-6.378
6307875c-4e56-4475-8816-3f763534e472	nodo-caceres-id	captain	Capitán Garfio	captain@huertify.local	$2b$10$t84c3MwzCE11o24iG/eN4u0227VqoIzWX44SmLx7.R37be/V73M/m	\N	t	2026-01-28 00:17:45.424	\N	\N	\N
031952ea-e636-43eb-8bc7-a9a39666cdc0	nodo-caceres-id	repartidor	Rafa Repartidor	repartidor@huertify.test	$2b$10$t84c3MwzCE11o24iG/eN4u0227VqoIzWX44SmLx7.R37be/V73M/m	\N	t	2026-01-28 00:17:45.427	\N	\N	\N
491e9734-2e95-4382-8d23-80c110115601	nodo-caceres-id	producer	El Vergel de Luis	luis@vergel.es	$2b$10$Pe7etUdjWTXLMRN7qckIdeJqgaQ8MlFcJGDgw5I/UrygpsPorSrE2	\N	t	2026-01-28 00:16:21.187	Calle Huertas 8, Cáceres	39.476	-6.374
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: credits credits_pkey; Type: CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.credits
    ADD CONSTRAINT credits_pkey PRIMARY KEY (id);


--
-- Name: deliveries deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_pkey PRIMARY KEY (id);


--
-- Name: feed_likes feed_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.feed_likes
    ADD CONSTRAINT feed_likes_pkey PRIMARY KEY (id);


--
-- Name: feed_posts feed_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.feed_posts
    ADD CONSTRAINT feed_posts_pkey PRIMARY KEY (id);


--
-- Name: offers offers_pkey; Type: CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: producer_priorities producer_priorities_pkey; Type: CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.producer_priorities
    ADD CONSTRAINT producer_priorities_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: qr_tokens qr_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.qr_tokens
    ADD CONSTRAINT qr_tokens_pkey PRIMARY KEY (token);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: season_allocations season_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.season_allocations
    ADD CONSTRAINT season_allocations_pkey PRIMARY KEY (id);


--
-- Name: seasons seasons_pkey; Type: CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.seasons
    ADD CONSTRAINT seasons_pkey PRIMARY KEY (id);


--
-- Name: settlements settlements_pkey; Type: CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.settlements
    ADD CONSTRAINT settlements_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: deliveries_delivery_qr_token_idx; Type: INDEX; Schema: public; Owner: dbsudoluxgarden
--

CREATE INDEX deliveries_delivery_qr_token_idx ON public.deliveries USING btree (delivery_qr_token);


--
-- Name: deliveries_delivery_qr_token_key; Type: INDEX; Schema: public; Owner: dbsudoluxgarden
--

CREATE UNIQUE INDEX deliveries_delivery_qr_token_key ON public.deliveries USING btree (delivery_qr_token);


--
-- Name: feed_likes_post_id_consumer_id_key; Type: INDEX; Schema: public; Owner: dbsudoluxgarden
--

CREATE UNIQUE INDEX feed_likes_post_id_consumer_id_key ON public.feed_likes USING btree (post_id, consumer_id);


--
-- Name: offers_producer_id_product_id_week_key; Type: INDEX; Schema: public; Owner: dbsudoluxgarden
--

CREATE UNIQUE INDEX offers_producer_id_product_id_week_key ON public.offers USING btree (producer_id, product_id, week);


--
-- Name: offers_product_id_week_producer_id_idx; Type: INDEX; Schema: public; Owner: dbsudoluxgarden
--

CREATE INDEX offers_product_id_week_producer_id_idx ON public.offers USING btree (product_id, week, producer_id);


--
-- Name: offers_tenant_id_idx; Type: INDEX; Schema: public; Owner: dbsudoluxgarden
--

CREATE INDEX offers_tenant_id_idx ON public.offers USING btree (tenant_id);


--
-- Name: orders_pickup_qr_token_idx; Type: INDEX; Schema: public; Owner: dbsudoluxgarden
--

CREATE INDEX orders_pickup_qr_token_idx ON public.orders USING btree (pickup_qr_token);


--
-- Name: orders_pickup_qr_token_key; Type: INDEX; Schema: public; Owner: dbsudoluxgarden
--

CREATE UNIQUE INDEX orders_pickup_qr_token_key ON public.orders USING btree (pickup_qr_token);


--
-- Name: orders_tenant_id_week_idx; Type: INDEX; Schema: public; Owner: dbsudoluxgarden
--

CREATE INDEX orders_tenant_id_week_idx ON public.orders USING btree (tenant_id, week);


--
-- Name: producer_priorities_season_id_producer_id_priority_order_key; Type: INDEX; Schema: public; Owner: dbsudoluxgarden
--

CREATE UNIQUE INDEX producer_priorities_season_id_producer_id_priority_order_key ON public.producer_priorities USING btree (season_id, producer_id, priority_order);


--
-- Name: reviews_order_item_id_key; Type: INDEX; Schema: public; Owner: dbsudoluxgarden
--

CREATE UNIQUE INDEX reviews_order_item_id_key ON public.reviews USING btree (order_item_id);


--
-- Name: season_allocations_season_id_producer_id_product_id_key; Type: INDEX; Schema: public; Owner: dbsudoluxgarden
--

CREATE UNIQUE INDEX season_allocations_season_id_producer_id_product_id_key ON public.season_allocations USING btree (season_id, producer_id, product_id);


--
-- Name: settlements_producer_id_week_key; Type: INDEX; Schema: public; Owner: dbsudoluxgarden
--

CREATE UNIQUE INDEX settlements_producer_id_week_key ON public.settlements USING btree (producer_id, week);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: dbsudoluxgarden
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: chat_messages chat_messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: chat_messages chat_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: chat_messages chat_messages_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: credits credits_consumer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.credits
    ADD CONSTRAINT credits_consumer_id_fkey FOREIGN KEY (consumer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: credits credits_order_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.credits
    ADD CONSTRAINT credits_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: credits credits_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.credits
    ADD CONSTRAINT credits_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: credits credits_used_in_order_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.credits
    ADD CONSTRAINT credits_used_in_order_fkey FOREIGN KEY (used_in_order) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: deliveries deliveries_confirmed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_confirmed_by_fkey FOREIGN KEY (confirmed_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: deliveries deliveries_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: deliveries deliveries_producer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_producer_id_fkey FOREIGN KEY (producer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: deliveries deliveries_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: feed_likes feed_likes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.feed_likes
    ADD CONSTRAINT feed_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.feed_posts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: feed_posts feed_posts_producer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.feed_posts
    ADD CONSTRAINT feed_posts_producer_id_fkey FOREIGN KEY (producer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: feed_posts feed_posts_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.feed_posts
    ADD CONSTRAINT feed_posts_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: feed_posts feed_posts_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.feed_posts
    ADD CONSTRAINT feed_posts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: offers offers_producer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_producer_id_fkey FOREIGN KEY (producer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: offers offers_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: offers offers_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_items order_items_assigned_to_producer_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_assigned_to_producer_fkey FOREIGN KEY (assigned_to_producer) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_consumer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_consumer_id_fkey FOREIGN KEY (consumer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_pickup_confirmed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pickup_confirmed_by_fkey FOREIGN KEY (pickup_confirmed_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: producer_priorities producer_priorities_producer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.producer_priorities
    ADD CONSTRAINT producer_priorities_producer_id_fkey FOREIGN KEY (producer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: producer_priorities producer_priorities_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.producer_priorities
    ADD CONSTRAINT producer_priorities_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: producer_priorities producer_priorities_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.producer_priorities
    ADD CONSTRAINT producer_priorities_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: producer_priorities producer_priorities_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.producer_priorities
    ADD CONSTRAINT producer_priorities_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: products products_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: qr_tokens qr_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.qr_tokens
    ADD CONSTRAINT qr_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reviews reviews_consumer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_consumer_id_fkey FOREIGN KEY (consumer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reviews reviews_order_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reviews reviews_producer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_producer_id_fkey FOREIGN KEY (producer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reviews reviews_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reviews reviews_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: season_allocations season_allocations_producer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.season_allocations
    ADD CONSTRAINT season_allocations_producer_id_fkey FOREIGN KEY (producer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: season_allocations season_allocations_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.season_allocations
    ADD CONSTRAINT season_allocations_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: season_allocations season_allocations_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.season_allocations
    ADD CONSTRAINT season_allocations_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: season_allocations season_allocations_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.season_allocations
    ADD CONSTRAINT season_allocations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: seasons seasons_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.seasons
    ADD CONSTRAINT seasons_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: settlements settlements_closed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.settlements
    ADD CONSTRAINT settlements_closed_by_fkey FOREIGN KEY (closed_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: settlements settlements_producer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.settlements
    ADD CONSTRAINT settlements_producer_id_fkey FOREIGN KEY (producer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: settlements settlements_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.settlements
    ADD CONSTRAINT settlements_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: users users_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: dbsudoluxgarden
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: dbsudoluxgarden
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict Tt13hjrQ92Y9UDCwzhiDUo8rRfw4JynRoXeslkaw77NzJFVMbZvhTRGxRaSO4Fi

