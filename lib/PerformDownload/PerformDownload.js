const fs = require('fs');
const https = require('https');

function performDownload(url, fileLocation) {
    const downloadedFile = fs.createWriteStream(fileLocation);

    return new Promise((resolve, reject) => {
        https.get(url, response => {
            response.pipe(downloadedFile);
            downloadedFile.on('finish', () => {
                downloadedFile.close();
                resolve(fileLocation);
            });
        }).on('error', error => {
            fs.unlink(fileLocation);
            reject(error);
        });
    });
}

module.exports = performDownload;