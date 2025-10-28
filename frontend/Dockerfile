FROM node:20-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --silent

# Copy source
COPY . .

EXPOSE 5173

# Dev command (docker-compose override already uses "npm run dev")
CMD ["npm", "run", "dev"]