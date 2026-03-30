# dameunapatabot-web Dockerfile
FROM node:22-alpine

WORKDIR /app

# Build arguments from Coolify
ARG DATABASE_URL
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL

# Environment variables for runtime
ENV DATABASE_URL=${DATABASE_URL}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}

# Copy package files and prisma schema
COPY package*.json prisma/ ./

# Install dependencies and generate Prisma client
RUN npm install && npx prisma generate

# Copy source
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Start
CMD ["npm", "start"]
