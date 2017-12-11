class Nonce {

  constructor(opts = {}) {
    this.length = opts.length || 12;
    const uc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lc = 'abcdefghijklmnopqrstuvwxyz';
    const num = '0123456789';
    this.charset = opts.chars || `${uc}${lc}${num}`;

    this.generate();
  }

  generate() {
    let result = '';

    for (let i = 0; i < this.length; i++) {
      result += this.charset[Math.floor(Math.random() * this.charset.length)];
    }

    this.value = result;
  }
  
  static generate(opts = {}) {
    const nonce = new this(opts);
    
    return nonce.value;
  }

}

module.exports = Nonce;
