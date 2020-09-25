const CompressionPlugin = require('compression-webpack-plugin');
const webpack = require('webpack')
const path = require("path");
const resolve = dir => path.join(__dirname, dir);

module.exports = {
    /* 部署生产环境和开发环境下的URL：可对当前环境进行区分，baseUrl 从 Vue CLI 3.3 起已弃用，要使用publicPath */
    /* baseUrl: process.env.NODE_ENV === 'production' ? './' : '/' */
    //publicPath: process.env.NODE_ENV === 'production' ? '/public/' : './',
    /* 输出文件目录：在npm run build时，生成文件的目录名称 */
    //outputDir: 'dist',
    /* 放置生成的静态资源 (js、css、img、fonts) 的 (相对于 outputDir 的) 目录 */
    assetsDir: "public",
    /* 是否在构建生产包时生成 sourceMap 文件，false将提高构建速度 */
    //productionSourceMap: false,
    /* 默认情况下，生成的静态资源在它们的文件名中包含了 hash 以便更好的控制缓存，你可以通过将这个选项设为 false 来关闭文件名哈希。(false的时候就是让原来的文件名不改变) */
    //filenameHashing: false, 
    devServer: {
        https: false, // https:{type:Boolean} 
        host: '0.0.0.0',
        port: 8009,
        /*   proxy: {
              '/': {
                  target: '127.0.0.1:8000',  // 请求本地 需要后台项目
                  changeOrigin: true,   // 是否跨域 
                  //ws: true,
                  pathRewrite: {
                      "^/": ""//这里理解成用‘/api’代替target里面的地址
                  }
              }
          } */
    },
    // 打包时不生成.map文件 避免看到源码
    productionSourceMap: false,
    // js文件最小化处理
    chainWebpack: config => {
        config.resolve.symlinks(true);
        //添加别名
        config.resolve.alias
            .set("@", resolve("src"))
            .set("assets", resolve("src/assets"))
            .set("components", resolve("src/components"))
            .set("static", resolve("src/static"))

        config.optimization.minimize(true);
        //分割代码
        config.optimization.splitChunks({
            chunks: 'all'
        })
        // //压缩图片
        // config.module
        //     .rule('images')
        //     .use('image-webpack-loader')
        //     .loader('image-webpack-loader')
        //     .options({
        //         bypassOnDebug: true
        //     })
        //     .end()
    },
    // 部署优化,对象形式，此处的设置会和cli中的设置合并到一块
    configureWebpack: {
        // GZIP压缩
        plugins: [
            new CompressionPlugin({
                test: /\.js$|\.html$|\.css/, // 匹配文件
                threshold: 10240, // 对超过10k文件压缩
                filename: '[path].gz[query]',
                algorithm: 'gzip',
                minRatio: 0.8,
                deleteOriginalAssets: false,//是否删除源文件 
            }),
            new webpack.ProvidePlugin({})
        ]
    }
}