const fs = require('fs');
const str = 'string to append to file';

const writeError = (errorMsg) => {
  fs.appendFile('error.log', `\n${errorMsg}`, function (err) {
    if (err) {
      console.error(err);
    };
    console.log("Saved to error log", errorMsg);
  });

}
module.exports = {
  writeError
}
