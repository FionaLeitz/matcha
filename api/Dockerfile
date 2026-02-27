FROM node:18-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY ./src ./src
COPY ./public ./public

RUN npm install

EXPOSE 5000

CMD ["npm", "run", "dev"]