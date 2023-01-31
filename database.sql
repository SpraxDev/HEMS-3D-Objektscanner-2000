--
-- PostgreSQL database dump
--

-- Dumped from database version 14.6 (Debian 14.6-1.pgdg110+1)
-- Dumped by pg_dump version 14.6 (Debian 14.6-1.pgdg110+1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: object_measurements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.object_measurements (
    id integer NOT NULL,
    object_id integer NOT NULL,
    height_index integer NOT NULL,
    rotary_table_index integer NOT NULL,
    normalized_measured_distance real NOT NULL
);


--
-- Name: object_points_point_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.object_points_point_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: object_points_point_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.object_points_point_id_seq OWNED BY public.object_measurements.id;


--
-- Name: objects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.objects (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: objects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.objects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: objects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.objects_id_seq OWNED BY public.objects.id;


--
-- Name: object_measurements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.object_measurements ALTER COLUMN id SET DEFAULT nextval('public.object_points_point_id_seq'::regclass);


--
-- Name: objects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.objects ALTER COLUMN id SET DEFAULT nextval('public.objects_id_seq'::regclass);


--
-- Name: object_measurements object_points_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.object_measurements
    ADD CONSTRAINT object_points_pk PRIMARY KEY (id);


--
-- Name: object_measurements_object_id_rotary_table_index_height_index_u; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX object_measurements_object_id_rotary_table_index_height_index_u ON public.object_measurements USING btree (object_id, rotary_table_index, height_index);


--
-- Name: objects objects_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.objects
    ADD CONSTRAINT objects_pk PRIMARY KEY (id);


--
-- Name: object_measurements object_points_objects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.object_measurements
    ADD CONSTRAINT object_points_objects_id_fk FOREIGN KEY (object_id) REFERENCES public.objects(id);


--
-- PostgreSQL database dump complete
--
