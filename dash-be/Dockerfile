FROM --platform=linux/amd64 node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .


RUN npm run build

CMD ["node", "dist/src/main"]
