FROM node:16.10.0 AS builder

WORKDIR /app

COPY prisma ./prisma/
COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . .

RUN yarn build


FROM node:16.4.2

WORKDIR /usr/src/app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD yarn prisma:deploy yarn start:prod