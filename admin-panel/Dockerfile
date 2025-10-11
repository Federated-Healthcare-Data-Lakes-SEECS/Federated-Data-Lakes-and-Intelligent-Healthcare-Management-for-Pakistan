# 1. Use official Node.js base image
FROM node:18-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy only package files for better layer caching
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy everything else
COPY . .

# 6. Expose the Next.js port
EXPOSE 3001

# 7. Start Next.js in dev mode
CMD ["npm", "run", "dev"]
