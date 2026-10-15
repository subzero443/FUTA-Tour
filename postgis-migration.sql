-- OPTIONAL production migration: apply in a PostgreSQL database with PostGIS enabled.
-- Example: psql "$DATABASE_URL" -f server/sql/postgis-migration.sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE TABLE IF NOT EXISTS campus_landmarks (
  id uuid PRIMARY KEY,
  name varchar(120) NOT NULL,
  category varchar(40) NOT NULL CHECK (category IN ('Academic','Gate','Hostel','Services')),
  description text NOT NULL DEFAULT '',
  geom geography(Point, 4326) NOT NULL,
  featured boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS campus_landmarks_geo_idx ON campus_landmarks USING GIST(geom);
-- Example spatial lookup (meters) using bind values $1 = longitude, $2 = latitude:
-- SELECT id, name FROM campus_landmarks
-- WHERE ST_DWithin(geom, ST_SetSRID(ST_MakePoint($1, $2),4326)::geography, 500);
-- This file is a migration scaffold: the starter Express server currently uses JSON.
