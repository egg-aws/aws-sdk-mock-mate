# aws-sdk-mock-mate

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/aws-sdk-mock-mate.svg?style=flat-square
[npm-url]: https://npmjs.org/package/aws-sdk-mock-mate
[travis-image]: https://api.travis-ci.com/egg-aws/aws-sdk-mock-mate.svg
[travis-url]: https://travis-ci.com/egg-aws/aws-sdk-mock-mate
[codecov-image]: https://img.shields.io/codecov/c/github/egg-aws/aws-sdk-mock-mate.svg?style=flat-square
[codecov-url]: https://codecov.io/github/egg-aws/aws-sdk-mock-mate?branch=master
[david-image]: https://img.shields.io/david/egg-aws/aws-sdk-mock-mate.svg?style=flat-square
[david-url]: https://david-dm.org/egg-aws/aws-sdk-mock-mate
[snyk-image]: https://snyk.io/test/npm/aws-sdk-mock-mate/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/aws-sdk-mock-mate
[download-image]: https://img.shields.io/npm/dm/aws-sdk-mock-mate.svg?style=flat-square
[download-url]: https://npmjs.org/package/aws-sdk-mock-mate

Mock tool for aws sdk.

## Install

```bash
$ npm i aws-sdk-mock-mate --save
```

## Usage

```js
const mock = require('aws-sdk-mock-mate');
const AWS = require('aws-sdk');

mock(AWS, 'dynamodb', '2012-08-10', 'describeLimits', {
  statusCode: 200,
  body: {
    AccountMaxReadCapacityUnits: 100,
    AccountMaxWriteCapacityUnits: 100,
    TableMaxReadCapacityUnits: 100,
    TableMaxWriteCapacityUnits: 100
  },
});

dynamodbClient.describeLimits()
  .promise()
  .then(result => {
    console.log(result);
    mock.restore(AWS, 'dynamodb', '2012-08-10', 'describeLimits');
  }).catch(err => console.log(err));

```

## API

- `mock(aws, serviceName, version, methodName, replyBody)` mock a aws service method with provided response body.
  - `aws` { Object } a valid AWS SDK object.
  - `serviceName` { String } a valid AWS service name.
  - `version` { String } a valid AWS service version string.
  - `methodName` { String } a valid service method name.
  - `replyBody` { Object } mocked reply.
    - `statusCode` { Number } status code. 200 for normal, 400 for exception.
    - `body` { Object } response body. seem more at [examples](https://github.com/aws/aws-sdk-js/blob/master/apis/dynamodb-2012-08-10.examples.json).
- `mock.restore(aws, serviceName, version, methodName)` restore the mock operation.
  - `aws` { Object } a valid AWS SDK object.
  - `serviceName` { String } optional. a valid AWS service name.
  - `version` { String } optional. a valid AWS service version string.
  - `methodName` { String } optional. a valid service method name.

## Questions & Suggestions

Please open an issue [here](https://github.com/egg-aws/aws-sdk-mock-mate/issues).

## License

[MIT](LICENSE)
