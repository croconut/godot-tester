FROM croconut/linux-downloader

COPY downloader.sh /downloader.sh
RUN chmod u+x /downloader.sh
COPY entrypoint.sh /entrypoint.sh

RUN printenv

ENV GODOT_VERSION=${GODOT_VERSION:-3.2.2}
ENV RELEASE_TYPE=${RELEASE_TYPE:-stable}
ENV IS_MONO false=${IS_MONO:-false}
ENV GODOT_SERVER_TYPE=${GODOT_SERVER_TYPE:-headless}

RUN /downloader.sh ${GODOT_VERSION} ${RELEASE_TYPE} ${IS_MONO} ${GODOT_SERVER_TYPE}

ENTRYPOINT [ "bash", "/entrypoint.sh" ]