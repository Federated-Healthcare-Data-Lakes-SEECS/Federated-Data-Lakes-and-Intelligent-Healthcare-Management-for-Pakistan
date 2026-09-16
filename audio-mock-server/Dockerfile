# 1. Use Node.js base image
FROM node:18-alpine

# 2. Set working directory
WORKDIR /usr/src

# 3. Copy package files
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the files
COPY . .

# 6. Expose port (hardcoded in index.js)
EXPOSE 3003

# 7. Start the mock server
CMD ["npm", "start"]
