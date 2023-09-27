FROM docker.io/node:20-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production

COPY lib /lib
COPY package.json /package.json
COPY package-lock.json /package-lock.json
COPY index.js /index.js
COPY .nvmrc /.nvmrc
COPY assets /assets

RUN chmod +x /index.js
RUN npm ci

ENTRYPOINT ["/index.js"]
