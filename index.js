const crnChecker = require("./CRNstatusChecker");

// postCRN("3051577349").catch(err => console.log(err)).then(result => console.log(result))
const CRNumber = process.argv[2]; // 매개변수 -> 사업자번호
if (!CRNumber) {
  console.log("매개변수에 사업자등록번호를 입력하십시오");
} else {
crnChecker(CRNumber)
  .catch((err) => console.log(err))
  .then((result) => console.log(result));
}

