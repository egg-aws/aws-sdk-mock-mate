'use strict';

const assert = require('assert');
const AWS = require('aws-sdk');
const { DynamoDB } = require('aws-sdk');
const awsMock = require('../');

const config = {
  apiVersion: '2012-08-10',
  endpoint: 'http://127.0.0.1:8000',
  region: 'localhost',
  accessKeyId: 'accessKeyId',
  secretAccessKey: 'secretAccessKey',
};

describe('test/aws-sdk.test.js', () => {
  it('should throws', () => {
    assert.throws(() => awsMock(), /must provide a AWS sdk object!/);

    assert.throws(() => {
      awsMock(AWS);
    }, /must provide a serviceName!/);

    assert.throws(() => {
      awsMock(AWS, 'dynamodbx');
    }, /must provide a version!/);

    assert.throws(() => {
      awsMock(AWS, 'dynamodbx', '2012-08-11');
    }, /must provide a methodName!/);

    assert.throws(() => {
      awsMock(AWS, 'dynamodbx', '2012-08-11', 'CreateTable');
    }, /dynamodbx is not a valid AWS service!/);

    assert.throws(() => {
      awsMock(AWS, 'dynamodb', '2012-08-11', 'CreateTable');
    }, /2012-08-11 is not a valid version of dynamodb!/);

    assert.throws(() => {
      awsMock(AWS, 'dynamodb', '2012-08-10', 'CreateTablex');
    }, /CreateTablex is not a valid methodName of dynamodb!/);

    assert.throws(() => {
      awsMock(AWS, 'dynamodb', '2012-08-10', 'CreateTable');
    }, /replyBody must be a Object!/);

    assert.throws(() => {
      awsMock(AWS, 'dynamodb', '2012-08-10', 'CreateTable', {});
    }, /replyBody.statusCode must be a number!/);

    assert.throws(() => {
      awsMock(AWS, 'dynamodb', '2012-08-10', 'CreateTable', {
        statusCode: 200,
      });
    }, /replyBody.body must be a Object!/);
  });

  it('should mock ok', async () => {
    const outPut = {
      Item: {
        id: {
          S: 'test',
        },
      },
    };

    awsMock(AWS, 'dynamodb', '2012-08-10', 'getItem', {
      statusCode: 200,
      body: outPut,
    });

    const dynamodb = new DynamoDB(config);

    const getItemInput = {
      Key: {
        id: {
          S: 'test',
        },
      },
      TableName: 'testTable',
    };

    const res = await dynamodb.getItem(getItemInput).promise();
    assert.deepEqual(res, outPut);

    awsMock.restore(AWS);
  });
});
