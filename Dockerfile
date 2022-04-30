FROM croconut/linux-downloader

ARG DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production

RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - 
RUN apt-get update && apt-get install -y gcc g++ make && apt-get install -y nodejs
RUN ln -s `which nodejs` /usr/bin/node

COPY project.json /project.json
COPY project-lock.json /project-lock.json

COPY index.js /index.js
COPY __rebuilder.gd /__rebuilder.gd
COPY __rebuilder_scene.tscn /__rebuilder_scene.tscn

ENTRYPOINT [ "node", "/index.js" ]
