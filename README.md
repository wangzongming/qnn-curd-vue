# qnn-curd-vue

[![](https://img.shields.io/badge/vue->%3D2.6.12-brightgreen)](https://vuejs.org/)
[![antd](https://img.shields.io/badge/element--ui->%3D2.15.1-brightgreen)](https://element.eleme.io/)
[![](https://img.shields.io/badge/issues-brightgreen)](https://github.com/wangzongming/qnn-curd-vue/issues)
[![](https://img.shields.io/badge/npm-brightgreen)](https://www.npmjs.com/package/qnn-curd-vue)


> qnn-curd-vue 表格组件 + 表单组件， 一套致力于前端管理页面 增、删、查、改 功能页面的的前端组件。<br />
> 使用字面量对象描述出字段和接口即可生成表格、表单页面。让管理端页面开发简单起来~~


## 功能列表

-   <i style="color:green">√</i> 支持使用 json 配置生成所需表单 【推荐】 
-   <i style="color:green">√</i> 支持 pc 端、移动端（ing...） 
-   <i style="color:green">√</i> 支持 多种 种输入控件/输入校验（将持续更新...）     

> 你给的一颗颗星就是我最大的动力！


## 在线体验[codesandbox]

-   <p><a href="https://codesandbox.io/s/xxx">各种类型输入控件 ing...</a>


## 安装

    npm i qnn-curd-vue  |  yarn add qnn-curd-vue

    
## 引用

    // 项目入口文件 main.js
    import QnnCurd from 'qnn-curd-vue'
    const lodash = require('lodash');
    const moment = require('moment');

    // 组件内部使用了这四个方法。
    Vue.prototype.$cloneDeep = lodash.cloneDeep;
    Vue.prototype.$moment = moment; 
    // ajax 请求方法，根据项目业务来写就行，只要输入和输出和组件规定的一致即可，详情见文档
    Vue.prototype.$myFetch = ()=>{} 
    // 文件上传 方法，根据项目业务来写就行，只要输入和输出和组件规定的一致即可，详情见文档
    Vue.prototype.$myUpload = ()=>{}

    Vue.use(QnnCurd) 

    // ...

    
    // 业务页面 Page.vue 
    <template>
        <div class="page">
            <QnnCurd 
                :fetchConfig="fetchConfig" 
                :actionBtns="actionBtns" 
                :tableFields="tableFields" 
                :formFields="formFields"
                :rowKey="rowKey"
                :isShowRowSelect="isShowRowSelect"
            />
        </div>
    </template>
    <script>
        export default {
            data(){
                return {
                    rowKey:"id",
                    tableFields:[
                         {
                            field: "title",
                            label: "标题", 
                        },
                        // ...
                    ]
                    // ...
                }
            }
        }
    </script>


## 中文文档
-   <p><a href="https://www.yuque.com/apih5/yuf3i0/tgedh9">文档查阅</a>

## 英文文档
-   <p><a href="">【暂无~】</a>


## 是否有 react 版本的？
-  有，但是暂时文档还需要整理...

## 是否用的 vue3 来发的？
-  否，使用的 2 开发的
