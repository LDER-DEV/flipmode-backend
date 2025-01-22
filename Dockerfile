FROM node:18-slim

# Set the working directory to /flipmode-backend
WORKDIR /flipmode-backend

# Copy the FFmpeg binary from your local project (assuming it's inside the bin/ folder)
COPY bin/ffmpeg /usr/local/bin/ffmpeg

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code (including the bin folder)
COPY . .

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]