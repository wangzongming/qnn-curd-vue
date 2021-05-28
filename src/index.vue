<template>
<div class="qnnCurd">
    <div v-if="view === 'table'">
        <!-- <el-form label-width="100px" :model="formInline" class="demo-form-inline">
            <el-form-item label="审批人">
                <el-input v-model="formInline.user" placeholder="请输入..." style="width:100%"></el-input>
            </el-form-item>
            <el-form-item label="活动主题">
                <el-input v-model="formInline.zhuti" placeholder="请输入..." style="width:100%"></el-input>
            </el-form-item>
            <el-form-item label="活动区域">
                <el-select v-model="formInline.region" placeholder="请选择..." style="width:100%">
                    <el-option label="区域一" value="shanghai"></el-option>
                    <el-option label="区域二" value="beijing"></el-option>
                </el-select>
            </el-form-item>
            <div v-if="searchIsExpend">
                <el-form-item label="兴趣">
                    <el-select v-model="formInline.region" placeholder="请选择..." style="width:100%">
                        <el-option label="吃饭" value="shanghai"></el-option>
                        <el-option label="睡觉" value="beijing"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="小组规模">
                    <el-select v-model="formInline.region" placeholder="请选择..." style="width:100%">
                        <el-option label="规模一" value="shanghai"></el-option>
                        <el-option label="规模二" value="beijing"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="小组人数">
                    <el-select v-model="formInline.region" placeholder="请选择..." style="width:100%">
                        <el-option label="大于100" value="shanghai"></el-option>
                        <el-option label="大于1000" value="beijing"></el-option>
                    </el-select>
                </el-form-item>
            </div>
            <el-form-item class="query">
                <el-button type="default" icon="el-icon-refresh-right">重置</el-button>
                <el-button type="primary" icon="el-icon-search">查询</el-button>
                <el-button type="text" @click="searchIsExpend = !searchIsExpend" :icon="searchIsExpend ? 'el-icon-arrow-up' : 'el-icon-arrow-down'">更多</el-button>

            </el-form-item>
        </el-form> -->

        <!-- 操作按钮 -->
        <el-row style="paddingBottom:12px" v-if="actionBtns && actionBtns.length"> 
            <el-button v-for=" (btnConfig, index) in actionBtns" 
              :key="index" 
              :type="btnConfig.btnStyle" 
              :icon="btnConfig.icon" 
              @click="btnClick(btnConfig, index)"
            >{{btnConfig.label}}</el-button> 
        </el-row>

        <!-- 表格视图 -->
        <el-table header-row-class-name="table-header" header-cell-class-name="table-header-th"
          class="ele-table" border 
          :row-key="rowKey" :data="tableData"
          :stripe="true"
          @selection-change="selectedRowsChange" 
          @sort-change="tableSortChange"
        >
            <el-table-column v-for="(colConfig, index) in tableFields" 
              :key="index" 
              :width="colConfig.width"
              :prop="colConfig.field"
              :label="colConfig.label"
              :min-width="colConfig.minWidth"
              :fixed="colConfig.fixed"
              :sortable="colConfig.sortable"
              :formatter=" typeof colConfig.formatter === 'string' ? (data)=>$moment(data[colConfig.field]).format(colConfig.formatter) : colConfig.formatter"
              :show-overflow-tooltip="colConfig.showOverflowTooltip"
              :render-header="colConfig.renderHeader"
              :column-key="colConfig.columnKey"
              :type="colConfig.type"
              :index="colConfig.index"
              :align="colConfig.align"
              :resizable="colConfig.resizable"
              :sort-by="colConfig.sortBy"
              :sort-orders="colConfig.sortOrders"
              :sort-method="colConfig.sortMethod"
              :header-align="colConfig.headerAlign"
              :class-name="colConfig.className"
              :label-class-name="colConfig.labelClassName"
              :selectable="colConfig.selectable"
              :reserve-selection="colConfig.reserveSelection"
              :filters="colConfig.filters"
              :filter-placement="colConfig.filterPlacement"
              :filter-multiple="colConfig.filterMultiple"
              :filter-method="colConfig.filterMethod"
              :filtered-value="colConfig.filteredValue"
            >
             <template v-if="colConfig.field === '_action'">
                <el-button v-for="(btnConfig, index) in colConfig.btns" 
                 type="text" 
                 size="small" 
                 :key="index"
                 :disabled="btnConfig.disabled"
                 :icon="btnConfig.icon" 
                 @click="btnClick(btnConfig, index)"
                >{{btnConfig.label}}</el-button> 
              </template>
            </el-table-column> 
        </el-table>

        <!-- 分页视图 -->
        <div class="pagination">
            <el-pagination 
              :current-page="currentPage" 
              :page-size="pageSize" 
              :total="totalNumber"
              @size-change="handleSizeChange" 
              @current-change="handleCurrentChange" 
              layout="total, sizes, prev, pager, next, jumper"
              ></el-pagination>
        </div>
    </div>
</div>
</template>

<script lang="ts"> 
type RowData = {
    [field: string]: any 
};
type Obj = {
    [field: string]: any 
};
type Arg = {
    [field: string]: any 
};

type FetchConfig = {
  apiName:string;
  otherParams:Obj | ((arg:Arg)=>Obj);
}

type BtnInfo = {
  field?:string,
  label:string,
  disabled?:boolean,
  icon?:string,
  size?:"medium" | "small" | "mini",
  // 按钮风格
  btnStyle?: "primary" | "success" | "warning" | "danger" | "info" | "text",
  /**
   * history 弹出一个列表，用于查询历史数据等
   * custom  自定义点击事件，需要在 onClick 事件中自定义逻辑
   * download 点击后下载文件，待定...
   * export 导出数据，待定...
   * import 导入，待定...
  */
  type:"add" | "del" | "edit" | "history"  | "download" | "import" | "export" | "custom", 
  formBtns?:BtnInfo[],
  fetchConfig?:FetchConfig,
  onClick?:(arg?:Arg)=>void
}

