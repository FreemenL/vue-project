const path = require('path');
const { run } = require('runjs');
const utils = require('./utils');
let matchPatterns = false;

require('dotenv').config({
  path: path.resolve(process.cwd(), `.env.development`),
});

// 判断是否存在dev模式的dll 动态链接库 没有就生成
if (!utils.existsDllLibrary('dev')) {
  utils.hint('building dllLibrary...');
  run('webpack --config ./build/webpack.dll.js');
}

// 运行模式
const patterns = [
  {
    name: 'dev',
    run: () =>
      run(
        'nodemon -e js,ts --watch build --watch package.json --watch config --exec "webpack-dev-server  --hot --inline --display-error-details --mode development --config ./build/webpack.config.js"'
      ),
  },
  {
    name: 'run',
    run: () =>
      run(
        'webpack-dev-server  --hot --inline --display-error-details --mode development --config ./build/webpack.config.js'
      ),
  },
];

// 根据配置的开发模式 运行相应的命令
patterns.forEach((pattern, index) => {
  if (pattern.name === utils.systemConfig.pattern.trim()) {
    matchPatterns = true;
    pattern.run();
    return;
  }
});

//错误捕获
if (!matchPatterns) {
  throw new ReferenceError('无效的pattern定义！');
}
