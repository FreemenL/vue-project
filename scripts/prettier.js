//使用shell使用的模式匹配文件
const glob = require('glob');
//代码格式化
const prettier = require('prettier');
const fs = require('fs');
const prettierConfigPath = require.resolve('../.prettierrc');
let didError = false;
let files = [];

const ignore = [
  '*.stackdump',
  '**/node_modules/**',
  '**/static/**',
  '**/dist/**',
  '**/typings/**',
  '**/build/**',
  '**/*.txt*',
  '**/*.svg*',
  '**/*.png*',
  '**/*.jpg*',
  '**/*.webp*',
];
const vueFiles = glob.sync('**/*.vue', { ignore });
const jsFiles = glob.sync('**/*.js', { ignore });

files = files.concat(jsFiles).concat(vueFiles);

files.forEach(file => {
  console.log(file);
  const options = prettier.resolveConfig.sync(file, {
    config: prettierConfigPath,
  });

  const fileInfo = prettier.getFileInfo.sync(file);

  if (fileInfo.ignored) {
    return;
  }
  try {
    const input = fs.readFileSync(file, 'utf8');
    const withParserOptions = {
      ...options,
      parser: fileInfo.inferredParser,
    };
    const output = prettier.format(input, withParserOptions);
    if (output !== input) {
      fs.writeFileSync(file, output, 'utf8');
      console.log(`\x1b[34m ${file} is prettier`);
    }
  } catch (e) {
    catchError(e);
  }
});

function catchError(e) {
  console.log(e);
}

console.log('\x1b[32m prettier success!');
