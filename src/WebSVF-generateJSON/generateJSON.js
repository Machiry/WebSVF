//Step 1: Init
var fs = require('fs');
var exec = require('child_process').exec;
var path = require('path');
var arguments = process.argv.splice(2);
String.prototype.endWith = function(endStr) {
    var d = this.length-endStr.length;
    return (d >= 0 && this.lastIndexOf(endStr) == d);
}
class BugReport {
    constructor(id, FileName, FilePath, Errors) {
        this.id = id;
        this.FileName = FileName;
        this.FilePath = FilePath;
        this.Errors = Errors;
    }
}

//Step 2: Scan the target dir to get all .bc files.
var bcFilesList = [];

var filesList = [];
var filesDir = arguments[0];
readFileList(filesDir, filesList);
filesList.forEach(element => {
    if (element.endWith(".bc")) {
        bcFilesList.push(element);
    }
});

//Step 3: Loop bcFilesList and generate bug reports
var index = 0;
bcFilesList.forEach(element => {
    console.log(element);
    var commend = 'saber -leak -stat=false ' + element;
    exec(commend, (err, stdout, stderr) => {
        if (stderr != "") {
            var data = index + "\n\n" + stderr.toString() + element + "\nOutputEnd\n";
            index++;
            analyzeData(data.toString());
        }
    });
});

//Functions used in process
function analyzeData(output) {
    var bugreports;
    var bugreportsArray = [];
    var outputToArray = output.split("OutputEnd");
    outputToArray.pop();
    outputToArray.forEach(element => {
        var errorStringArray = element.split("\n\n");
        var id = errorStringArray.shift();

        var filePathString_1 = errorStringArray.pop().toString();
        var filePathString_2 = filePathString_1.substring(0, filePathString_1.length -1);
        var index_1 = filePathString_2.lastIndexOf("/");
        var filePath = filePathString_2.substring(0, index_1);

        var index_2 = filePath.lastIndexOf("/");
        var fileName = filePath.substring(index_2 + 1, filePath.length);
        
        var partialLeakArray = [];
        var neverFreeArray = [];
        errorStringArray.forEach(element => {
            if (element.indexOf("PartialLeak") != -1) {
                partialLeakArray.push(element);
            }
            if (element.indexOf("NeverFree") != -1) {
                neverFreeArray.push(element);
            }
        });
        var errors = [];
        partialLeakArray.forEach(element => {
            var partialLeak = analyzePLError(element);
            errors.push(partialLeak);
        })
        neverFreeArray.forEach(element => {
            var neverFree = analyzeNFError(element);
            errors.push(neverFree);
        });
        var bugreport = new BugReport(id, fileName, filePath, errors);
        bugreportsArray.push(bugreport);
        bugreports = {
            "bugreports" : bugreportsArray
        };
    });
    fs.writeFile("Bug-Analysis-Report.json", JSON.stringify(bugreports, null, 2), function(){
        console.log("Generate Bug-Analysis-Report.json successfully");
    });
}

function getParenthesesStr(text) {
    text.match(/\((.+)\)/g);
    return RegExp.$1;
}

function getContent(str,firstStr,secondStr){
    if (str == "" || str == null || str == undefined){
        return "";
    }
    if (str.indexOf(firstStr)<0){
         return "";
    }
    var subFirstStr=str.substring(str.indexOf(firstStr) + firstStr.length, str.length);
    if (secondStr == "") {
        return subFirstStr;
    } else {
        var subSecondStr=subFirstStr.substring(0, subFirstStr.indexOf(secondStr));
        return subSecondStr;
    }
}

function analyzePLError(partialLeak) {
    var array_1 = partialLeak.split("conditional free path:");
    var freePathArray = array_1.pop().split("\n"); 
    freePathArray.pop();
    freePathArray.pop();
    freePathArray.shift();
    var memoryAllocationString = getParenthesesStr(array_1[0]);
    var memoryAllocationLine = getContent(memoryAllocationString, "ln: ", " fl");
    var memoryAllocationPath = getContent(memoryAllocationString, "fl: ", "");
    var memoryAllocation = {
        "ln": memoryAllocationLine,
        "FilePath": memoryAllocationPath
    }
    var freePath = [];
    freePathArray.forEach(element => {
        var freePathLine = getContent(element, "ln: ", " fl");
        var freePathPath = getContent(element, "fl: ", ")");
        var freePathEle = {
            "ln": freePathLine,
            "FilePath": freePathPath
        }
        freePath.push(freePathEle);
    });
    var error = {
        "Type": "PartialLeak",
        "Memory allocation" : memoryAllocation,
        "Free path": freePath
    }
    return error;
}

function analyzeNFError(neverFree) {
    var neverFreeLine = getContent(neverFree, "ln: ", " fl");
    var naverFreePath = getContent(neverFree, "fl: ", ")");
    var error = {
        "Type": "NeverFree",
        "Memory allocation": {
            "ln": neverFreeLine,
            "FilePath": naverFreePath
        }
    };
    return error;
}

function readFileList(dir, filesList = []) {
    const files = fs.readdirSync(dir);
    files.forEach((item, index) => {
        var fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        filesList.push(fullPath);
    });
    return filesList;
}
