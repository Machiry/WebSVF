var fs = require('fs');
var exec = require('child_process').exec;

class BugReport {
    constructor(id, FileName, FilePath, Errors) {
        this.id = id;
        this.FileName = FileName;
        this.FilePath = FilePath;
        this.Errors = Errors;
    }
}

fs.readFile("bugReportInstance.txt", (err, data) => {
    if (err) return console.log("Fail: " + err.message);
    analyzeData(data.toString());
})

function analyzeData(output) {
    var bugreports;
    var bugreportsArray = [];
    var outputToArray = output.split("OutputEnd");
    outputToArray.pop();
    outputToArray.forEach((element, index) => {
        console.log("----------\n" + element + "\n--------------");
        var id = index;
        var filePath = getParenthesesStr(element).split("fl: ").pop();
        var fileName = filePath.split("/").pop();
        var array_1 = element.split("NeverFree");
        if (element.indexOf("PartialLeak") == -1) {
            var neverFreeArray = array_1;
            var partialLeakString = [];
            neverFreeArray.shift();
        } else {
            var partialLeakString = array_1.pop().split("PartialLeak");
            var neverFreeArray = array_1;
            neverFreeArray.shift();
        }
        var errors = [];
        partialLeakString.splice(0,1);
        partialLeakString.forEach(element => {
            var partialLeak = analyzePLError(element);
            errors.push(partialLeak);
        });
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
    fs.writeFile("Bug-Analysis-Report.json", JSON.stringify(bugreports, null, 4), function(){
        console.log("Generate JSON success");
        exec("sudo rm bugReportInstance.txt");
        exec("sudo rm -rf bcFiles");
    });
}

function getParenthesesStr(text) {
    text.match(/\((.+)\)/g);
    return RegExp.$1;
}

function getNum(str,firstStr,secondStr){
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
    var memoryAllocationLine = getNum(memoryAllocationString, "ln: ", " fl");
    var memoryAllocationPath = getNum(memoryAllocationString, "fl: ", ")");
    var memoryAllocation = {
        "ln": memoryAllocationLine,
        "FilePath": memoryAllocationPath
    }
    var freePath = [];
    freePathArray.forEach(element => {
        var freePathLine = getNum(element, "ln: ", " fl");
        var freePathPath = getNum(element, "fl: ", ")");
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
    var neverFreeLine = getNum(neverFree, "ln: ", " fl");
    var naverFreePath = getNum(neverFree, "fl: ", ")");
    var error = {
        "Type": "NeverFree",
        "Memory allocation": {
            "ln": neverFreeLine,
            "FilePath": naverFreePath
        }
    };
    return error;
}
