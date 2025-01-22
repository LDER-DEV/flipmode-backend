# Use a base image that includes Node.js and FFmpeg
FROM tiangolo/node-ffmpeg:18

# Create and set the app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]