#!/bin/sh -l

GODOT_VERSION=$1
PROJECT_DIRECTORY=$2
GODOT_RELEASE_TYPE=$3
GODOT_SERVER_TYPE="headless"
CUSTOM_DL_PATH="~/customdls/"

FULL_GODOT_NAME=Godot_v${GODOT_VERSION}-${GODOT_RELEASE_TYPE}_linux_${GODOT_SERVER_TYPE}.64

cd /${PROJECT_DIRECTORY}

# setup linux environment
apt-get update && apt-get install -y --no-install-recommends ca-certificates git wget unzip zip curl python python-openssl

rm -rf /var/lib/apt/lists/*

mkdir -p ${CUSTOM_DL_PATH}

# setup godot environment
wget https://downloads.tuxfamily.org/godotengine/${GODOT_VERSION}/${FULL_GODOT_NAME}.zip -P ${CUSTOM_DL_PATH}
mkdir -p ~/.cache
mkdir -p ~/.config/godot
unzip ${CUSTOM_DL_PATH}${FULL_GODOT_NAME}.zip
rm -f ${CUSTOM_DL_PATH}${FULL_GODOT_NAME}.zip

# run tests
${CUSTOM_DL_PATH}${FULL_GODOT_NAME} -d -s addons/gut/gut_cmdln.gd -gdir=res://test -ginclude_subdirs -gexit