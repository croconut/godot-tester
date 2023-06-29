FROM node:16
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    dotnet-sdk-6.0 \
    wget \
    unzip \
    fontconfig \
    bc

COPY lib /lib
COPY package.json /package.json
COPY package-lock.json /package-lock.json
COPY index.js /index.js
COPY .nvmrc /.nvmrc
COPY assets /assets

RUN chmod +x /index.js
RUN npm install

ENTRYPOINT ["/index.js"]