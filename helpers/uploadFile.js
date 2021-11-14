const fs = require('fs');
const path = require('path');

const uploadFileToDrive = async(file, uploadDir) =>{
    console.log("uploading file.....");
    return new Promise(async (resolve, reject) =>{
        let isDirExist = await ensureDirectoryExist(uploadDir);
        if(!isDirExist || isDirExist =='false'){
          
            fs.mkdir(uploadDir,{ recursive: true }, (err) => {
                if (err) {
                    return console.error(err);
                }
                writeFile(file, uploadDir);
                resolve(true);
            });
        }
       writeFile(file, uploadDir);
       resolve(true);
    })
}
const writeFile = async (file, uploadDir) =>{
 
    var strImage = file.src.split("base64,")[1];
    var imageBuffer = new Buffer(strImage, 'base64');
    fs.writeFileSync(uploadDir+'/'+ file.name, imageBuffer);
}

const ensureDirectoryExist = async (uploadDir) =>{
if (fs.existsSync(uploadDir)) {
    return true;
} else {
    return false;
}
}

module.exports = {uploadFileToDrive}