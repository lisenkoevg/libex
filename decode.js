const iconv = require('iconv-lite')
const fs = require('fs')
const fname = process.argv[2]
const buf = fs.readFileSync(fname)
const utf8 = iconv.decode(buf, 'win1251')
fs.writeFileSync(process.argv[3] || fname, utf8)
