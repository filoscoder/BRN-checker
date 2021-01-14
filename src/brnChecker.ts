import axios from 'axios';

const ftcKeys: Record<string, string> = {
  통신판매번호: "tcsNo",
  사업자등록번호: "brnNo",
  신고현황: "reportStatus",
  법인여부: "corporateType",
  상호: "companyName",
  대표자명: "representativeName",
  "대표 전화번호": "tel",
  판매방식: "businessType",
  취급품목: "businessItem",
  "전자우편(E-mail)": "email",
  신고일자: "reportDate",
  사업장소재지: "address1",
  "사업장소재지(도로명)": "address2",
  인터넷도메인: "domain",
  호스트서버소재지: "serverAddress",
  휴페업상태: "businessStatus",
};

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

const requestFtcUrl = 'http://www.ftc.go.kr/bizCommPop.do?wrkr_no={BRNtoReplace}';
const requestHometaxUrl =
  'https://teht.hometax.go.kr/wqAction.do?actionId=ATTABZAA001R08&screenId=UTEABAAA13&popupYn=false&realScreenId=';
const requestBody =
  // eslint-disable-next-line max-len
  '<map id="ATTABZAA001R08"><pubcUserNo/><mobYn>N</mobYn><inqrTrgtClCd>1</inqrTrgtClCd><txprDscmNo>{BRNtoReplace}</txprDscmNo><dongCode>15</dongCode><psbSearch>Y</psbSearch><map id="userReqInfoVO"/></map>';

function xmlBRNparser(responseData: string = '') {
  return new Promise<string>((resolve): void => {
    const matchRegExp = /<trtCntn[^>]*>([^<]+)<\/trtCntn>/gi;
    resolve(matchRegExp.exec(responseData)[1]);
  });
}

function htmlFTCParser(
  htmlResponse: string,
  xmlResponse: string | void,
): Promise<Record<string, string>> {
  return new Promise<Record<string, string>>((resolve, reject): void => {
    if (!htmlResponse) reject(console.error("There's no data to parse"));
    const thMatchRegExp = /<th[^>]*>([^<]+)<\/th>/gi;
    const tdMatchRegExp = /<td[^>]*>([^<]+)<\/td>/gi;
    let thMatch: Array<string> | null = thMatchRegExp.exec(htmlResponse);
    let tdMatch: Array<string> | null = tdMatchRegExp.exec(htmlResponse);
    const obj: Record<string, string> = {};
    while (thMatch !== null && tdMatch !== null) {
      obj[ftcKeys[thMatch[1].trim()]] = tdMatch[1].trim();
      thMatch = thMatchRegExp.exec(htmlResponse);
      tdMatch = tdMatchRegExp.exec(htmlResponse);
    }
    // @ts-ignore
    obj.businessStatus = xmlResponse;
    resolve(obj);
  });
}

const brnChecker = (BRN: string): Promise<string | Record<string, string>> => {
  return new Promise<Record<string, string>>((resolve, reject): void => {
    axios
      .post(
        requestHometaxUrl,
        // Send ${requestBody} replacing 'BRNtoReplace' with user input ${BRN}
        requestBody.replace(/\{BRNtoReplace\}/, String(BRN)),
        { headers: { 'Content-Type': 'text/xml' } },
      )
      .catch((err) => {
        if (err.response) {
          // Request made and SERVER RESPONDED
          // console.log(err.response.data);
          // console.log(err.response.status);
          // console.log(err.response.headers);
          reject(err.response);
        } else if (err.request) {
          // The request was made but NO RESPONSE was received
          // console.log(err.request);
          reject(err.reques);
        }
        // Something happened in setting up the request that triggered an Error
        reject(err);
      })
      .then((res) => {
        // @ts-ignore
        const xmlResponse: string = res.data;
        xmlBRNparser(xmlResponse) // API response > 'data' parser to get current company status msg
          .catch((err) => reject(err))
          .then((parsedXmlRes: string | void) => {
            if (parsedXmlRes !== '사업을 하지 않고 있습니다.') {
              axios
                .get(
                  // Send ${requestFtcUrl} replacing 'BRNtoReplace' with user input ${BRN}
                  requestFtcUrl.replace(/\{BRNtoReplace\}/, String(BRN)),
                )
                .catch((err) => {
                  if (err.response) {
                    // Request made and SERVER RESPONDED
                    // console.log(err.response.data);
                    // console.log(err.response.status);
                    // console.log(err.response.headers);
                    reject(err.response);
                  } else if (err.request) {
                    // The request was made but NO RESPONSE was received
                    // console.log(err.request);
                    reject(err.request);
                  }
                  // Something happened in setting up the request that triggered an Error
                  reject(err);
                })
                .then((res) => {
                  // @ts-ignore
                  const htmlResponse = res.data;
                  htmlFTCParser(
                    htmlResponse,
                    parsedXmlRes,
                  ).then((parsedHtmlRes) => resolve(parsedHtmlRes));
                });
            } else {
              resolve({ businessStatus: parsedXmlRes }); // output: '사업을 하지 않고 있습니다.'
            }
          });
      });
  });
};

export default brnChecker;