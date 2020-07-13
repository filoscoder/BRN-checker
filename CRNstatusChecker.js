const xml2js= require("xml2js");
const axios = require("axios");

// Hometax(국세청) 사업자번호 조회 API Request
/*
사업자등록번호로 조회 시 "사업자등록상태" 내용은 사업자의 과세유형(일반/간이 등)과 사업자상태(계속/휴업/폐업)를 보여줍니다.
(단, 국세청에 등록되어 있지 않은 사업자번호인 경우 "사업을 하지 않고 있습니다."라고 표시됨.)
 ☞ 계속사업자 예시 : 부가가치세 일반과세자 입니다.
 ☞ 폐업사업자 예시 : 폐업자 (과세유형:부가가치세 면세사업자, 폐업일자:2013-01-01) 입니다.
사업자단위과세 사업자인 경우, 주된 사업자등록번호를 제외한 종된 사업장의 기존 사업자등록번호는 폐업처리되므로, 실제 폐업여부는 거래처에 사업자등록사항을 직접 확인하시기 바랍니다.
(※ 사업자단위과세자는 부가가치세법 시행령 제12조 제1항 단서에 의해 하나의 사업자등록번호로 관리됩니다.)

https://www.hometax.go.kr/websquare/websquare.wq?w2xPath=/ui/pp/index_pp.xml
*/

const requestUrl =
  "https://teht.hometax.go.kr/wqAction.do?actionId=ATTABZAA001R08&screenId=UTEABAAA13&popupYn=false&realScreenId=";
const requestBody =
  '<map id="ATTABZAA001R08"><pubcUserNo/><mobYn>N</mobYn><inqrTrgtClCd>1</inqrTrgtClCd><txprDscmNo>{CRNtoReplace}</txprDscmNo><dongCode>15</dongCode><psbSearch>Y</psbSearch><map id="userReqInfoVO"/></map>';


function xmlCRNparser (responseData) {
    return new Promise((resolve, reject) => {
      xml2js.parseString(responseData, (err, res) => {
        if (err) reject(err);
        else resolve(res.map.trtCntn[0]); // Company status msh => RESPONSE > 'map' > 'trtCntn' >
      });
    });
  }


module.exports = function (crn) {
  return new Promise((resolve, reject) => {
    axios
      .post(
        requestUrl,
        requestBody.replace(/\{CRNtoReplace\}/, String(crn)), // Send ${requestBody} replacing 'CRNtoReplace' with user input ${crn}
        { headers: { "Content-Type": "text/xml" } }
      )
      .catch((err) => {
                        if (err.response) {
                          // Request made and SERVER RESPONDED
                          console.log(err.response.data);
                          console.log(err.response.status);
                          console.log(err.response.headers);
                          resolve("사업자번호 조회 중 문제가 발생했습니다");
                        } else if (err.request) {
                          // The request was made but NO RESPONSE was received
                          console.log(err.request);
                          resolve("사업자번호 조회 서버에 접근할 수 없습니다");
                        }
                        // Something happened in setting up the request that triggered an Error
                        reject(err);
                      })
      .then((res) => {
        xmlCRNparser(res.data) // API response > 'data' parser to get current company status msg
          .catch((err) => reject(err))
          .then((parsedRes) => resolve(parsedRes));
      });
  });
};
