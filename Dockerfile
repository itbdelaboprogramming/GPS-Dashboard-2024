FROM node:14-alpine

WORKDIR /app

COPY package*.json ./

RUN npm i

RUN npm rebuild

EXPOSE 4200

CMD npx ng serve --host 0.0.0.0
