
const https = require('https');
const fs = require('fs');

const performDownload = require('./PerformDownload');
describe('performDownload', () => {
    const downloadUrl = 'https://download.com/file.zip'
    const fileLocation = 'tmp/fileLocation.zip'
    let fakeStream;
    
    beforeEach(() => {
        fakeStream = {
            on: jest.fn().mockImplementation((event, handler) => {
                if (event === 'finish') {
                    handler();
                }
                return fakeStream;
            }),
            close: jest.fn(),
        }

        fs.createWriteStream.mockReturnValue(fakeStream);
        https.get.mockImplementation((_url, callback) => {
            callback({
                pipe: jest.fn().mockReturnValue(fakeStream),
            });
            return fakeStream;
        });
    });

    it('downloads the file from the url to the fileLocation', async () => {
        await performDownload(downloadUrl, fileLocation);

        expect(fs.createWriteStream).toHaveBeenCalledTimes(1);
        expect(fs.createWriteStream).toHaveBeenCalledWith(fileLocation);
        expect(https.get).toHaveBeenCalledWith(downloadUrl, expect.any(Function));
    });

    it('returns the fileLocation', () => {
        expect(performDownload(downloadUrl, fileLocation)).resolves.toEqual('tmp/fileLocation.zip');
    });
});