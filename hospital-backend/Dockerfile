# 1. Use Node.js base image
FROM node:18-alpine

# Install postgresql-client for pg_isready
RUN apk add --no-cache postgresql-client

# 2. Set working directory
WORKDIR /usr/src

# 3. Copy package files
COPY package*.json ./

# 4. Install all dependencies (not just prod)
RUN npm install

# 5. Copy the rest of the files
COPY . .

# 6. Expose port
EXPOSE 3002

# 7. Run the app in dev mode (hot reload)
CMD ["sh", "-c", "echo 'Generating Prisma client...' && npm run prisma:generate && echo 'Waiting for database...' && until pg_isready -h postgres-db -p 5432 -U postgres; do echo 'Database not ready, waiting...'; sleep 2; done && echo 'Database is ready!' && echo 'Running migrations...' && npx prisma migrate deploy && echo 'Seeding database...' && (npm run seed || echo 'Seeding failed or no seed script') && echo 'Starting application...' && npm run start:dev"]
