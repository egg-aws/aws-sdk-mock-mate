'use strict';

const assert = require('assert');
const ResponseStream = require('./ResponseStream');

const MOCK_MAP = Symbol('aws-sdk-mock-mate#mock');

function mock(aws, serviceName, version, methodName, replyBody) {
  assert(aws && aws.apiLoader && aws.apiLoader.services, 'must provide a AWS sdk object!');

  assert(typeof serviceName === 'string', 'must provide a serviceName!');
  assert(typeof version === 'string', 'must provide a version!');
  assert(typeof methodName === 'string', 'must provide a methodName!');

  const mockMap = aws[MOCK_MAP] = aws[MOCK_MAP] || new Map();
  const _serviceName = serviceName.toLowerCase();
  const _methodName = methodName.toLowerCase();
  const _version = version.replace(/-/g, '');

  assert(aws.apiLoader.services[_serviceName], `${serviceName} is not a valid AWS service!`);

  assert(aws.apiLoader.services[_serviceName][version], `${version} is not a valid version of ${serviceName}!`);

  const operations = aws.apiLoader.services[_serviceName][version].operations;
  const operationKeys = Object.keys(operations).map(key => key.toLowerCase());

  assert(operationKeys.indexOf(_methodName) > -1, `${methodName} is not a valid methodName of ${serviceName}!`);

  assert(typeof replyBody === 'object', 'replyBody must be a Object!');

  assert(typeof replyBody.statusCode === 'number', 'replyBody.statusCode must be a number!');

  assert(typeof replyBody.body === 'object', 'replyBody.body must be a Object!');

  assert(operationKeys.indexOf(_methodName) > -1, `${methodName} is not a valid methodName of ${serviceName}!`);

  const mockKey = `${_serviceName}_${_version}.${_methodName}`;

  mockMap.set(mockKey, replyBody);

  if (!aws.HttpClient._original_streamsApiVersion) {
    mockHttpClient(aws);
  }
}

function mockHttpClient(aws) {
  const mockMap = aws[MOCK_MAP] = aws[MOCK_MAP] || new Map();

  const _original_streamsApiVersion = aws.HttpClient.streamsApiVersion;
  aws.HttpClient._original_streamsApiVersion = _original_streamsApiVersion;
  aws.HttpClient.streamsApiVersion = 1;

  const _original_handleRequest = aws.HttpClient.prototype.handleRequest;
  aws.HttpClient._original_handleRequest = _original_handleRequest;

  aws.HttpClient.prototype.handleRequest = function(...argv) {
    const operation = argv[0].headers['X-Amz-Target'].toLowerCase();
    if (mockMap.has(operation)) {
      const mockBody = mockMap.get(operation);
      const { EventEmitter } = require('events');
      const res = new ResponseStream();
      const req = new EventEmitter();

      res.statusCode = mockBody.statusCode;

      argv[2](res);
      res.emit(
        'headers',
        res.statusCode,
        {}
      );
      res.on('finish', () => res.emit('end'));
      res.end(JSON.stringify(mockBody.body));
      return req;
    }

    return _original_handleRequest.apply(this, ...argv);
  };

  const _original_getInstance = aws.HttpClient.getInstance;
  aws.HttpClient._original_getInstance = _original_getInstance;

  aws.HttpClient.getInstance = function getInstanceMock() {
    return new this();
  };
}

function restoreHttpClient(aws) {
  if (aws.HttpClient._original_handleRequest) {
    aws.HttpClient.prototype.handleRequest = aws.HttpClient._original_handleRequest;
    delete aws.HttpClient._original_handleRequest;
  }

  if (aws.HttpClient._original_getInstance) {
    aws.HttpClient.getInstance = aws.HttpClient._original_getInstance;
    delete aws.HttpClient._original_getInstance;
  }

  if (aws.HttpClient._original_streamsApiVersion) {
    aws.HttpClient.streamsApiVersion = aws.HttpClient._original_streamsApiVersion;
    delete aws.HttpClient._original_streamsApiVersion;
  }
}

function restore(aws, serviceName, version, methodName) {
  assert(aws && aws.apiLoader && aws.apiLoader.services, 'must provide a AWS sdk object!');

  const mockMap = aws[MOCK_MAP];

  if (arguments.length === 1) {
    mockMap.clear();
  } else {
    let matchKey = serviceName.toLowerCase();

    if (version) {
      matchKey += `_${version.replace(/-/g, '')}`;
      if (methodName) {
        matchKey += `.${methodName.toLowerCase()}`;
      }
    }

    for (const el of mockMap) {
      const key = el[0];
      if (key.startsWith(matchKey)) {
        mockMap.delete(key);
      }
    }
  }

  if (mockMap.size === 0) {
    restoreHttpClient(aws);
  }
}

module.exports = mock;
module.exports.restore = restore;
