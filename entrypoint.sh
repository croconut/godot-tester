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

TESTS=0
FAILED=0
RUN_OPTIONS="-s addons/gut/gut_cmdln.gd -gdir=${TEST_DIR} -ginclude_subdirs -gexit"

# credit: https://stackoverflow.com/questions/24283097/reusing-output-from-last-command-in-bash
# capture the output of a command so it can be retrieved with ret
cap() { tee /tmp/capture.out; }

# return the output of the most recent command that was captured by cap
ret() { cat /tmp/capture.out; }

check_by_test() {

    teststring="Tests:"
    # new solution, need to count number of tests that were run e.g.
    # a line that starts with "* test"
    # versus the number of tests total
    test_flagged="- test"
    script_error="SCRIPT ERROR"

    test_set=0
    wait_for_fail=0
    EXTRA_TESTS=0

    while read line; do
        # credit : https://stackoverflow.com/questions/17998978/removing-colors-from-output
        temp=$(echo $line | sed 's/\x1B\[[0-9;]\{1,\}[A-Za-z]//g')
        # can see with below line all the extra characters that echo ignores
        # echo LINE: $temp
        if [[ $temp =~ ^$script_error ]]; then
            FAILED=$((FAILED + 1))
            EXTRA_TESTS=$FAILED
            echo "script error found at $temp"
            echo failed test count increased: $FAILED
            echo
            echo
        elif [[ $temp =~ (Run)[[:space:]]+(Summary) ]]; then
            test_set=1
            echo reached test summary
            echo
            continue
        fi

        if [ "$test_set" -eq "0" ]; then
            continue
        elif [[ "$wait_for_fail" -eq "1" && $temp =~ ^[[:space:]]*(\[Failed\]) ]]; then
            wait_for_fail=0
            FAILED=$((FAILED + 1))
            echo "test error found at $temp"
            echo failed test count increased $FAILED
            echo
            echo
        elif [[ $temp =~ ^$test_flagged ]]; then
            wait_for_fail=1
            echo "possible issue with test $temp ..."
        fi

        if [[ $temp =~ ^$teststring ]]; then
            TESTS=${temp//[!0-9]/}
            TESTS=$((TESTS + EXTRA_TESTS)) # adding script error fails that were found as additional failed tests
            echo test count, including additional script error failures: $TESTS
            echo
            echo
            break
        fi

    done \
        <<<$(ret)
}

check_by_assert() {
    script_error_fns=()

    teststring="Tests:"
    script_error="SCRIPT ERROR"

    test_set=0

    while read line; do
        # credit : https://stackoverflow.com/questions/17998978/removing-colors-from-output
        temp=$(echo $line | sed 's/\x1B\[[0-9;]\{1,\}[A-Za-z]//g')
        # can see with below line all the extra characters that echo ignores
        # echo LINE: $temp
        if [[ $temp =~ ^$script_error ]]; then
            FAILED=$((FAILED + 1))
            echo "script error found at $temp"
            echo failed test count increased: $FAILED
            echo
            echo
            continue
        elif [[ $temp =~ ^$teststring ]]; then
            test_set=1
            continue
        fi

        if [ "$test_set" -eq "0" ]; then
            continue
        elif [[ $temp =~ ^[0-9]+[[:space:]]+(passed)[[:space:]]+[0-9]+[[:space:]]+(failed) ]]; then
            passes=$(echo $temp | awk '{print $1}')
            fails=$(echo $temp | awk '{print $3}')
            FAILED=$((FAILED + fails))
            TESTS=$((TESTS + FAILED + passes))
            echo "total failed asserts $FAILED"
            echo "total asserts $TESTS"
            echo
            echo
            break
        fi
    done <<<$(ret)
}

if [ "$DIRECT_SCENE" != "false" ]; then
    RUN_OPTIONS="${DIRECT_SCENE}"
fi

cd ./${PROJECT_DIRECTORY}

set +e
# run tests
RELEASE_ADD=""
MONO_ADD=""

GODOT_EXECUTABLE="godot_${GODOT_VERSION}"

if [ "$GODOT_RELEASE_TYPE" != "stable" ]; then
    GODOT_EXECUTABLE="${GODOT_EXECUTABLE}_${GODOT_RELEASE_TYPE}"
fi

if [ "$IS_MONO" = "true" ]; then
    GODOT_EXECUTABLE="${GODOT_EXECUTABLE}_mono"
fi


timeout ${IMPORT_TIME} ${GODOT_EXECUTABLE} -e
timeout ${TEST_TIME} ${GODOT_EXECUTABLE} 2>&1 | cap


# parsing test output to fill test count and pass count variables

if [ "$ASSERT_CHECK" != "false" ]; then
    check_by_assert
else
    check_by_test
fi

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
