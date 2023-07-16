const getCliArgs = require('./GetCliArgs');

function isGodotFour() {
    const args = getCliArgs();

    const version = args.godotVersion;
    const versionParts = version.split('.');
    const majorVersion = versionParts[0];
    const isFour = majorVersion === '4' || majorVersion === 'v4';
    return isFour;
};

module.exports = isGodotFour;