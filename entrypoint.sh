#!/bin/bash -e
# switching to bash for pipestatus functionality

set -e

GODOT_VERSION=$1
PROJECT_DIRECTORY=$2
IS_MONO=$3
IMPORT_TIME=$4
TEST_TIME=$5
MINIMUM_PASSRATE=$6
GODOT_SERVER_TYPE="headless"
CUSTOM_DL_PATH="~/custom_dl_folder"

# if download places changes, will need updates to this if/else
if [ IS_MONO = "true" ] ; then 
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

mkdir -p ${CUSTOM_DL_PATH}

# in case this was somehow there already, but broken
rm -rf ${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION}
rm -f ${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION}.zip
# setup godot environment
echo "downloading godot ..."
yes | wget -q https://downloads.tuxfamily.org/godotengine/${DL_PATH_EXTENSION}${FULL_GODOT_NAME}${GODOT_EXTENSION}.zip -P ${CUSTOM_DL_PATH}
mkdir -p ~/.cache
mkdir -p ~/.config/godot
echo "unzipping ..."
yes | unzip -q ${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION}.zip -d ${CUSTOM_DL_PATH}


set +e
# run tests & cleanup
if [ IS_MONO = "true" ] ; then
# need to init the imports
    timeout ${IMPORT_TIME} ${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION}/${FULL_GODOT_NAME}.64 -e
    outp=$(timeout ${TEST_TIME} ${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION}/${FULL_GODOT_NAME}.64 -s addons/gut/gut_cmdln.gd -gdir=res://test -ginclude_subdirs -gexit)
else
    timeout ${IMPORT_TIME} ${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION} -e
    outp=$(timeout ${TEST_TIME} ${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION} -s addons/gut/gut_cmdln.gd -gdir=res://test -ginclude_subdirs -gexit)
fi

rm -rf ${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION}
rm -f ${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION}.zip
TESTS=0
PASSED=0
teststring="Tests:"
passedstring="Tests finished"
while read line; do
    # check for line that starts with Passed:
    if [[ $line =~ ^$teststring ]] ; then
        TESTS=${line//[!0-9]/}
    elif [[ $line == *$passedstring* ]] ; then
        # heavily depends on the number passed being the first argument
        # in the line that has 'Tests finished', 
        # the only reliable count of passed tests
        temp=$(echo $line | sed 's/ .*//')
        # btw there is no 32 prefix until this command
        # dont ask me what's happening here :d
        # anyways this is 100% required since bash wont recognize temp
        # as a variable
        PASSED=${temp//[!0-9]/}
        if [[ ${#temp} -ne ${#PASSED} ]] ; then
            # the format is very questionable, need to remove a 32 from the front????
            # double checking with the if statement that the thing bugged out
            PASSED=${PASSED#"32"}
        fi
    fi
done <<< "$(echo "${outp}")"

passrate=".0"
endmsg=""
if [ "$TESTS" -eq "0" ] ; then
    exitval="1"
    endmsg="Tests failed likely due to timeout\n"
else
    passrate=`echo "scale=3; $PASSED/$TESTS"|bc -l`
    
    if (( $(echo "$passrate >= $MINIMUM_PASSRATE" |bc -l) )); then
        exitval=0
    else
        endmsg="Tests failed likely due to low passrate\n"
        exitval=1
    fi
fi

echo "${outp}"
echo -e "\n${passrate} pass rate\n"

if [ "$endmsg" != "" ] ; then
    echo -e "${endmsg}"
    echo -e "Note: Tests may appear to pass on SCRIPT ERROR, but they were just ignored by GUT"
    echo -e "This action ensures those will fail"
fi

exit ${exitval}