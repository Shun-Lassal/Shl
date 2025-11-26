FROM node:24
WORKDIR /app

# Install dependencies (Prisma needs schema available at install time)
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma

# Provide a default DATABASE_URL so prisma generate can run during install
ARG DATABASE_URL=postgresql://dev:dev@db:5432/shl?schema=public
ENV DATABASE_URL=${DATABASE_URL}

RUN npm ci --silent

# Copy application source
COPY src ./src

EXPOSE 3000

# Dev command (docker-compose already runs "npm run dev")
CMD ["npm", "run", "dev"]
