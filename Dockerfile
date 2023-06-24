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
RUN chmod +x /index.js
RUN npm install

COPY __rebuilder.gd /__rebuilder.gd
COPY __rebuilder_scene.tscn /__rebuilder_scene.tscn

ENTRYPOINT ["/index.js"]