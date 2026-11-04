// Une src/*.css y src/*.js dentro de docs/index.html (un solo archivo, sin bundler).
// Uso: node scripts/build.js
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), src = f => fs.readFileSync(path.join(root, 'src', f), 'utf8');
const js = ['art.js', 'seed.js', 'data.js', 'app.js', 'admin.js'].map(src).join('\n\n');
const html = src('index.template.html')
  .replace('/*__CSS__*/', () => src('styles.css'))
  .replace('/*__JS__*/', () => js);
fs.writeFileSync(path.join(root, 'docs', 'index.html'), html);
console.log('docs/index.html', (html.length / 1024).toFixed(0) + ' KB');
