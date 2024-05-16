FROM node:20.11.0 AS builder

WORKDIR /app

ENV TZ=Asia/Seoul
ENV NODE_ENV=production

COPY prisma ./prisma/
COPY package.json ./
COPY yarn.lock ./

RUN yarn
RUN yarn prisma:generate

COPY . .

RUN yarn build


FROM node:20.11.0

ENV TZ=Asia/Seoul

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /usr/src/app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./

EXPOSE 3000

CMD yarn prisma:deploy ; yarn start:prod
