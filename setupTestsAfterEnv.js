const matchers = require('jest-extended');
const path = require('path');
expect.extend(matchers);

beforeEach(() => {
    jest.resetModules();
});

// enable path testing on windows + unix
expect.extend({
    toMatchPath(actual, expected) {
        let nactual = actual.replace(/\//g, "\\");
        return {
            pass: path.join(...expected.split("\\")) === nactual,
            message: () => `path match failure:\n\x1b[32m${expected}\x1b[0m\n\x1b[31m${actual}\x1b[0m`
        }
    }
})
