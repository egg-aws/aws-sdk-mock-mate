'use strict';

const assert = require('assert');
const ResponseStream = require('../lib/ResponseStream');
const pedding = require('pedding');

describe('test/ResponseStream.test.js', () => {
  before(() => { });
  after(() => { });

  it('should ResponseStream ok', done => {
    const stream = new ResponseStream();
    stream.on('readable', () => {
      let chunk = '';
      let tmp;
      while ((tmp = stream.read()) !== null) {
        chunk += tmp.toString();
      }
      assert(chunk === 'Hello World');
      done();
    });

    stream.end('Hello World');
  });

  it('should end emmit ok', done => {
    done = pedding(2, done);
    const stream = new ResponseStream();
    stream.on('readable', () => {
      let chunk = '';
      let tmp;
      while ((tmp = stream.read()) !== null) {
        chunk += tmp.toString();
      }
      assert(chunk === 'Hello World');
      done();
    });

    stream.on('end', () => done());
    stream.on('finish', () => stream.emit('end'));
    stream.end('Hello World');
  });
});