export default {
    props: {
      aaa: String
    },
    data() { 
        const mockData = new Array(5).fill(1).map((_, i) => {
            return {
                name: `姓名-${i}`,
                age: i,
                sex: `男`,
                hob: `写代码，写代码，还是写代码...`,
                work: `写代码`,
                yihun: `否`,
                sr: 1234567891234
            }
        });

        return {
            rowKey: "id",

            // 顶部操作按钮
            actionBtns:[
              {  
                label:"新增",
                type:"add", 
                btnStyle:"primary",
                icon:"el-icon-plus",
                formBtns:[
                  {  
                    label:"取消",
                    type:"cancel", 
                  },
                  {  
                    label:"提交",
                    type:"submit",
                    fetchConfig:{
                      apiName:"xxx"
                    } 
                  }
                ]
              },
              {  
                label:"删除",
                type:"del", 
                btnStyle:"danger",
                icon:"el-icon-delete",
                fetchConfig:{
                  apiName:"xxx"
                } 
              }
            ],

            // 表格中的字段（列配置）
            tableFields: [{
                    field: "name",
                    label: "姓名",
                    sortable:"custom"
                },
                {
                    field: "age",
                    label: "年纪",
                },
                {
                    field: "sex",
                    label: "性别",
                },
                {
                    field: "hob",
                    label: "爱好",
                    width:100,
                    showOverflowTooltip:true
                },
                {
                    field: "工作",
                    label: "work",
                },
                {
                    field: "是否已婚",
                    label: "yihun",
                },
                {
                    field: "sr",
                    label: "生日",
                    width:180,
                    // moment格式可直接使用，其他类型写函数处理
                    formatter:"YYYY-MM-DD HH:mm:ss", 
                    // formatter({ sr }:any){ 
                    //   return _this.$moment(sr).format("YYYY-MM-DD")
                    // }
                },
                {
                    field: "_action",
                    label: "操作",
                    width:160,
                    align:"center",
                    btns:[
                      {  
                        label:"自定义",
                        type:"custom", 
                        onClick:()=>console.log('自定义')
                      },
                      {  
                        label:"修改记录",
                        type:"history", 
                        formBtns:[
                          {  
                            label:"关闭",
                            type:"cancel", 
                          } 
                        ]
                      },
                      {  
                        label:"编辑",
                        type:"edit", 
                        formBtns:[
                          {  
                            label:"取消",
                            type:"cancel", 
                          },
                          {  
                            label:"提交",
                            type:"submit",
                            fetchConfig:{
                              apiName:"xxx"
                            } 
                          }
                        ]
                      }
                    ]
                }
            ],

            // 表单中的字段（表单配置）
            formFields: [{
                field: "name",
                label: "姓名211211222211",
            }],

            /**
             * 当前视图: "table" | "form"
             */
            view: "table",

            // tableData:[],
            tableData: mockData,

            // 当前检索的表单数据
            searchFormValues:{},

            // 当前排序的字段
            sortField:"",
            // 当前排序的规则
            sortOrder:"",

            // 分页信息
            totalNumber: mockData?.length || 0,
            currentPage: 1,
            pageSize:10,

            /**
             * 当前选中的数据 RowData[]
             */
            selectedRows: []
        }
    },
    mounted(){ 
      this.refresh();
    },
    methods: {
        refresh(params:any = {}){
          // console.log(this.$props.aaa)
          const body = {
            ...params,
            ...this.searchFormValues,
            limit: this.pageSize,
            page: this.currentPage,
            sortField:this.sortField,
            sortOrder:this.sortOrder, // ascending 升序 | descending 降序
          };
          console.log('请求数据：', body)

        },

        // 视图切换监听
        changeView(view: "table" | "form"): void {
            this.view = view;
            this.refresh();
        },

        // 选择数据监听
        selectedRowsChange(selectedRows: RowData[]) {
            this.selectedRows = selectedRows;
        },
        clearSelectedRows(){ this.selectedRows = [] },

        // 排序切换
        tableSortChange(arg:any) {
            this.sortField = arg.prop;
            this.sortOrder = arg.order; 
            this.refresh();
        }, 

        // 表格每页数量切换监听
        handleSizeChange(val:number) { 
          this.pageSize = val;
          this.refresh();
        },

        // 表格页码切换监听
        // 页面切换后清除选择的数据，防止出现别的需求bug
        handleCurrentChange(val:number) { 
          this.currentPage = val;
          this.clearSelectedRows();
          this.refresh();
        },

        // 操作按钮、单元格类的按钮、表单中的按钮 点击监听
        btnClick(btnInfo:BtnInfo, index:number) { 
          const { type, onClick } = btnInfo;
          switch(type){
            case "add":
              console.log('新增')
              break;
            case "del":
              console.log('删除')
              break;
            case "edit":
              console.log('修改')
              break;
            case "history":
              console.log('历史修改记录')
              break;  
            case "download":
              console.log('download')
              break;  
            case "export":
              console.log('export')
              break;  
            case "import":
              console.log('import')
              break; 
            case "custom":
              console.log('自定义')
              onClick && onClick();
              break;
          }

        }
    } 
}
</script>

<style lang="less">
// 全局样式，局部样式无法更改一些饿了么ui的属性
.qnnCurd .table-header-th {
    background-color: rgba(184, 187, 190, 0.103);
}
</style>
<style lang="less" scoped src="./style/index.less"></style>
