export const TABLES=`
CREATE TABLE IF NOT EXISTS "users" ("id"   SERIAL , "email" VARCHAR(255) UNIQUE, "password" VARCHAR(255), "firstName" VARCHAR(255), "secondName" VARCHAR(255), "role" INTEGER DEFAULT 3 , "status" INTEGER DEFAULT 1, "token" VARCHAR(255), "tempForgotPswLink" VARCHAR(255), "birthday" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "deletedAt" TIMESTAMP WITH TIME ZONE, "userId" INTEGER REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("id")); COMMENT ON COLUMN "users"."role" IS 'USER role for access';
--SELECT i.relname AS name, ix.indisprimary AS primary, ix.indisunique AS unique, ix.indkey AS indkey, array_agg(a.attnum) as column_indexes, array_agg(a.attname) AS column_names, pg_get_indexdef(ix.indexrelid) AS definition FROM pg_class t, pg_class i, pg_index ix, pg_attribute a, pg_namespace s WHERE t.oid = ix.indrelid AND i.oid = ix.indexrelid AND a.attrelid = t.oid AND t.relkind = 'r' and t.relname = 'users' AND s.oid = t.relnamespace AND s.nspname = 'survey_temp_demo' GROUP BY i.relname, ix.indexrelid, ix.indisprimary, ix.indisunique, ix.indkey ORDER BY i.relname;
--DROP TABLE IF EXISTS "projects" CASCADE;
CREATE TABLE IF NOT EXISTS "projects" ("id"   SERIAL , "title" VARCHAR(255), "contractor" VARCHAR(255), "status" INTEGER DEFAULT 1, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "deletedAt" TIMESTAMP WITH TIME ZONE, PRIMARY KEY ("id"));
--SELECT i.relname AS name, ix.indisprimary AS primary, ix.indisunique AS unique, ix.indkey AS indkey, array_agg(a.attnum) as column_indexes, array_agg(a.attname) AS column_names, pg_get_indexdef(ix.indexrelid) AS definition FROM pg_class t, pg_class i, pg_index ix, pg_attribute a, pg_namespace s WHERE t.oid = ix.indrelid AND i.oid = ix.indexrelid AND a.attrelid = t.oid AND t.relkind = 'r' and t.relname = 'projects' AND s.oid = t.relnamespace AND s.nspname = 'survey_temp_demo' GROUP BY i.relname, ix.indexrelid, ix.indisprimary, ix.indisunique, ix.indkey ORDER BY i.relname;
--DROP TABLE IF EXISTS "powerlines" CASCADE;
`;