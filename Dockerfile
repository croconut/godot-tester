FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production

# prepare apt with node 16.x
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    lsb-release \
    dotnet-sdk-6.0 \
    wget \
    unzip \
    fontconfig \
    bc

RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get update && apt-get install -y nodejs

COPY lib /lib
COPY package.json /package.json
COPY package-lock.json /package-lock.json
COPY index.js /index.js
COPY .nvmrc /.nvmrc
COPY assets /assets

RUN chmod +x /index.js
RUN npm ci

ENTRYPOINT ["/index.js"]