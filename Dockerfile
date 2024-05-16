FROM node:20.11.0

ENV NODE_ENV=production
ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /usr/src/app

COPY prisma ./prisma/
COPY package.json yarn.lock ./

RUN yarn install --production
RUN yarn prisma:generate

COPY . .

RUN yarn build

EXPOSE 3000

CMD yarn prisma:deploy ; yarn start:prod
