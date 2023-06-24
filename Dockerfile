FROM croconut/linux-downloader
RUN apt install dotnet-sdk-6.0

COPY test_runner_lib /test_runner_lib
COPY entrypoint.sh /entrypoint.sh
COPY __rebuilder.gd /__rebuilder.gd
COPY __rebuilder_scene.tscn /__rebuilder_scene.tscn

ENTRYPOINT [ "bash", "/entrypoint.sh" ]