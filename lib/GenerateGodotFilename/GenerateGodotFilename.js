const getCliArgs = require('../GetCliArgs/GetCliArgs');
const isGodotFour = require('../IsGodotFour/IsGodotFour');

function generateFileName() {
    const args = getCliArgs();

    const godotVersion = args.godotVersion;
    const releaseType = args.releaseType;
    const isMono = args.isMono;

    let fullGodotName = `Godot_v${godotVersion}-${releaseType}`;
    let fullGodotNameWithArch = '';
    if (isGodotFour()) {
        if (isMono) {
            fullGodotName += '_mono_linux';
            fullGodotNameWithArch = `${fullGodotName}_x86_64`;
        } else {
            fullGodotName += '_linux';
            fullGodotNameWithArch = `${fullGodotName}.x86_64`;
        }
    } else {
        if (isMono) {
            fullGodotName += '_mono_linux_headless';
            fullGodotNameWithArch = `${fullGodotName}_64`;
        } else {
            fullGodotName += '_linux_headless';
            fullGodotNameWithArch = `${fullGodotName}.64`;
        }
    }

    return {
        fullGodotName,
        fullGodotNameWithArch
    };
};

module.exports = generateFileName;