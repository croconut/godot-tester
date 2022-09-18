#!/bin/bash -e
# switching to bash for pipestatus functionality

set -e

GODOT_VERSION=$1
RELEASE_TYPE=$2
PROJECT_DIRECTORY=$3
IS_MONO=$4
IMPORT_TIME=$5
TEST_TIME=$6
MINIMUM_PASSRATE=$7
TEST_DIR=$8
DIRECT_SCENE=$9
# args above 9 require brackets
ASSERT_CHECK=${10}
MAX_FAILS=${11}
IGNORE_ERROR=${12}
CONFIG_FILE=${13}
RESULT_OUTPUT_FILE=${14}

GODOT_SERVER_TYPE="headless"
TESTS=0
FAILED=0
CUSTOM_DL_PATH="~/custom_dl_folder"

RUN_OPTIONS="-s addons/gut/gut_cmdln.gd"
RUN_OPTIONS="${RUN_OPTIONS} -gdir=${TEST_DIR}"
RUN_OPTIONS="${RUN_OPTIONS} -ginclude_subdirs"
RUN_OPTIONS="${RUN_OPTIONS} -gjunit_xml_file=./${RESULT_OUTPUT_FILE}"
RUN_OPTIONS="${RUN_OPTIONS} -gexit"

# credit: https://stackoverflow.com/questions/24283097/reusing-output-from-last-command-in-bash
# capture the output of a command so it can be retrieved with ret
cap() { tee /tmp/capture.out; }

# return the output of the most recent command that was captured by cap
ret() { cat /tmp/capture.out; }

# Parse XML with bash-only: 
# https://stackoverflow.com/questions/893585/how-to-parse-xml-in-bash/2608159#2608159
rdom () { local IFS=\> ; read -d \< E C ;}

check_by_test() {
    FAILURE_REGEX="failures=\"([0-9]+)\""
    TESTS_REGEX="tests=\"([0-9]+)\""

    while rdom; do
        if [[ $E =~ ^testsuites ]]; then
            if [[ $E =~ $FAILURE_REGEX ]]
            then
                FAILED="${BASH_REMATCH[1]}"
            fi

            if [[ $E =~ $TESTS_REGEX ]]
            then
                TESTS="${BASH_REMATCH[1]}"
            fi

            break
        fi
    done < ./${RESULT_OUTPUT_FILE}

    echo "XML: Tests Detected: ${TESTS}"
    echo "XML: Failed Tests: ${FAILED}"
}

check_by_assert() {
    while rdom; do
        ASSERT_REGEX="assertions=\"([0-9]+)\""

        if [[ $E =~ $ASSERT_REGEX ]]
        then
            ((TESTS+=${BASH_REMATCH[1]}))
        fi

        if [[ $E =~ ^failure ]]
        then
            ((FAILED+=1))
        fi
    done < ./${RESULT_OUTPUT_FILE}

    echo "XML: Asserts Detected: ${TESTS}"
    echo "XML: Failed Asserts: ${FAILED}"
}

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

# these are mutually exclusive - direct scenes cannot take a config file but they can
# have all those options set on the scene itself anyways
if [ "$DIRECT_SCENE" != "false" ]; then
    RUN_OPTIONS="${DIRECT_SCENE}"
elif [ "$CONFIG_FILE" != "res://.gutconfig.json" ]; then
    RUN_OPTIONS="${RUN_OPTIONS} -gconfig=${CONFIG_FILE}"
fi

cd ./${PROJECT_DIRECTORY}

mkdir -p ${CUSTOM_DL_PATH}
mkdir -p ./addons/gut/.cli_add
mv -n /__rebuilder.gd ./addons/gut/.cli_add
mv -n /__rebuilder_scene.tscn ./addons/gut/.cli_add

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
if [ "$IS_MONO" = "true" ]; then
    # need to init the imports
    # workaround for -e -q and -e with timeout failing
    # credit: https://github.com/Kersoph/open-sequential-logic-simulation/pull/4/files
    timeout ${IMPORT_TIME} ./${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION}/${FULL_GODOT_NAME}.64 --editor addons/gut/.cli_add/__rebuilder_scene.tscn
    timeout ${TEST_TIME} ./${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION}/${FULL_GODOT_NAME}.64 ${RUN_OPTIONS} 2>&1 | cap
else
    timeout ${IMPORT_TIME} ./${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION} --editor addons/gut/.cli_add/__rebuilder_scene.tscn
    timeout ${TEST_TIME} ./${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION} ${RUN_OPTIONS} 2>&1 | cap
fi

# removing scene used to rebuild import files
rm -rf ./addons/gut/.cli_add/__rebuilder.gd
rm -rf ./addons/gut/.cli_add/__rebuilder_scene.tscn

rm -rf ${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION}
rm -f ${CUSTOM_DL_PATH}/${FULL_GODOT_NAME}${GODOT_EXTENSION}.zip

# parsing test output to fill test count and pass count variables

if [ "$ASSERT_CHECK" != "false" ]; then
    check_by_assert
else
    check_by_test
fi

rm -f ./${RESULT_OUTPUT_FILE}

passrate=".0"
endmsg=""
if [ "$TESTS" -eq "0" ]; then
    exitval=1
    endmsg="Tests failed due to timeout or there were no tests to run\n"
else
    passrate=$(echo "scale=3; ($TESTS-$FAILED)/$TESTS" | bc -l)
    echo -e "\n${passrate} pass rate\n"
    if (($(echo "$passrate >= $MINIMUM_PASSRATE" | bc -l))); then
        exitval=0
    else
        endmsg="Tests failed due to low passrate\n"
        exitval=1
    fi

    if [[ "$MAX_FAILS" != "false" ]]; then
        if [[ "$FAILED" -gt "$MAX_FAILS" ]]; then
            endmsg="Tests failed due to fail count of ${FAILED} exceeding maximum of ${MAX_FAILS}"
            exitval=1
        fi
    fi
fi

if [ "$endmsg" != "" ]; then
    echo -e "Note: Tests may appear to pass on SCRIPT ERROR, but they were just ignored by GUT"
    echo -e "This action ensures those will fail"
    echo
    echo -e "${endmsg}"
fi

exit ${exitval}
