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
# run tests
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

# parsing test output to fill test count and pass count variables
TESTS=0
PASSED=0
FAILED=0
passingstring="Passing asserts:"
failingstring="Failing asserts:"
passedstring="Tests finished"
while read line; do
    # check for line that starts with Passed:
    if [[ $line =~ ^$passingstring ]] ; then
        # credit : https://stackoverflow.com/questions/17998978/removing-colors-from-output
        temp=$(echo $line | sed 's/\x1B\[[0-9;]\{1,\}[A-Za-z]//g')
        PASSED=${temp//[!0-9]/}
    elif [[ $line =~ ^$failingstring ]] ; then
        # credit : https://stackoverflow.com/questions/17998978/removing-colors-from-output
        temp=$(echo $line | sed 's/\x1B\[[0-9;]\{1,\}[A-Za-z]//g')
        FAILED=${temp//[!0-9]/}
    elif [[ $line == *$passedstring* ]] ; then
        # heavily depends on the number passed being the first argument
        # in the line that has 'Tests finished', 
        # the only reliable count of passed tests
        temp=$(echo $line | sed 's/ .*//')
        # credit : https://stackoverflow.com/questions/17998978/removing-colors-from-output
        temp=$(echo $temp | sed 's/\x1B\[[0-9;]\{1,\}[A-Za-z]//g')
        TESTS=`echo "$PASSED+$FAILED"|bc -l`
    fi
done <<< "$(echo "${outp}")"

# ensuring failing enough tests / being timed out cause failure for
# the action
passrate=".0"
endmsg=""
if [ "$TESTS" -eq "0" ] ; then
    exitval=1
    endmsg="Tests failed due to timeout or there were no tests to run\n"
else
    passrate=`echo "scale=3; $PASSED/$TESTS"|bc -l`
    
    if (( $(echo "$passrate >= $MINIMUM_PASSRATE" |bc -l) )); then
        exitval=0
    else
        endmsg="Tests failed due to low passrate\n"
        exitval=1
    fi
fi

# messages to help debug for end user
echo "${outp}"
echo -e "\n${passrate} pass rate\n"

if [ "$endmsg" != "" ] ; then
    echo -e "${endmsg}"
    echo -e "Note: Tests may appear to pass on SCRIPT ERROR, but they were just ignored by GUT"
    echo -e "This action ensures those will fail"
fi

exit ${exitval}