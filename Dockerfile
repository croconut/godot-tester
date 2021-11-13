FROM croconut/linux-downloader

COPY entrypoint.sh /entrypoint.sh
RUN echo $GODOT_VERSION

ENTRYPOINT [ "bash", "/entrypoint.sh" ]