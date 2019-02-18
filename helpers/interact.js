const PYShell = require("python-shell").PythonShell;
const path = require("path");

let interactWithPython = data => {
  let pyTalk = new Promise((resolve, reject) => {
    console.log("\nPrediction started ....\n");
    let pythonScriptPth = "E:/PythonProjects/DeepBluePothole/Tensorflow/models/research/object_detection/object_detection_2.py"

    let pyshell = new PYShell(pythonScriptPth);
    if(typeof data === "object") {
      pyshell.send(JSON.stringify(data));
    } else {
      pyshell.send(data);
    }
    pyshell.on("message", (message) => {
      resolve(JSON.parse(message));
    });

    pyshell.end(err => {
      if (err) {
        reject(err);
      }
    });
  });
  return pyTalk;
};

module.exports = interactWithPython;
