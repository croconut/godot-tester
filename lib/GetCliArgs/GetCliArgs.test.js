const yargs = require('yargs');
const getCliArgs = require('./GetCliArgs');

describe('getCliArgs', () => {
    it('returns whatever yargs returns', () => {
        yargs.argv = {
            foo: 'bar'
        };

        expect(getCliArgs()).toEqual({
            foo: 'bar'
        });
    });

    it('returns whatever yargs returns', () => {
        yargs.argv = {
            foo: 'baz'
        };

        expect(getCliArgs()).toEqual({
            foo: 'baz'
        });
    });
});