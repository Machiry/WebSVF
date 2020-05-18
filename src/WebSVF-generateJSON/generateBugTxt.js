var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');

function readFileList(dir, filesList = []) {
    const files = fs.readdirSync(dir);
    files.forEach((item, index) => {
        var fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {      
            readFileList(path.join(dir, item), filesList);
        } else {                
            filesList.push(fullPath);                     
        }        
    });
    return filesList;
}

var bcFilesList = [];
var __bcFilesDir = "bcFiles";
readFileList(__bcFilesDir, bcFilesList);

bcFilesList.forEach(element => {
    var commend = 'saber -leak -stat=false ' + element;
    exec(commend, (err, stdout, stderr) => {
        if (stderr != "") {
            fs.appendFile("bugReportInstance.txt", (stderr.toString() + "OutputEnd\n"), (error) => {
                if (error) 
                    console.log("Fail: " + error.message);
            });
        }
    });
});
