# Use a slim Node.js base image
FROM node:18-slim

# Set the working directory inside the container to /flipmode-backend
WORKDIR /flipmode-backend

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies (node modules)
RUN npm install

# Copy the FFmpeg binary from your local bin/ folder to /usr/local/bin
COPY bin/ffmpeg /usr/local/bin/ffmpeg

# Ensure FFmpeg binary is executable
RUN chmod +x /usr/local/bin/ffmpeg

# Copy the patchYTDL.js script into the container
COPY patchYTDL.js ./

# Copy the rest of the application files to the container
COPY . .

# Expose the port on which the app will run
EXPOSE 3000

# Run patchYTDL.js to apply any necessary patches before starting the app
RUN node patchYTDL.js

# Start the application using npm start
CMD ["npm", "start"]