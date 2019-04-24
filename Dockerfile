FROM node:8.9-alpine
ADD .ssh /root/.ssh
WORKDIR /app
COPY . .
RUN apk update && apk upgrade && \
    apk add --no-cache git openssh bash
RUN apk add --no-cache --virtual .gyp \
  python \
  make \
  g++
RUN cp .env.test .env
RUN yarn
# RUN yarn test
RUN yarn build


FROM node:8.9-alpine
EXPOSE 3000
WORKDIR /app
RUN apk add --no-cache --virtual .gyp \
  python \
  make \
  g++
COPY --from=0 /app/seeds ./seeds
COPY --from=0 /app/migrations ./migrations
COPY --from=0 /app/package.prod.json ./package.json
COPY --from=0 /app/yarn.lock .
COPY --from=0 /app/knexfile.ts .
COPY --from=0 /app/dist/server.js .
RUN chown 1000:1000 -R /app
RUN yarn
