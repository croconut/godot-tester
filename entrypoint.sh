#!/bin/bash -e
# switching to bash for pipestatus functionality

set -e

# credit: https://stackoverflow.com/questions/24283097/reusing-output-from-last-command-in-bash
# capture the output of a command so it can be retrieved with ret
cap () { tee /tmp/capture.out; }

# return the output of the most recent command that was captured by cap
ret () { cat /tmp/capture.out; }

GODOT_VERSION=$1
RELEASE_TYPE=$2
PROJECT_DIRECTORY=$3
IS_MONO=$4
IMPORT_TIME=$5
TEST_TIME=$6
MINIMUM_PASSRATE=$7
TEST_DIR=$8
DIRECT_SCENE=$9

GODOT_SERVER_TYPE="headless"
CUSTOM_DL_PATH="~/custom_dl_folder"
RUN_OPTIONS="-s addons/gut/gut_cmdln.gd -gdir=${TEST_DIR} -ginclude_subdirs -gexit"

if [ "$RELEASE_TYPE" = "stable" ] ; then
    DL_PATH_SUFFIX=""
else
    DL_PATH_SUFFIX="/${RELEASE_TYPE}"
fi

# if download places changes, will need updates to this if/else
if [ "$IS_MONO" = "true" ] ; then
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

if [ "$DIRECT_SCENE" != "false" ] ; then
    RUN_OPTIONS=`${DIRECT_SCENE}`
fi

cd ./${PROJECT_DIRECTORY}

mkdir -p ${CUSTOM_DL_PATH}

# in case this was somehow there already, but broken
rm -rf ${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION}
rm -f ${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION}.zip
# setup godot environment
DL_URL="https://downloads.tuxfamily.org/godotengine/${DL_PATH_EXTENSION}${FULL_GODOT_NAME}${GODOT_EXTENSION}.zip"
echo "downloading godot from ${DL_URL} ..."
yes | wget -q ${DL_URL} -P ${CUSTOM_DL_PATH}
mkdir -p ~/.cache
mkdir -p ~/.config/godot
echo "unzipping ..."
yes | unzip -q ${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION}.zip -d ${CUSTOM_DL_PATH}
chmod -R 777 ${CUSTOM_DL_PATH}

echo "running test suites ..."

set +e
# run tests
if [ "$IS_MONO" = "true" ] ; then
# need to init the imports
    timeout ${IMPORT_TIME} ./${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION}/${FULL_GODOT_NAME}.64 -e
    timeout ${TEST_TIME} ./${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION}/${FULL_GODOT_NAME}.64 ${RUN_OPTIONS} | cap
else
    timeout ${IMPORT_TIME} ./${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION} -e
    timeout ${TEST_TIME} ./${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION} ${RUN_OPTIONS} | cap
fi

rm -rf ${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION}
rm -f ${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION}.zip

# parsing test output to fill test count and pass count variables
TESTS=0
FAILED=0

script_error_fns=()

teststring="Tests:"
# new solution, need to count number of tests that were run e.g.
# a line that starts with "* test"
# versus the number of tests total
test_failed_string="- test"
script_error="SCRIPT ERROR"

while read line; do
    # credit : https://stackoverflow.com/questions/17998978/removing-colors-from-output
    temp=$(echo $line | sed 's/\x1B\[[0-9;]\{1,\}[A-Za-z]//g')
    # can see with below line all the extra characters that echo ignores
    # echo LINE: $temp
    if [[ $temp =~ ^$script_error ]] ; then
        FAILED=$((FAILED+1))
        t_script_err_str=$(echo $temp | awk '{print $3}')
        t_script_err_str=${t_script_err_str%?}
        script_error_fns+=( $t_script_err_str )
    elif [[ $temp =~ ^$teststring ]] ; then
        TESTS=${temp//[!0-9]/}
    elif [[ $temp =~ ^$test_failed_string ]] ; then
        FAILED=$((FAILED+1))
        match_fn_name=$(echo $temp | awk '{print $2}')
        for i in "${script_error_fns[@]}" ; do
            if [ "$i" == "$match_fn_name" ] ; then
                FAILED=$((FAILED-1))
                break
            fi
        done
    fi
done <<< `ret`

# ensuring failing enough tests / being timed out cause failure for
# the action
echo "${outp0}"
echo "${outp}"

passrate=".0"
endmsg=""
if [ "$TESTS" -eq "0" ] ; then
    exitval=1
    endmsg="Tests failed due to timeout or there were no tests to run\n"
else
    passrate=`echo "scale=3; ($TESTS-$FAILED)/$TESTS"|bc -l`
    echo -e "\n${passrate} pass rate\n"
    if (( $(echo "$passrate >= $MINIMUM_PASSRATE" |bc -l) )); then
        exitval=0
    else
        endmsg="Tests failed due to low passrate\n"
        exitval=1
    fi
fi

if [ "$endmsg" != "" ] ; then
    echo -e "${endmsg}"
    echo -e "Note: Tests may appear to pass on SCRIPT ERROR, but they were just ignored by GUT"
    echo -e "This action ensures those will fail"
fi

exit ${exitval}
