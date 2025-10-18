# Use Node LTS
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json & package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the files
COPY . .

# Expose the port (make sure it matches your .env PORT)
EXPOSE 3026

# Start the app
CMD ["node", "src/server.js"]