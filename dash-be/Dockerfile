FROM node as builder

WORKDIR /app

# Copy only what's needed
COPY package*.json ./
COPY dist/ ./dist/

# Install only production dependencies
RUN npm install --only=production

# Environment variables
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/src/main.js"]