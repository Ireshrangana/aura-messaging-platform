FROM node:22-alpine AS base
WORKDIR /app

COPY package.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/shared/package.json ./packages/shared/package.json

RUN npm install

COPY . .

WORKDIR /app/apps/api
EXPOSE 4000

CMD ["npm", "run", "dev"]

