# Use Node.js base image
FROM node:18

# Use a Node.js base image with FFmpeg pre-installed
FROM jrottenberg/ffmpeg:4.4-node18-slim as base

# Create and set the app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port
EXPOSE 9900

# Start the application
CMD ["npm", "start"]
