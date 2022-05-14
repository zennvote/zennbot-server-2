FROM node:16.10.0-alpine3.11 AS builder

WORKDIR /app
COPY . .

RUN yarn
RUN yarn build


FROM node:16.4.2-alpine3.11

ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python

WORKDIR /usr/src/app
COPY --from=builder /app ./

EXPOSE 3000
CMD yarn start:prod