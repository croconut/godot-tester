const yargs = require('yargs');
const generateGodotFilename = require('./GenerateGodotFilename');

describe('generateGodotFilename', () => {
    describe('given godotVersion is >3', () => {
        describe('given isMono is true', () => {
            it('should return the headless filename', () => {
                yargs.argv = {
                    godotVersion: '3.2.3',
                    releaseType: 'stable',
                    isMono: true
                };
                const result = generateGodotFilename();
                expect(result).toEqual({
                    fullGodotName: 'Godot_v3.2.3-stable_mono_linux_headless',
                    fullGodotNameWithArch: 'Godot_v3.2.3-stable_mono_linux_headless_64'
                });
            });
        });

        describe('given isMono is false', () => {
            it('should return the headless filename', () => {
                yargs.argv = {
                    godotVersion: '3.2.3',
                    releaseType: 'stable',
                    isMono: false
                };
                const result = generateGodotFilename();
                expect(result).toEqual({
                    fullGodotName: 'Godot_v3.2.3-stable_linux_headless',
                    fullGodotNameWithArch: 'Godot_v3.2.3-stable_linux_headless.64'
                });
            });
        });

        describe('given releaseType is not stable', () => {
            it('should return the headless filename', () => {
                yargs.argv = {
                    godotVersion: '3.2.3',
                    releaseType: 'beta',
                    isMono: false
                };
                const result = generateGodotFilename();
                expect(result).toEqual({
                    fullGodotName: 'Godot_v3.2.3-beta_linux_headless',
                    fullGodotNameWithArch: 'Godot_v3.2.3-beta_linux_headless.64'
                });
            });
        });
    });

    describe('given godotVersion is 4', () => {
        describe('given isMono is true', () => {
            it('should return the filename without headless', () => {
                yargs.argv = {
                    godotVersion: '4.0.3',
                    releaseType: 'stable',
                    isMono: true
                };
                const result = generateGodotFilename();
                expect(result).toEqual({
                    fullGodotName: 'Godot_v4.0.3-stable_mono_linux',
                    fullGodotNameWithArch: 'Godot_v4.0.3-stable_mono_linux_x86_64'
                });
            });
        });

        describe('given isMono is false', () => {
            it('should return the filename without headless', () => {
                yargs.argv = {
                    godotVersion: '4.0.3',
                    releaseType: 'stable',
                    isMono: false
                };
                const result = generateGodotFilename();
                expect(result).toEqual({
                    fullGodotName: 'Godot_v4.0.3-stable_linux',
                    fullGodotNameWithArch: 'Godot_v4.0.3-stable_linux.x86_64'
                });
            });
        });

        describe('given releaseType is not stable', () => {
            it('should return the filename without headless', () => {
                yargs.argv = {
                    godotVersion: '4.0.3',
                    releaseType: 'beta',
                    isMono: false
                };
                const result = generateGodotFilename();
                expect(result).toEqual({
                    fullGodotName: 'Godot_v4.0.3-beta_linux',
                    fullGodotNameWithArch: 'Godot_v4.0.3-beta_linux.x86_64'
                });
            });
        });
    });
});