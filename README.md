# invoice-front

## Project setup
```
npm install
```
### Compiles and hot-reloads for development
```
npm run dev
```
### Compiles and minifies for production
```
npm run build
```
 
### 项目结构

├── babel.config.js
├── package.json 模块依赖配置
├── public 公开资源目录 详见Vue-Cli3文档
├── src 源码
│   ├── App.vue 入口
│   ├── api 接口统一封装，统一URL和统计方法集合
│   ├── assets 静态资源文件
│   ├── config 配置文件，开发环境和生成环境
│   ├── libs 依赖如工具类，axios，validate，util等工具
│   ├── locale 多语言
│   ├── main.js 入口
    ├── mock 模拟数据
│   ├── router 路由
│   ├── store 全局状态Vuex
│   ├── styles 公用样式
│   └── views 页面
│       ├── card-base 基础管理 
│       ├── card-bill 业务功能
│       ├── card-flow 工作流程  
│       ├── card-query 数据查询
│       ├── card-report 统计报表  
│       ├── card-system 系统管理，用户，单位，角色，全新，代理商，渠道，数据字典，相关配置等
│       ├── Main.vue 主要框架页面 
│       ├── home 首页
│       ├── login.vue 登录页
│       ├── main-components 主要组件 
│       ├── my-components 相关业务组件 
│       ├── xboot-components XBoot组件示例
│       ├── xboot-library 第三方依赖示例
│       ├── xboot-vue-generator 代码生成
│       └── xboot-vue-template 后台模版
└── vue.config.js 配置文件 详见Vue-Cli3文档




