#!/bin/bash -e

GODOT_VERSION=$1
RELEASE_TYPE=$2
IS_MONO=$3
GODOT_SERVER_TYPE=$4


if [ "$RELEASE_TYPE" = "stable" ]; then
    DL_PATH_SUFFIX=""
else
    DL_PATH_SUFFIX="/${RELEASE_TYPE}"
fi

# if download places changes, will need updates to this if/else
if [ "$IS_MONO" = "true" ]; then
    GODOT_RELEASE_TYPE="${RELEASE_TYPE}_mono"
    DL_PATH_EXTENSION="${GODOT_VERSION}${DL_PATH_SUFFIX}/mono/"
    GODOT_EXTENSION="_64"
    # this is a folder for mono versions
    FULL_GODOT_NAME=Godot_v${GODOT_VERSION}-${GODOT_RELEASE_TYPE}_linux_${GODOT_SERVER_TYPE}
else
    GODOT_RELEASE_TYPE="${RELEASE_TYPE}"
    DL_PATH_EXTENSION="${GODOT_VERSION}${DL_PATH_SUFFIX}/"
    GODOT_EXTENSION=".64"
    FULL_GODOT_NAME=Godot_v${GODOT_VERSION}-${GODOT_RELEASE_TYPE}_linux_${GODOT_SERVER_TYPE}
fi

cd /tmp

# setup godot environment
DL_URL="https://downloads.tuxfamily.org/godotengine/${DL_PATH_EXTENSION}${FULL_GODOT_NAME}${GODOT_EXTENSION}.zip"
echo "downloading godot from ${DL_URL} ..."
yes | wget -q ${DL_URL}
mkdir -p ~/.cache
mkdir -p ~/.config/godot
echo "unzipping ..."
yes | unzip -q ${FULL_GODOT_NAME}${GODOT_EXTENSION}.zip -d ./

if [ "$IS_MONO" = "true" ]; then
    godot_file="${FULL_GODOT_NAME}${GODOT_EXTENSION}/${FULL_GODOT_NAME}.64"
else
    godot_file="${FULL_GODOT_NAME}${GODOT_EXTENSION}"
fi

mv $godot_file /usr/local/bin/godot
chmod u+x /usr/local/bin/godot

rm -rf /tmp/*
