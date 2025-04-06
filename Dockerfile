FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production

WORKDIR /tester/

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

COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
COPY .nvmrc ./.nvmrc
RUN npm ci

COPY lib ./lib
COPY assets ./assets
COPY index.js ./index.js

RUN chmod +x ./index.js

ENTRYPOINT ["/tester/index.js"]
