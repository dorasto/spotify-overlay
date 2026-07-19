#!/bin/sh
set -e

DATA_DIR="/app/data"
DB_PATH="$DATA_DIR/sqlite.db"

if [ ! -d "$DATA_DIR" ]; then
  mkdir -p "$DATA_DIR"
fi

if [ -d "/app/drizzle" ] && [ "$(ls -A /app/drizzle/*.sql 2>/dev/null)" ]; then
  echo "Running database migrations..."
  node -e "
    const Database = require('better-sqlite3');
    const { migrate } = require('drizzle-orm/better-sqlite3/migrator');
    const { drizzle } = require('drizzle-orm/better-sqlite3');
    const sqlite = new Database('$DB_PATH');
    const db = drizzle(sqlite);
    migrate(db, { migrationsFolder: '/app/drizzle' });
    console.log('Migrations complete.');
  "
else
  echo "No migration files found. Skipping migrations."
fi

echo "Starting server..."
exec node server.js
