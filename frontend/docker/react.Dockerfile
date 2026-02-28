FROM node:18-alpine AS builder

WORKDIR /app

COPY www/package*.json ./

RUN npm install

COPY www/ .

EXPOSE 3000

CMD ["npm", "start"]