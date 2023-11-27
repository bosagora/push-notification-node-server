FROM node:14

WORKDIR /push-notification-app
COPY package.json .
RUN npm install
COPY . .
CMD npm start