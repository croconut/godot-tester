FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production

# prepare apt for node 20.x
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    lsb-release \
    dotnet-sdk-6.0 \
    wget \
    unzip \
    fontconfig \
    bc \
    ca-certificates

# Install NodeJS
# https://stackoverflow.com/a/77021599
RUN set -uex; \
    mkdir -p /etc/apt/keyrings; \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
     | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg; \
    NODE_MAJOR=20; \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" \
     > /etc/apt/sources.list.d/nodesource.list; \
    apt-get update; \
    apt-get install nodejs -y;

COPY lib /lib
COPY package.json /package.json
COPY package-lock.json /package-lock.json
COPY index.js /index.js
COPY .nvmrc /.nvmrc
COPY assets /assets

RUN chmod +x /index.js
RUN npm ci

ENTRYPOINT ["/index.js"]
