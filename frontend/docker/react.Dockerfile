FROM node:20-alpine AS builder

WORKDIR /app


RUN apk add --no-cache python3 make g++


COPY www/package*.json ./


RUN npm install


COPY www/ .

EXPOSE 3000


CMD ["npm", "run", "dev"]