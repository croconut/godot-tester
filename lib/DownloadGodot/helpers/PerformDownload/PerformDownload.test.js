const { https } = require('follow-redirects');
const fs = require('fs');
const performDownload = require('./PerformDownload');

describe('performDownload', () => {
    const downloadUrl = 'https://download.com/file.zip';
    const fileLocation = 'tmp/fileLocation.zip';
    let fakeStream;
    let fakePipe;

    beforeEach(() => {
        fakeStream = {
            on: jest.fn().mockImplementation((event, handler) => {
                if (event === 'finish') {
                    handler();
                }
                return fakeStream;
            }),
            close: jest.fn().mockImplementation(callback => callback()), // close is called with a callback
        };

        fs.createWriteStream.mockReturnValue(fakeStream);
        fs.statSync.mockReturnValue({ size: 1 });

        fakePipe = jest.fn().mockReturnValue(fakeStream);
        
        https.get.mockImplementation((_url, callback) => {
            callback({
                statusCode: 200,
                pipe: fakePipe,
            });
            return fakeStream;
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('downloads the file from the url to the fileLocation', async () => {
        await performDownload(downloadUrl, fileLocation);

        expect(fs.createWriteStream).toHaveBeenCalledTimes(1);
        expect(fs.createWriteStream).toHaveBeenCalledWith(fileLocation);
        expect(https.get).toHaveBeenCalledWith(downloadUrl, expect.any(Function));
    });

    it('returns the fileLocation', async () => {
        const result = await performDownload(downloadUrl, fileLocation);
        expect(result).toEqual(fileLocation);
    });

    it('rejects with an error if the download fails', async () => {
        https.get.mockImplementation((_url, callback) => {
            // Simulate a 404 response object
            callback({
                statusCode: 404,
                pipe: fakePipe,
            });
            return fakeStream;
        });

        await expect(performDownload(downloadUrl, fileLocation)).rejects.toThrow();
    });

    it('rejects if gets thrown an error', async () => {
        https.get.mockImplementation((_url, _callback) => {
            throw new Error('An error occurred');
        });

        await expect(performDownload(downloadUrl, fileLocation)).rejects.toThrow();
    });

    it('rejects with an error if the file is empty', async () => {
        fs.statSync.mockReturnValue({ size: 0 });
        await expect(performDownload(downloadUrl, fileLocation)).rejects.toThrow();
    });
});