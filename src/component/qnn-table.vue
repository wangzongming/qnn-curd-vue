<template>
    <div class="qnn-table">
         <!-- 检索表单视图 -->
        <div v-if="qnnTableSearchFields && qnnTableSearchFields.length" class="search-container"> 
          <QnnForm 
            :formFields="qnnTableSearchFields"
            :curClickBtn="{}"
            :loadingsBtn="$props.loadingsBtn"
            @refresh="refresh" 
            @clearSelectedRows="clearSelectedRows"
            @btnClick="btnClick"
            ref="searchRef"
          /> 
          <div class="query">
            <el-button type="default" icon="el-icon-refresh-right" :size="'small'" @click="searchReset">重置</el-button>
            <el-button type="primary" icon="el-icon-search"  :size="'small'" @click="refresh">查询</el-button>
            <el-button v-if="qnnTableSearchFields.length > 3" type="text" :size="'mini'" style="margin-left:0px" @click="expendSearch" :icon="searchIsExpend ? 'el-icon-arrow-up' : 'el-icon-arrow-down'">更多</el-button>
          </div> 
        </div>  

        <!-- 操作按钮 -->
        <el-row style="paddingBottom:12px" v-if="qnnTableActionBtns && qnnTableActionBtns.length"> 
            <el-button v-for=" (btnConfig, index) in qnnTableActionBtns" 
              :key="index" 
              :loading="$props.loadingsBtn.includes(btnConfig.field)" 
              :type="btnConfig.btnStyle || 'primary'" 
              :icon="btnConfig.icon" 
              :size="'medium'"
              @click="btnClick(btnConfig, index)"
            >{{btnConfig.label}}</el-button> 
        </el-row>

        <el-table header-row-class-name="table-header" header-cell-class-name="table-header-th"
          class="ele-table" 
            v-loading="loading"
          :border="qnnTableBorder === false ? false : true"
          :row-key="rowKey" :data="tableData"
          :stripe="true"
          @selection-change="selectedRowsChange" 
          @sort-change="tableSortChange"
        >
            <el-table-column 
                type="selection" 
                align="center" width="42"
                v-if="$props.isShowRowSelect"
            ></el-table-column>

            <el-table-column v-for="(colConfig, index) in qnnTableFields" 
              :key="index" 
              :width="colConfig.width"
              :prop="colConfig.field"
              :label="colConfig.label"
              :min-width="colConfig.minWidth"
              :fixed="colConfig.fixed"
              :sortable="colConfig.sortable"
              :formatter="((typeof colConfig.formatter) === 'string') ? (data)=>$moment(data[colConfig.field]).format(colConfig.formatter) : colConfig.formatter"
              :show-overflow-tooltip="colConfig.showOverflowTooltip"
              :render-header="colConfig.renderHeader"
              :column-key="colConfig.columnKey"
              :type="colConfig.field === '_selection' ? 'selection' : colConfig.type"
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
               <template slot-scope="scope">
                <span v-if="colConfig.field === '_action'">
                    <span v-for="(btnConfig, index) in colConfig.btns" :key="index" class="btn-item">
                        <el-dropdown
                            size="small" 
                            v-if="btnConfig.btns && btnConfig.btns.length"
                        >
                            <span class="t-blue" style="font-size:12px">
                                {{btnConfig.label}}<i class="el-icon-arrow-down el-icon--right"></i>
                            </span>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item v-for="(childBtn, ci) in btnConfig.btns"
                                    :key="ci"
                                    :disabled="childBtn.disabled"
                                    :icon="childBtn.icon"  
                                    class="t-blue"
                                   
                                > 
                                     <el-button  
                                        type="text" 
                                        size="small"   
                                        :disabled="childBtn.disabled" 
                                        @click="btnClick(childBtn, index, scope.row)"
                                        >{{childBtn.label}}</el-button>
                                </el-dropdown-item> 
                            </el-dropdown-menu>
                        </el-dropdown>
                        <el-button 
                            v-else
                            type="text" 
                            size="small"  
                            :disabled="btnConfig.disabled"
                            :icon="btnConfig.icon" 
                            @click="btnClick(btnConfig, index, scope.row)"
                            >{{btnConfig.label}}</el-button>
                    </span> 
                 </span> 
                <span v-else> 
                    <!-- 有的数据需要 formatter -->
                    {{
                        !colConfig.formatter ? 
                        scope.row[colConfig.field] : 
                        ((typeof colConfig.formatter) === 'string') ? 
                        $moment(scope.row[colConfig.field]).format(colConfig.formatter) :
                        colConfig.formatter(scope.row)
                    }} 
                </span> 
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
</template>
<script lang="ts">
import QnnForm from './qnn-form.vue'
import { BtnInfo, RowData, FormFieldConfig, TableFieldConfig } from "../interface"

