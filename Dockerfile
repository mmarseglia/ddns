FROM node:latest

WORKDIR /usr/src/app

COPY ./src .

EXPOSE 80

CMD ["nodejs", "app.js"]
