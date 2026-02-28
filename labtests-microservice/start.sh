#!/bin/bash

# Append sslmode=require to DATABASE_URL if not already present
if [[ "$DATABASE_URL" != *"sslmode="* ]]; then
  if [[ "$DATABASE_URL" == *"?"* ]]; then
    export DATABASE_URL="${DATABASE_URL}&sslmode=require"
  else
    export DATABASE_URL="${DATABASE_URL}?sslmode=require"
  fi
fi

# Run migrations
npx prisma migrate deploy

# Start the application
node dist/main
