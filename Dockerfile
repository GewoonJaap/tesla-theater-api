FROM node:20-bullseye-slim

# Install necessary tools: ffmpeg for video converter, python3 for yt-dlp
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package metadata
COPY package.json yarn.lock ./

# Install dependencies (ignoring scripts & using exact versions where possible)
RUN yarn install --frozen-lockfile

# Copy the rest
COPY . .

# Build TS
RUN yarn build

EXPOSE 3000

# Start command
CMD ["yarn", "start"]