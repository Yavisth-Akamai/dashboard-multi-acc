FROM node as builder

WORKDIR /app

COPY package*.json ./
COPY dist/ ./dist/

RUN npm install --only=production

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/src/main.js"]