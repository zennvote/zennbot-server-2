FROM node:16.10.0 AS builder

WORKDIR /app
COPY . .

RUN yarn
RUN yarn build


FROM node:16.4.2

WORKDIR /usr/src/app
COPY --from=builder /app ./

EXPOSE 3000

CMD yarn prisma:deploy ; yarn start:prod