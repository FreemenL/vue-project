const path = require('path');
const { run }  = require('runjs');
const utils = require('./utils');
const queue = utils.queueGenerator();

require('dotenv').config({
  path: path.resolve(process.cwd(), `.env.production`)
})
/**
 * 删除开发环境dll
*/
queue.tapAsync("delDev", (tag, task, result, next) => {
    setTimeout(() => {
        utils.hint(tag);
        if (utils.existsDllLibrary("dev")) {
            const manifest = utils.devDllLibrary.replace(/dll.js/, "manifest.json");
            utils.rm([utils.devDllLibrary, manifest], (error) => {
                if (error) {
                    throw Error(error);
                }
            }, next)
        } else {
            next();
        }
    }, 0);
})

/**
 * 处理生产环境dll 
*/
queue.tapAsync("generatorDll", (tag, task, result, next) => {
    setTimeout(() => {
        utils.hint(tag);
        if (!utils.existsDllLibrary("pro")) {
            run("cross-env NODE_ENV=production && webpack --config ./build/webpack.dll.js");
        }
        next();
    }, 0);
})


/**
 * 开始构建
*/
queue.tapAsync("start building...", (tag, task, result, next) => {
    setTimeout(() => {
        utils.hint(tag);
        run("cross-env NODE_ENV=production && webpack --profile --config ./build/webpack.prod.js")
    }, 0);
})


queue.callAsync("build", () => {
    utils.hint("build complete");
});


