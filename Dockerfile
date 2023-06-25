FROM node:slim

COPY __rebuilder.gd /__rebuilder.gd
COPY __rebuilder_scene.tscn /__rebuilder_scene.tscn

WORKDIR /github/workspace

COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
RUN npm ci --omit=dev

COPY index.js ./index.js

ENTRYPOINT [ "node", "./index.js" ]
