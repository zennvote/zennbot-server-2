FROM node:20.11.0-alpine AS build

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
COPY prisma ./prisma/

RUN yarn install
RUN yarn prisma:generate

COPY . .

RUN yarn build

ENV NODE_ENV=production

RUN yarn install --production

FROM node:20.11.0-alpine AS production

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV TZ=Asia/Seoul

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/prisma ./prisma
COPY --from=build /usr/src/app/package.json ./package.json

EXPOSE 3000

CMD yarn prisma:deploy ; yarn start:prod
