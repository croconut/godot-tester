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