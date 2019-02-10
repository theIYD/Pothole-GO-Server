const PYShell = require("python-shell").PythonShell;
const path = require("path");

let interactWithPython = data => {
  let pyTalk = new Promise((resolve, reject) => {
    console.log(data);
    let pythonScriptPth = path.resolve(
      __dirname,
      "../Pothole-GO-Python/Pothole-Go-Python/test_sizeMixed/mixed3.py"
    );
    console.log(pythonScriptPth);

    let pyshell = new PYShell(pythonScriptPth);
    pyshell.send(JSON.stringify(data));
    pyshell.on("message", function(message) {
      // received a message sent from the Python script (a simple "print" statement)
      console.log(message);
      resolve(message);
    });

    // end the input stream and allow the process to exit
    pyshell.end(function(err) {
      if (err) {
        reject(err);
      }

      console.log("finished");
    });
  });
  return pyTalk;
};

module.exports = interactWithPython;
