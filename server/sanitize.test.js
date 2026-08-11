const test = require('node:test')
const assert = require('node:assert/strict')
const { sanitizeRichText } = require('./sanitize')

test('retains TipTap table structure and safe cell attributes', () => {
  const input = '<table><caption>Thông số</caption><thead><tr><th scope="col" colspan="2">Tiêu đề</th></tr></thead><tbody><tr><td rowspan="2">A</td><td>B</td></tr></tbody></table>'

  const result = sanitizeRichText(input)

  assert.match(result, /<table>/)
  assert.match(result, /<caption>Thông số<\/caption>/)
  assert.match(result, /<thead>/)
  assert.match(result, /<tbody>/)
  assert.match(result, /scope="col"/)
  assert.match(result, /colspan="2"/)
  assert.match(result, /rowspan="2"/)
})

test('retains only supported text alignment styles', () => {
  const input = '<p style="text-align: center; color: red; position: fixed">Căn giữa</p><td style="text-align: justify; background: red">Ô</td>'

  const result = sanitizeRichText(input)

  assert.match(result, /<p style="text-align:center">Căn giữa<\/p>/)
  assert.match(result, /<td style="text-align:justify">Ô<\/td>/)
  assert.doesNotMatch(result, /color|position|background/)
})

test('removes unsafe table markup, event handlers, and URLs', () => {
  const input = '<div class="tableWrapper evil" onclick="alert(1)"><table><tr><td><script>alert(1)</script><a href="javascript:alert(1)">X</a></td></tr></table></div>'

  const result = sanitizeRichText(input)

  assert.doesNotMatch(result, /script|onclick|javascript:/)
  assert.doesNotMatch(result, /class="[^"]*evil/)
})

test('retains TipTap strike markup', () => {
  assert.equal(sanitizeRichText('<p><s>Ngừng kinh doanh</s></p>'), '<p><s>Ngừng kinh doanh</s></p>')
})

test('preserves existing safe links and images', () => {
  const result = sanitizeRichText('<p><a href="https://example.com">Link</a><img src="https://example.com/a.webp" alt="Ảnh"></p>')

  assert.match(result, /href="https:\/\/example.com"/)
  assert.match(result, /rel="noopener noreferrer"/)
  assert.match(result, /target="_blank"/)
  assert.match(result, /src="https:\/\/example.com\/a.webp"/)
  assert.match(result, /alt="Ảnh"/)
})
