const args = require('yargs')
    .string(['godotVersion'])
    .argv;

function isGodotFour() {
    const version = args.godotVersion;
    const versionParts = version.split('.');
    const majorVersion = versionParts[0];
    const isFour = majorVersion === '4' || majorVersion === 'v4';
    return isFour;
};

module.exports = isGodotFour;