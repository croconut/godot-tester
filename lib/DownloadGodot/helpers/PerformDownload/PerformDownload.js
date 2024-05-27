const fs = require('fs');
const https = require('https');

/**
 * Downloads a file from the specified URL and saves it to the given file location.
 * @param {string} url - The URL of the file to download.
 * @param {string} fileLocation - The location where the downloaded file should be saved.
 * @returns {Promise<string>} A promise that resolves with the file location if the download is successful, or rejects with an error if it fails.
 */
function performDownload(url, fileLocation) {
    const downloadedFile = fs.createWriteStream(fileLocation);

    return new Promise((resolve, reject) => {
        https.get(url, response => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
                return;
            }

            response.pipe(downloadedFile);

            downloadedFile.on('finish', () => {
                downloadedFile.close(() => {
                    const fileSize = fs.statSync(fileLocation).size;
                    if (fileSize > 0) {
                        resolve(fileLocation);
                    } else {
                        reject(new Error('Downloaded file is empty'));
                    }
                });
            });

            downloadedFile.on('error', error => {
                fs.unlink(fileLocation, () => reject(error));
            });
        }).on('error', error => {
            fs.unlink(fileLocation, () => reject(error));
        });
    });
}

module.exports = performDownload;