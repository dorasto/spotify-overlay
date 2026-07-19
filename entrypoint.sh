#!/bin/sh
set -e

DATA_DIR="/app/data"
DB_PATH="$DATA_DIR/sqlite.db"

if [ ! -d "$DATA_DIR" ]; then
  mkdir -p "$DATA_DIR"
fi

if [ -d "/app/drizzle" ] && [ "$(ls -A /app/drizzle/*.sql 2>/dev/null)" ]; then
  echo "Running database migrations..."
  npx drizzle-kit migrate
else
  echo "No migration files found. Skipping migrations."
fi

echo "Starting server..."
exec node server.js
