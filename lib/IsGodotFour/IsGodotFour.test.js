const yargs = require('yargs');
const isGodotFour = require('./IsGodotFour');

describe('isGodotFour', () => {
    describe('when the version is 4.0.3', () => {
        beforeEach(() => {
            yargs.argv.godotVersion = '4.0.0';
        });

        it('should return true', () => {
            expect(isGodotFour()).toBe(true);
        });
    });

    describe('when the version is 3.2.1', () => {
        beforeEach(() => {
            yargs.argv.godotVersion = '3.2.1';
        });

        it('should return false', () => {
            expect(isGodotFour()).toBe(false);
        });
    });

    describe('when the version is v4.0.3', () => {
        beforeEach(() => {
            yargs.argv.godotVersion = 'v4.0.0';
        });

        it('should return true', () => {
            expect(isGodotFour()).toBe(true);
        });
    });

    describe('when the version is v3.2.1', () => {
        beforeEach(() => {
            yargs.argv.godotVersion = 'v3.2.1';
        });

        it('should return false', () => {
            expect(isGodotFour()).toBe(false);
        });
    });
});