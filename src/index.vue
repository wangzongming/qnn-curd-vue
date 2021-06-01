<template>
<div class="qnnCurd">
    <!-- 表格视图 -->
    <div v-if="view === 'table'">
        <QnnTable  
          :loadingsBtn="loadingsBtn"
          :actionBtns="$props.actionBtns"
          :tableFields="$props.tableFields"
          :fetchConfig="$props.fetchConfig"
          :formatData="$props.formatData"
          :data="$props.data"  
          :isShowRowSelect="$props.isShowRowSelect"
          :border="true"
          :getSearchField="getSearchField"
          @clearSelectedRows="clearSelectedRows"
          @btnClick="btnClick"
          ref="qnnTable"
        /> 
    </div>

    <!-- 表单视图 -->
    <div v-if="view === 'form'">
      <QnnForm 
        :formFields="qnnFormFields"
        :curClickBtn="curClickBtn"
        :loadingsBtn="loadingsBtn"
        :disabeld="formDisabeld"
        :curClickRowData="curClickRowData"
        @refresh="refresh" 
        @clearSelectedRows="clearSelectedRows"
        @btnClick="btnClick"
        ref="qnnForm"
      />
    </div>

    <!-- 数据修改记录 -->  
    <el-dialog :destroy-on-close="true" :title="historyTitle" :visible.sync="dataHistoryModal" width="70%" center custom-class="dataHistoryModal">
        <QnnTable  
          :key="modalKey"
          :loadingsBtn="loadingsBtn"
          :actionBtns="[]"
          :tableFields="historyTableField"
          :fetchConfig="historyFetchConfig" 
          :data="curDataHistoryData" 
          @btnClick="btnClick"
          ref="historyRef"
        />  
    </el-dialog>

    <!-- 导入弹出 -->  
    <el-dialog title="数据导入" :destroy-on-close="true" :visible.sync="importModal"  width="600px" center custom-class="dialog">
      <QnnForm 
        :formFields="importFormField"
        :curClickBtn="{ formBtns:importFormBtns }"
        :loadingsBtn="loadingsBtn"  
        :btnsPosition="'bottom'"
        @refresh="refresh" 
        @clearSelectedRows="clearSelectedRows"
        @btnClick="btnClick"
      /> 
    </el-dialog>

    <!-- 审核弹出 -->  
    <el-dialog title="流程审批" :destroy-on-close="true" :visible.sync="auditModal"  width="600px" center custom-class="dialog">
      <QnnForm 
        :formFields="auditFormFields"
        :curClickBtn="{ formBtns:auditFormBtns }"
        :loadingsBtn="loadingsBtn"  
        :btnsPosition="'bottom'"
        @refresh="refresh" 
        @clearSelectedRows="clearSelectedRows"
        @btnClick="btnClick"
        ref="auditRef"
      /> 
    </el-dialog>


</div>
</template>

<script lang="ts"> 
import QnnForm from "./component/qnn-form.vue"
import QnnTable from "./component/qnn-table.vue"
import { BtnInfo, RowData, FormFieldConfig } from "./interface"
  
