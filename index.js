const brnChecker = require("./BRNstatusChecker");

const BRN= process.argv[2]; // node index.js ${BRN}
if (!BRN) {
  console.log("매개변수에 사업자등록번호를 입력하십시오");
} else {
brnChecker(BRN)
  .catch((err) => console.log(err))
  .then((result) => console.log(result));
}

