var exec = require('child_process').exec;
var fs = require('fs');

var arguments = process.argv.splice(2);
var filePath = arguments[0];
var regex = /\(([^)]*)\)/;
var commend = 'saber -leak -stat=false ' + filePath;

exec(commend, (err, stdout, stderr) => sendJSONFile(stderr));

function sendJSONFile(output) {
    if (output.search('PartialLeak') == -1) {
        console.log('Invalid file path.');
        return null;
    }
    var outputToArray = output.split('\n');
    var transitionArray_1 = outputToArray.slice(outputToArray.length - 5, outputToArray.length - 2);
    var transitionArray_2 = [];

    for (var s in transitionArray_1) {
        var str = transitionArray_1[s];
        var arr = str.match(regex);
        transitionArray_2.push(arr);
    }

    var transitionArray_3 = [
        transitionArray_2[0][1],
        transitionArray_2[2][1]
    ];

    var resultArray = [];
    for (var l in transitionArray_3) {
        var content = transitionArray_3[l];
        var num = getNum(content, "ln: ", " fl");
        var fileName = getNum(content, "fl: ", "");
        var obj = {
            'line' : num,
            'file' : fileName
        };
        resultArray[l] = obj;
    }
    var resultJSONArray = [];
    resultJSONArray[0] = {
        "Memory allocation" : resultArray[0],
        "Conditional free path" : resultArray[1]
    };
    fs.writeFile("report.json", JSON.stringify(resultJSONArray, null, 4), function(){
        console.log("Generate JSON success");
    });
}



function getNum(str,firstStr,secondStr){
    if (str == "" || str == null || str == undefined){ // "",null,undefined
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