export default {
    components:{
      QnnForm,
      QnnTable
    },
    props: { 
      data:Array,
      actionBtns: Array,
      tableFields: Array,
      formFields: Array,
      fetchConfig: Object,
      rowKey:String,
      formatData: Function, 
      border:Boolean,
      isShowRowSelect:Boolean
    },
    data() {   
        const qnnFormFields:FormFieldConfig[] = (this as any).$cloneDeep(this.$props.formFields); 
        return {  
            // 表单中的字段（表单配置）
            qnnFormFields:qnnFormFields, 
            // 当前点击的按钮
            curClickBtn:{  
              label:"新增",
              type:"add", 
              btnStyle:"primary",
              icon:"el-icon-plus",
              formBtns:[ 
                {  
                  label:"新增",
                  type:"submit", 
                  fetchConfig:{}
                }
               ]
            },
            // 当前点击的行数据
            curClickRowData:{},
            // 表单是否禁用
            formDisabeld: false,

            /**
             * 当前视图: "table" | "form"
             */
            view: "form", 

            /**
             * 当前正在 loading 的按钮
            */
           loadingsBtn:[],

           // 查询条件是否展开
           searchIsExpend:false,

          // 数据弹出窗的 key
          // 因为几个历史都是使用的同一个 modal。所以需要加 key让modal刷新
          modalKey:"0", 

          // 数据历史记录弹出窗
          dataHistoryModal:false,
          historyTitle:'数据历史修改记录',
          // 当前查看历史记录的数据
          curDataHistory:{
              // id:"001",
              // name:"测试文件",
              // url:"xxx"
          }, 
          // 当前查看历史记录的文件的历史记录数据
          curDataHistoryData:[
              // { date:1234567897456, url:"http://baidu.com", userName:"张少" }
          ],
          // 请求历史记录的ajax配置 后期需要用这个替换 curDataHistoryData
          historyFetchConfig:{ 
          //   apiName:"xxx",
          //   otherParams:()=>{
          //     return {}
          //   }
          },
          // 数据历史记录表格字段配置
          historyTableField:[ 
              { field:"date", label:"修改时间" }, 
              { field:"field", label:"修改字段" }, 
              { field:"useName", label:"修改人" }, 
              { field:"before", label:"修改前值" }, 
              { field:"after", label:"修改后值" }, 
          ],

          // 导入
          importModal: false,
          importFormField:[],
          importFormBtns:[],

          // 审核弹出窗
          auditModal:false,
          auditFormFields:[  
              { field:"opinion", label:"审核意见", type:"textarea" },  
          ],
          auditFormBtns:[],
          // 历史审核数据
          auditHistoryModal:true,
          auditHistory: [
            
          ]
        }
    },
    mounted(){ 
      if(!this.$cloneDeep){
        console.error(`
        本插件需要提前在 vue 上绑定全局方法 $cloneDeep,
        请在 main.js 中添加如下代码
        const lodash = require('lodash');
        Vue.prototype.$cloneDeep = lodash.cloneDeep;
        `)
      }
      if(!this.$moment){
        console.error(`
        本插件需要提前在 vue 上绑定全局方法 $moment,
        请在 main.js 中添加如下代码
        const moment = require('moment');
        Vue.prototype.$moment = moment;
        `)
      }
      if(!this.$myFetch){
        console.error(`
        本插件需要提前在 vue 上绑定全局方法 $myFetch,
        请在 main.js 中添加如下代码
        const myFetch = ()=>{}// ... 自定义请求方法;
        Vue.prototype.$myFetch = myFetch;
        `)
      }
      if(!this.$myUpload){
        console.error(`
        本插件需要提前在 vue 上绑定全局方法 $myUpload,
        请在 main.js 中添加如下代码
        const myUpload = ()=>{}// ... 自定义上传文件方法;
        Vue.prototype.$myUpload = myUpload;
        `)
      }
      // this.refresh();
    },
    methods: {

        refresh(){
          this.$refs.qnnTable.refresh();
        },
        clearSelectedRows(){  
          this.$refs.qnnTable.clearSelectedRows();
        },  
 
        // 获取搜索字段
        getSearchField(searchIsExpend:boolean = false){ 
          return this.$cloneDeep(this.qnnFormFields)
            .filter((item:FormFieldConfig)=> item.isInSearch) 
            .map((item:FormFieldConfig, index:number)=> {
              if(!searchIsExpend &&  index > 2){
                  return {
                  ...item,
                  hide:true
                }
              }
              return {
                ...item, span:8
              }
            });
        },
      
        // 视图切换监听
        changeView(view: "table" | "form"): void {
            this.view = view;
            this.refresh();
        },

       
        // 操作按钮、单元格类的按钮、表单中的按钮 点击监听
       async btnClick(btnInfo:BtnInfo, index:number, rowData?:RowData) { 
          const { type, onClick, field, targetUrl } = btnInfo;
          this.curClickBtn = btnInfo;
          switch(type){
            case "add":
              this.formDisabeld = false;
              this.view = "form";
              break;
            case "del": 
              this.delFn(btnInfo);
              break;
            case "edit": 
              this.formDisabeld = false;
              this.curClickRowData = rowData;
              this.view = "form";
              break; 
            case "detail": 
              this.formDisabeld = true;
              this.curClickRowData = rowData;
              this.view = "form";
              break; 
            case "history":
              console.log('历史修改记录')
              this.fileHistory(rowData);
              break;  
            case "download": 
              if(targetUrl){
                window.location.href = targetUrl
              }
              break;  
            case "export":
              this.exportFn(btnInfo); 
              break;  
            case "import":
              this.importModal =  true;
              this.importFormField = btnInfo.formFields;
              this.importFormBtns = btnInfo.formBtns;
              console.log('btnInfo', btnInfo)
              break; 
            case "submit": 
              this.submitFn(btnInfo); 
              break; 
            case "cancel": 
              this.view = "table";
              break; 
            case "audit": 
              // 审核弹出窗
              this.auditModal = true;
              this.auditFormFields = [  
                  { field:"opinion", label:"审核意见", type:"textarea" },  
              ];
              this.auditFormBtns = btnInfo.formBtns; 
              break;  
            case "auditHistory":  
                console.log('审核记录')
                // 文件历史记录弹出窗
                this.historyTitle = '审核记录';
                // 当前查看历史记录的文件
                this.curDataHistory = rowData;
                this.historyTableField = [ 
                  { field:"date", label:"审核时间", formatter: "YYYY-MM-DD HH:mm:ss", },  
                  { field:"name", label:"审核人" }, 
                  { 
                    field:"action", 
                    label:"是否同意" 
                  }, 
                  { field:"opinion", label:"意见" }, 
                ] 
                // 当前查看历史记录的文件的历史记录数据
                this.curDataHistoryData = [ // --del
                  { name:"张三", opinion:"做工不行，需要重做...", action:"驳回", date:1234567891456 },
                  { name:"张三", opinion:"同意申请...", action:"同意", date:1234567891456 }, 
                ] 
                // this.historyFetchConfig = { apiName:'xxx', otherParams:{} }; 

                this.modalKey = new Date().getTime();
                setTimeout(()=>{
                  this.dataHistoryModal = true;  
                }, 10)
                break;  
            case "reject": 
            case "pass":  
              this.auditSubmit(type, btnInfo); 
              break;  
            case "copy": 
              this.view = "form";
              this.formDisabeld = false;
              this.curClickRowData = rowData;
              break; 
            case "custom":
              console.log('自定义')
              onClick && onClick();
              break;
          }

        },

        // 添加和删除正在loading的按钮
        addLoadingBtn(field:string){
          this.loadingsBtn = [...this.loadingsBtn, field]
        },
        removeLoadingBtn(field:string){
          this.loadingsBtn = [...this.loadingsBtn].filter(item=>item !== field);
        }, 

        // 数据历史记录
        // 表单中的文件也用这个弹出层
        fileHistory(rowData:RowData, isFile:boolean){
          if(!isFile){
              // 文件历史记录弹出窗 
              this.historyTitle = '数据历史修改记录';
              // 当前查看历史记录的文件
              this.curDataHistory = rowData;
              this.historyTableField = [ 
                  { field:"date", label:"修改时间", formatter: "YYYY-MM-DD HH:mm:ss" }, 
                  { field:"field", label:"修改字段" }, 
                  { field:"userName", label:"修改人" }, 
                  { field:"before", label:"修改前值" }, 
                  { field:"after", label:"修改后值" }, 
              ] 
              // 当前查看历史记录的文件的历史记录数据
              this.curDataHistoryData = [ // --del
                  { date:1234567897456, userName:"管理员", field:"name", before:"老王", after:"李四" }, 
                  { date:1234567897456, userName:"管理员", field:"name", before:"老王", after:"李四" }  
              ] 
              // this.historyFetchConfig = { apiName:'xxx', otherParams:{} }; 
          } else {
              // 文件历史记录弹出窗
              this.historyTitle = '文件历史修改记录';
              // 当前查看历史记录的文件
              this.curDataHistory = rowData;
              this.historyTableField = [ 
                { field:"date", label:"修改时间", formatter: "YYYY-MM-DD HH:mm:ss" },  
                { field:"userName", label:"修改人" }, 
                { field:"before", label:"修改前文件",  }, 
                { field:"after", label:"修改后文件" }, 
              ] 
              // 当前查看历史记录的文件的历史记录数据
              this.curDataHistoryData = [ // --del
                { date:1234567897456, before:"http://baidu.com", after:"http://biying.com",  userName:"张少" },
                { date:1234567897456, before:"http://baidu.com", after:"http://biying.com", userName:"张少" },
                { date:1234567897456, before:"http://baidu.com", after:"http://biying.com", userName:"张少" }, 
              ] 
              // this.historyFetchConfig = { apiName:'xxx', otherParams:{} }; 
          }
 
          this.modalKey = new Date().getTime();
          setTimeout(()=>{
            this.dataHistoryModal = true;  
          }, 10)
        },

        // 删除数据
        async delFn({ field }:BtnInfo){
          this.addLoadingBtn(field);
          console.log('删除数据：', this.$refs.qnnTable.getSelectedRows()) // getSelectedRowd
          const { success, message } = await this.$myFetch({
              apiName:"apiName",
                params:this.$refs.qnnTable.getSelectedRows(),
          });
          this.removeLoadingBtn(field);
          if(success){
            this.$message({  message: message, type: 'success'  });
            this.refresh(); 
          }else{
              this.$message({  message: message, type: 'warning'  }); 
          }  
        },

        // 提交数据
        async submitFn({ field, fetchConfig}:BtnInfo){ 
          const { apiName, otherParams } = (fetchConfig || {});
          const _otherParams = typeof otherParams === 'function' ? otherParams({ qnnForm:this }) : otherParams; 
          const values = await this.$refs.qnnForm.getValues(true);
          const body = {
            ..._otherParams,
            ...values
          }
          console.log('body:', body);
          if(!apiName) return;
          this.addLoadingBtn(field);  
          let { success, message } = await this.$myFetch({
              apiName:apiName,
              params:body
          });
          this.removeLoadingBtn(field);
          if(success){
              this.$message({  message: message, type: 'success'  });
              this.view = "table";
              this.refresh(); 
          }else{
              this.$message({  message: message, type: 'warning'  }); 
          }
        },

        // 导出数据
        async exportFn({ field, fetchConfig }:BtnInfo){ 
          //  console.log('export')
          this.addLoadingBtn(field);   
          const { data, success, message } = await this.$myFetch({
            apiName:fetchConfig.apiName,
            params:{
              selectedRows: this.$refs.qnnTable.getSelectedRows(),
              otherParams: fetchConfig.otherParams
            }, 
          });
          this.removeLoadingBtn(field);
          if(success){
            window.location.href = data;
            this.$message({  message: message, type: 'success'  });  
          }else{
              this.$message({  message: message, type: 'warning'  }); 
          }
        },
 
        // 提交通过
        async auditSubmit(action:"pass" | "reject", { field, fetchConfig}:BtnInfo){ 
          const { apiName, otherParams } = (fetchConfig || {});
          const _otherParams = typeof otherParams === 'function' ? otherParams({ qnnForm:this }) : otherParams; 
          const body = {
            action,
            ..._otherParams,
            ...this.$refs.auditRef.getValues()
          }
          console.log('body:', body);
          if(!apiName) return;
          this.addLoadingBtn(field);  
          let { success, message } = await this.$myFetch({
              apiName:apiName,
              params:body
          });
          this.removeLoadingBtn(field);
          if(success){
              this.$message({  message: message, type: 'success'  });
              this.view = "table";
              this.refresh(); 
          }else{
              this.$message({  message: message, type: 'warning'  }); 
          }
        },

    } 
}
</script>

<style lang="less">
// 全局样式，局部样式无法更改一些饿了么ui的属性
.qnnCurd .table-header-th {
    background-color: rgba(184, 187, 190, 0.103);
}
.qnn-form .el-input__inner{
    text-align: left;
}
.msg-loading{
  color: #409eff;
}
.msg-loading-text{ 
  color: #409eff;
  margin-left: 6px;
}
</style>
<style lang="less" scoped src="./style/index.less"></style>
