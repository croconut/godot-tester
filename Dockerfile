FROM croconut/linux-downloader

COPY entrypoint.sh /entrypoint.sh
RUN printenv

ENTRYPOINT [ "bash", "/entrypoint.sh" ]