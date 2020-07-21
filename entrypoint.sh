#!/bin/sh -l

# enable when this is working
set -e

GODOT_VERSION=$1
PROJECT_DIRECTORY=$2
GODOT_SERVER_TYPE="headless"
CUSTOM_DL_PATH="~/custom_dl_folder"

if [ $3 = "true" ] ; then 
    GODOT_RELEASE_TYPE="stable_mono"
    DL_PATH_EXTENSION=${GODOT_VERSION}/mono/
    GODOT_EXTENSION="_64"
    # this is a folder for mono versions
    FULL_GODOT_NAME=Godot_v${GODOT_VERSION}-${GODOT_RELEASE_TYPE}_linux_${GODOT_SERVER_TYPE}
else
    GODOT_RELEASE_TYPE="stable"
    DL_PATH_EXTENSION=${GODOT_VERSION}/
    GODOT_EXTENSION=".64"
    FULL_GODOT_NAME=Godot_v${GODOT_VERSION}-${GODOT_RELEASE_TYPE}_linux_${GODOT_SERVER_TYPE}
fi

cd ./${PROJECT_DIRECTORY}

# setup linux environment
apt-get update && apt-get install -y --no-install-recommends ca-certificates git wget unzip zip curl python python-openssl

rm -rf /var/lib/apt/lists/*

mkdir -p ${CUSTOM_DL_PATH}

# setup godot environment
wget https://downloads.tuxfamily.org/godotengine/${DL_PATH_EXTENSION}${FULL_GODOT_NAME}${GODOT_EXTENSION}.zip -P ${CUSTOM_DL_PATH}
mkdir -p ~/.cache
mkdir -p ~/.config/godot
unzip ${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION}.zip -d ${CUSTOM_DL_PATH}
rm -f ${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION}.zip

# run tests & cleanup
if [ $3 = "true" ] ; then
    ${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION}/${FULL_GODOT_NAME}.64 -d -s addons/gut/gut_cmdln.gd -gdir=res://test -ginclude_subdirs -gexit
    rm -rf ${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION}
else 
    ${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION} -d -s addons/gut/gut_cmdln.gd -gdir=res://test -ginclude_subdirs -gexit
    rm -f ${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION}
fi