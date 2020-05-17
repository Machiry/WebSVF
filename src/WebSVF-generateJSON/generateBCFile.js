var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var arguments = process.argv.splice(2);
exec("mkdir bcFiles");

String.prototype.endWith=function(endStr){
    var d = this.length-endStr.length;
    return (d >= 0 && this.lastIndexOf(endStr) == d);
}
 
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
 
var filesList = [];
var __dirname = arguments[0];
readFileList(__dirname,filesList);
console.log(filesList);

var index = 0;
filesList.forEach(element => {
    if (element.endWith(".c")) {
        var command = "clang -c -emit-llvm -g " + element + " -o bcFiles/" + index + ".bc";
        index++;
        exec(command);
    }
});
