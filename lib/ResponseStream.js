'use strict';

const { Duplex } = require('stream');

class ResponseStream extends Duplex {
  constructor() {
    super();
    this.datas = [];
  }

  _read() {
    if (this.datas.length > 0) {
      this.push(this.datas.shift());
    }
  }

  _write(chunk, enc, cb) {
    this.datas.push(chunk);
    cb();
  }
}

module.exports = ResponseStream;
