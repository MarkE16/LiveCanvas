# Use Node image
FROM node:20-alpine AS base

# Set environment variables
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV HUSKY=0

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.10.0 --activate

# Change working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml to be able
# to install dependencies
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --ignore-scripts

# Copy essential app contents
COPY . ./

# Install bash to be able to run our script
FROM base AS build
RUN apk add --no-cache bash

# Copy docker entrypoint script to user binaries
# to be executed
COPY docker-entrypoint.sh /usr/local/bin/

# Allow the script to be executable
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Use dos2unix to clear the Windows CRLF
# that can screw up with how Linux can run the script
RUN dos2unix /usr/local/bin/docker-entrypoint.sh

# Expose port to access the app
EXPOSE 3000

# Allow Docker to run our script when starting the container
ENTRYPOINT ["docker-entrypoint.sh"]
