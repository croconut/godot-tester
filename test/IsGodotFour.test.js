describe('isGodotFour', () => {
    describe('when the version is 4.0.3', () => {
        it('should return true', () => {
            process.env['INPUT_VERSION'] = '4.0.3';
            const isGodotFour = require('./IsGodotFour');

            expect(isGodotFour()).toBe(true);
        });
    });

    describe('when the version is 3.2.1', () => {
        it('should return false', () => {
            process.env['INPUT_VERSION'] = '3.2.1';
            const isGodotFour = require('./IsGodotFour');

            expect(isGodotFour()).toBe(false);
        });
    });

    describe('when the version is v4.3.1', () => {
        it('should return true', () => {
            process.env['INPUT_VERSION'] = 'v4.3.1';
            const isGodotFour = require('./IsGodotFour');

            expect(isGodotFour()).toBe(true);
        });
    });

    describe('when the version is v2.2.1', () => {
        it('should return false', () => {
            process.env['INPUT_VERSION'] = 'v2.2.1';
            const isGodotFour = require('./IsGodotFour');

            expect(isGodotFour()).toBe(false);
        });
    });
});