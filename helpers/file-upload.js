const azureStorage = require('azure-storage');
const log = require("./logger");

const azureStorageConfig = {
    accountName: process.env.STORAGE_ACCOUNTNAME,
    accountKey:process.env.STORAGE_ACCOUNTKEY,
    blobURL: process.env.STORAGE_BLOBURL,
    containerName: process.env.STORAGE_CONTAINER
};

uploadFileToBlob = async (directoryPath, file, name, size) => {
 
    return new Promise((resolve, reject) => {
        const blobName = getBlobName(name);
        /** 
        * Convert Base64 to blob buffer
        * @reference https://stackoverflow.com/questions/39582878/successfully-saving-base64-image-to-azure-blob-storage-but-blob-image-always-bro/39590768
        */
        // const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        // const type = matches[1];
        // const buffer = new Buffer(matches[2], 'base64');

        const matches = file.split(";");
        const type = matches[0].substr(5);
        const buffer = new Buffer(matches[1].substr(7), 'base64');

        log.info(azureStorageConfig.accountName);
        log.info(azureStorageConfig.blobURL);
        log.info(azureStorageConfig.containerName);
        log.info(azureStorageConfig.accountKey);
        const connectionstring = process.env.STORAGE_CONNECTIONSTRING;
        const blobService = azureStorage.createBlobService(azureStorageConfig.accountName, azureStorageConfig.accountKey); 
        blobService.createBlockBlobFromText(azureStorageConfig.containerName, `${directoryPath}/${blobName}`, buffer, {contentType:type}, err => {
            if (err) {
                log.error(err);
                reject(err);
            } else {
                resolve({ filename: blobName, 
                    originalname: name, 
                    size: size, 
                    path: `${azureStorageConfig.containerName}/${directoryPath}/${blobName}`,
                    url: `${azureStorageConfig.blobURL}/${azureStorageConfig.containerName}/${directoryPath}/${blobName}` });
            }
        });
 
    });
 
};

const getBlobName = originalName => {
    const identifier = Math.random().toString().replace(/0\./, ''); // remove "0." from start of string
    return `${originalName}`;
};

const imageUpload = async(fileObj, next) => {
    try {
        const image = await uploadFileToBlob('images', fileObj.file, fileObj.name, fileObj.size); // images is a directory in the Azure container
        return image;
    } catch (error) {
        next(error);
    }
};

module.exports = {
    imageUpload
  };