# BRN-checker
This is an open API `source` available **ONLY** in `South Korea`, it checks a company `current closure status` & provide `detailed information` if it is a Telecommunication seller company (**E-commerce**).

* All the request are made using [`axios`](https://www.npmjs.com/package/axios)
* Type-checking & null-proof with [`Typescript`](https://www.typescriptlang.org/index.html)

## Features:
* Request business current closure status at [Hometax](https://teht.hometax.go.kr/websquare/websquare.html?w2xPath=/ui/ab/a/a/UTEABAAA13.xml)'s API
```javascript
There are 3 possible outputs under the key name `businessStatus`:

    1. '사업을 하지 않고 있습니다.'

    2. '부가가치세 간이과세자 입니다.'

    3. '부가가치세 일반과세자 입니다.'
```
* If the company is an E-commerce (['통신판매업자'](http://www.ftc.go.kr/www/bizCommList.do?key=232)) the API returns detailed data.


## Usage
### ***The API server is not hosted. This is only the Source***

- Install ts-node & typescript: `npm install -g ts-node typescript`
- git clone this repo
- Install dependencies: `yarn` or `npm i`
- execute with node + BRN (Business Registration Number - 사업자등록번호)

```bash
    ts-node index.ts ${BRN}
```

## Import
`BRN-checker` can be imported where ever you need. Just has to be called with a parameter, the BRN.

|  |  |
|--|--|
|Parameter| `string` |
|Return| `string` or `Object` |

#### Example
```javascript
  import brnChecker from './brnChecker';

  brnChecker(1234567890);

  // Output>
  // See `Output` below

```


## Output
The examples below are filled with `dummy data`

- If the consulted ${`BRN`} status belongs to a currently `closed company`:
```javascript
| MyTerminal > ts-node index.ts 1234567890

{ businessStatus: '사업을 하지 않고 있습니다.' }
```

- If the consulted ${`BRN`} status belongs to a currently `available company`:
```javascript
| MyTerminal > ts-node index.ts 1234567890

{
  tcsNo: '2020-가나다라-01234',
  brnNo: '123-45-67890',
  reportStatus: '통신판매업 신고',
  corporateType: '법인',
  companyName: '(주)사업자명',
  representativeName: '김철수',
  tel: '070 1234 5678',
  businessType: '인터넷',
  businessItem: '건강/식품, 기타',
  email: 'com@com.com',
  reportDate: '20200510',
  address1: '서울특별시 강남구 논현동 1번지 101호',
  address2: '서울특별시 강남구 도산대로1길 25 (논현동)',
  domain: 'mycompany.com',
  serverAddress: '서울특별시 강남구청 (01-2345-6789-0123)',
  businessStatus: '부가가치세 일반과세자 입니다.'
}
```

# License
* **MIT**

