'use strict'
const fs = require('fs')
const path = require('path')
const util = require('util')
const iconv = require('iconv-lite')
const dirname = process.argv[2]
const dir = path.join('data', dirname)

let files = fs.readdirSync(dir)
  .sort((a, b) => parseInt(a.replace('.html', '')) < parseInt(b.replace('.html', '')) ? -1 : 1 )

let result = []
let counter = 0

files.slice(0).forEach((file, i) => {
  console.log(i+1, file)
  let buf = fs.readFileSync(path.join(dir, file))
  let content = iconv.decode(buf, 'win1251')
  let reStr = ''
  reStr += '\\&nbsp;(\\d+)\\&nbsp;...\\<\\/div\\>' + '\\s+'
  reStr += '\\<table cellpadding="0" cellspacing="2"\\>' + '\\s+'
  reStr += `\\<tr\\>\\<td\\>(?:\\<span class="gray"\\>)?([^\\<]+)(?:\\<\\/span\\>)?\\<\\/td\\>\\<\\/tr\\>` + '\\s+'
  reStr += `\\<tr\\>\\<td\\>\\<big\\>\\<a href="(\\/detail\\/book\\d+.html)"\\>([^\\<]+)\\<\\/a\\>\\<\\/big\\>\\<\\/td\\>\\<\\/tr\\>` + '\\s+'
  reStr += `\\<tr\\>\\<td\\>(.+?)\\<small\\>`
  let matches = content.match(new RegExp(reStr, 'sg'))
  if (!matches) {
    console.log('error1', file)
    onEnd()
  }
  matches.slice(0).forEach(item => {
    let m = item.match(new RegExp(reStr, 's'))
    if (!m) {
      console.log('error2', file)
      onEnd()
    }
    counter++
    let [,price,author,link,name,publish] = m
    publish = publish.replace(/\<br\s*\/\>/g, ' ')
    link = 'https://libex.ru' + link
    result.push({ price, author, link, name, publish })
  })
})

onEnd()

function onEnd() {
  sortAndWrite('author')
  // sortAndWrite('name')
  console.log(counter)
  process.exit()
}


function sortAndWrite(byField) {
  let res = ''
  let res2 = ''
  result.sort(getSortFn(byField)).forEach((item, i) => {
    let { price, link, author, name, publish } = item
    let year = publish.match(/(\d\d\d\d) г.;/)
    let sp = '&nbsp;'
    year = year && year[1] || ''
    if (byField == 'author') {
      res2 += util.format(
        '%s. <a href="%s" target="_blank">%s%s%s</a> %s г. %s руб<br>\r\n',
        i+1, link, author, sp.repeat(3), name, year, price
      )
    }
    // res += util.format('<a href="%s" target="_blank">%s %s, %s, %s, %s</a><br>\r\n', link, i+1, price, author, name, publish)
  })
  fs.writeFileSync('data/' + `${dirname}_${byField}.html`, res2)
  // if (byField == 'author') {
    // fs.writeFileSync('data/' + `${dirname}_${byField}_noPublish.html`, res2)
  // }
}


function getSortFn(byField) {
  return (a, b) => {
    let cmp = a[byField].localeCompare(b[byField])
    if (cmp === 0 && byField == 'author') {
      cmp = a.name.localeCompare(b.name)
    }
    return cmp
  }
}
