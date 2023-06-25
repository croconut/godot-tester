FROM croconut/linux-downloader
RUN wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb \
 && dpkg -i packages-microsoft-prod.deb \
 && packages-microsoft-prod.deb

RUN apt-get update && apt-get install -y dotnet-sdk-6.0

COPY test_runner_lib /test_runner_lib
COPY entrypoint.sh /entrypoint.sh
COPY __rebuilder.gd /__rebuilder.gd
COPY __rebuilder_scene.tscn /__rebuilder_scene.tscn

ENTRYPOINT [ "bash", "/entrypoint.sh" ]