interface QnnFormOption {
    props: any,
    components:{
        QnnForm:any
    },
    data():{ },
    methods:{ },
    mounted():void
}

const option:QnnFormOption = {
    props: { 
      data:Array,
      actionBtns: Array,
      tableFields: Array, 
      fetchConfig: Object,
      loadingsBtn:Array,
      rowKey:String,
      formatData: Function, 
      border:Boolean, 
      isShowRowSelect:Boolean
    },
    components:{
        QnnForm
    },
    data(){
        const qnnTableActionBtns:TableFieldConfig[] = (this as any).$cloneDeep(this.$props.actionBtns);
 
        return {
            loading:false,

            // 主键
            qnnTableRowKey: this.$props.rowKey, 

            // 表格数据
            tableData:this.$props.data,

            // 顶部操作按钮
            qnnTableActionBtns:qnnTableActionBtns,

            // 表格中的字段（列配置）
            qnnTableFields: this.$props.tableFields,

            // 表格是否有边框
            qnnTableBorder:this.$props.border,

            // 表格搜索条件
            qnnTableSearchFields:this.$parent.getSearchField?.(),
 
            // 当前排序的字段
            sortField:"",
            // 当前排序的规则
            sortOrder:"",

            // 分页信息
            totalNumber: this.$props.data?.length || 0,
            currentPage: 1,
            pageSize:10,

            /**
             * 当前选中的数据 RowData[]
            */
            selectedRows: [],

            // 查询条件是否展开
           searchIsExpend:false,
        }
    },
    mounted(){
        this.refresh();
    },
    methods:{ 
        async refresh(params:any = {}){
          const { fetchConfig={}, formatData } =  this.$props;
          const { apiName, otherParams } = fetchConfig as FormFieldConfig["fetchConfig"];  
          const _otherParams = typeof otherParams === 'function' ? otherParams({ qnnForm:this }) : otherParams; 
 
          const body = {
            ...params,
            ...this.$refs?.searchRef?.getValues?.(),
            limit: this.pageSize,
            page: this.currentPage,
            sortField:this.sortField,
            sortOrder:this.sortOrder, // ascending 升序 | descending 降序
            ..._otherParams
          };
          console.log('请求数据：', body)
          if(!apiName)return;

          // const _this = this; 
            // _this.loading = true;
            // const { data, success, message } = await this.$myFetch({
            //     apiName:"apiName",
            //     params:body, 
            // });
            //  _this.loading = false;
            // if(success){
            //         _this.tableData = formatData ? formatData(data) : data;
            //         _this.totalNumber = totalNumber;
            // }else{
            //     _this.$message({  message: message, type: 'warning'  }); 
            // }
 
        },

        // 顶部搜索表单重置
        searchReset(){
          this.$refs?.searchRef?.resetValues?.()
        },

        // 搜索表单中的展开按钮点击
        expendSearch(){
          this.searchIsExpend = !this.searchIsExpend;
          this.searchFields = this.$parent.getSearchField(this.searchIsExpend);  
          console.log(this.$cloneDeep(this.searchFields)[3])
          this.$refs.searchRef.updateFormFields(this.$cloneDeep(this.searchFields))
        },

        // 选择数据监听
        selectedRowsChange(selectedRows: RowData[]) {
            this.selectedRows = selectedRows; 
        },
        clearSelectedRows(){ this.selectedRows = [] },
        getSelectedRows(){
            return this.selectedRows
        },

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

        btnClick(btnInfo:BtnInfo, index:number, rowData?:RowData){
            this.$emit('btnClick', btnInfo, index, rowData)
        }
    }
}
export default option;
</script>
<style lang="less" scoped src="../style/qnn-table.less">

</style>
