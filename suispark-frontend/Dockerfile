FROM node:23-alpine

WORKDIR /src

COPY package.json yarn.lock ./

RUN yarn install

RUN yarn global add serve

COPY . .

RUN yarn build

CMD [ "serve", "-s", "dist" ]
