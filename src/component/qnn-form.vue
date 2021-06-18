<template>
    <div class="qnn-form">
        <!-- 按钮-顶部 -->
        <div class="btns top-btns" v-if="qnnFormBtns && qnnFormBtns.length && $props.btnsPosition !== 'bottom'">
           <div style="left">
                <el-button v-for="(btnConfig, index) in qnnFormBtns" 
                :key="index" 
                :loading="$props.loadingsBtn && Array.isArray($props.loadingsBtn) && $props.loadingsBtn.includes(btnConfig.field)" 
                :type="btnConfig.btnStyle || 'primary'" 
                :icon="btnConfig.icon || (btnConfig.type === 'submit' ? 'el-icon-check' : '')" 
                :size="'small'"
                @click="$emit('btnClick', btnConfig, index)"
                >{{btnConfig.label}}</el-button> 
           </div>
           <div class="right" v-if="$props.noFiles !== true">
               <el-button-group>
                <el-button type="primary" icon="el-icon-document" :plain="view === 'files'" size="small" @click="toFormView">表单录入</el-button>
                <el-button type="primary" icon="el-icon-paperclip" :plain="view === 'form'" size="small" @click="toFilesView">附件清单</el-button>
               </el-button-group>
           </div>
        </div>  
        <!-- 表单-->
        <el-form
          :model="values" 
          :disabled="disabled"  
          v-show="view === 'form'"
          ref="qnnForm"
          label-width="100px"
          class="qnn-form-ele-form" 
        >
            <div class="qnn-form-content">
                <el-row :gutter="0" >
                    <el-col 
                        :span="fieldConfig.span || 24" 
                        :key="index" 
                        v-for=" (fieldConfig, index) in qnnFormFields" 
                        :style="fieldConfig.hide?'display:none':''"
                    >
                        <el-form-item  
                            :prop="fieldConfig['field']"
                            :label="fieldConfig['label']" 
                            :label-width="fieldConfig['labelWidth']"
                            :required="fieldConfig['required']"
                            :size="fieldConfig['size']"
                            :rules="getRules(fieldConfig)"
                        >
                            <el-input-number 
                                v-if="
                                    fieldConfig['type'] === 'number' ||
                                    fieldConfig['type'] === 'float' ||
                                    fieldConfig['type'] === 'integer'
                                "
                                v-model="values[fieldConfig['field']]" 
                                :placeholder="getPlaceholder(fieldConfig)"
                                :min="fieldConfig['min']" 
                                :max="fieldConfig['min']"
                                :size="fieldConfig['size'] || 'small'"
                                @change="fieldConfig['change'] || function(){}"
                                @blur="fieldConfig['blur'] || function(){}"
                                @focus="fieldConfig['focus'] || function(){}"
                                @clear="fieldConfig['clear'] || function(){}"
                                controls-position="right"  
                                style="width:100%;text-align:left"
                                
                            >
                            </el-input-number>
                        
                            <el-input 
                                v-if="
                                    fieldConfig['type'] === 'string' || 
                                    fieldConfig['type'] === 'phone' || 
                                    fieldConfig['type'] === 'email' || 
                                    fieldConfig['type'] === 'identity' || 
                                    fieldConfig['type'] === 'postalCode' || 
                                    fieldConfig['type'] === 'specialPlane' || 
                                    fieldConfig['type'] === 'url' || 
                                    fieldConfig['type'] === 'any' 
                                "
                                v-model="values[fieldConfig['field']]"
                                :placeholder="getPlaceholder(fieldConfig)" 
                                :size="fieldConfig['size'] || 'small'"
                                @change="fieldConfig['change'] || function(){}"
                                @blur="fieldConfig['blur'] || function(){}"
                                @focus="fieldConfig['focus'] || function(){}"
                                @clear="fieldConfig['clear'] || function(){}"
                            ></el-input>

                            <el-autocomplete 
                                v-if="fieldConfig['type'] === 'autoComplete'"
                                v-model="values[fieldConfig['field']]"
                                :placeholder="getPlaceholder(fieldConfig)" 
                                :size="fieldConfig['size'] || 'small'"
                                :trigger-on-focus="false"
                                :fetch-suggestions="(queryString, cb)=>querySearch(fieldConfig, queryString, cb)"
                                @change="fieldConfig['change'] || function(){}"
                                @blur="fieldConfig['blur'] || function(){}"
                                @focus="fieldConfig['focus'] || function(){}"
                                @clear="fieldConfig['clear'] || function(){}" 
                                style="width:100%"
                            ></el-autocomplete>

                            <el-input 
                                v-if="fieldConfig['type'] === 'textarea'"
                                type="textarea"
                                v-model="values[fieldConfig['field']]"
                                :placeholder="getPlaceholder(fieldConfig)" 
                                :autosize="values[fieldConfig['autosize']] || { minRows: 3, maxRows: 12}"
                                @change="fieldConfig['change']|| function(){}"
                                @blur="fieldConfig['blur'] || function(){}"
                                @focus="fieldConfig['focus'] || function(){}"
                                @clear="fieldConfig['clear'] || function(){}"
                            ></el-input>
                            
                            <!-- | "date" | "year" | "month" | "dates" | "week" | "datetime" |
                            "datetimerange" | "daterange" | "monthrange" | "datetime" | -->
                            <el-date-picker 
                                v-if="fieldConfig['type'] === 'date' || 
                                        fieldConfig['type'] === 'year' ||
                                        fieldConfig['type'] === 'month' ||
                                        fieldConfig['type'] === 'dates' ||
                                        fieldConfig['type'] === 'week' ||
                                        fieldConfig['type'] === 'datetime' ||
                                        fieldConfig['type'] === 'datetimerange' ||
                                        fieldConfig['type'] === 'daterange' ||
                                        fieldConfig['type'] === 'monthrange' ||
                                        fieldConfig['type'] === 'datetime'" 
                                v-model="values[fieldConfig['field']]"
                                :type="fieldConfig['type']"
                                :placeholder="getPlaceholder(fieldConfig)"  
                                :start-placeholder="'开始日期'"
                                :end-placeholder="'结束日期'"
                                :size="fieldConfig['size'] || 'small'"
                                @change="fieldConfig['change']|| function(){}"
                                @blur="fieldConfig['blur'] || function(){}"
                                @focus="fieldConfig['focus'] || function(){}" 
                                style="width:100%"
                            ></el-date-picker>
    
                            <el-radio-group  
                                v-if="fieldConfig['type'] === 'radio'" 
                                v-model="values[fieldConfig['field']]"
                                @change="fieldConfig['change']|| function(){}" 
                            >
                                <el-radio v-for="(option, index) in (fieldConfig['optionData'] || optionDatas[fieldConfig['field']])"
                                    :key="index"
                                    :label="option[fieldConfig['optionConfig'] && fieldConfig['optionConfig'].value ? fieldConfig['optionConfig'].value : 'value']"
                                >{{option[fieldConfig['optionConfig'] && fieldConfig['optionConfig'].label ? fieldConfig['optionConfig'].label : 'label']}}</el-radio> 
                            </el-radio-group>
                            
                            <el-checkbox-group  
                                v-if="fieldConfig['type'] === 'checkbox'" 
                                v-model="values[fieldConfig['field']]"
                                @change="fieldConfig['change']|| function(){}" 
                            >
                                <el-checkbox v-for="(option, index) in (fieldConfig['optionData'] || optionDatas[fieldConfig['field']])"
                                    :key="index"
                                    :label="option[fieldConfig['optionConfig'] && fieldConfig['optionConfig'].value ? fieldConfig['optionConfig'].value : 'value']"
                                >
                                {{option[fieldConfig['optionConfig'] && fieldConfig['optionConfig'].label ? fieldConfig['optionConfig'].label : 'label']}}
                                </el-checkbox> 
                            </el-checkbox-group>

                            <el-select 
                                v-if="fieldConfig['type'] === 'select'" 
                                v-model="values[fieldConfig['field']]" 
                                :placeholder="getPlaceholder(fieldConfig)" 
                                :size="fieldConfig['size'] || 'small'"
                                filterable clearable
                                style="width:100%"
                            >
                                <el-option
                                v-for="(option, index) in (fieldConfig['optionData'] || optionDatas[fieldConfig['field']])"
                                :key="index"
                                :label="option[fieldConfig['optionConfig'] && fieldConfig['optionConfig'].label ? fieldConfig['optionConfig'].label : 'label']"
                                :value=" option[fieldConfig['optionConfig'] && fieldConfig['optionConfig'].value ? fieldConfig['optionConfig'].value : 'value']">
                                </el-option>
                            </el-select> 

                            <el-cascader 
                                v-if="fieldConfig['type'] === 'cascader'" 
                                v-model="values[fieldConfig['field']]" 
                                :placeholder="getPlaceholder(fieldConfig)" 
                                :options="(fieldConfig['optionData'] || optionDatas[fieldConfig['field']])"
                                :size="fieldConfig['size'] || 'small'"
                                clearable
                                style="width:100%"
                            > 
                            </el-cascader> 

                            <el-upload
                                v-if="fieldConfig['type'] === 'files'" 
                                v-model="values[fieldConfig['field']]"   
                                :action="fieldConfig['fetchConfig'] ? fieldConfig['fetchConfig'].apiName : ''"
                                :on-preview="function(e){ filePreview(fieldConfig, e) }"
                                :on-remove="function(e){ fileRemove(fieldConfig, e) }"  
                                :http-request="function(e){ fileUpload(fieldConfig, e) }"
                                :limit="fieldConfig['limit']"
                                :on-exceed="function(e){ fileExceed(fieldConfig, e) }"
                                :file-list="values[fieldConfig['field']]"
                                :accept="fieldConfig['accept']" 
                                :drag="fieldConfig['drag']" 
                                class="qnn-form-upload"
                                >
                                    <el-button v-if="!fieldConfig['drag']" size="small" type="primary" class="el-icon-upload2"> 点击上传</el-button> 
                                    <div v-else>
                                        <i class="el-icon-upload"></i>
                                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div> 
                                    </div>
                                    <div slot="file" slot-scope="{file}"> 
                                        <div class="qnn-form-upload-item">
                                            <div class="left">
                                                <a class="el-upload-list__item-name" @click="filePreview(fieldConfig, file)">
                                                    <i class="el-icon-document"></i>{{file.fileName}}
                                                </a>
                                            </div>
                                            <div class="right">
                                                <!-- <i title="历史修改记录" class="historyBtn el-icon-timer" @click="fileHistory(fieldConfig, file)"></i>  -->
                                                <i title="删除" class="delBtn el-icon-delete" @click="fileRemove(fieldConfig, file)"></i> 
                                            </div>
                                        </div>
                                    </div>
                            </el-upload>
                        </el-form-item>
                    </el-col> 
                </el-row> 
            </div>
        </el-form> 
        <div v-show="view === 'files'">  
            <slot name="attachmentsList"></slot> 
            <!-- <MyQnnTable 
                :data="qAttachmentsList.data" 
                :actionBtns="qAttachmentsList.actionBtns" 
                :tableFields="qAttachmentsList.tableFields" 
                :formFields="qAttachmentsList.formFields"
                :rowKey="qAttachmentsList.rowKey"
                :isShowRowSelect="qAttachmentsList.isShowRowSelect"
                :noFiles="true"  
            /> -->
        </div>
         <!-- 按钮-底部 -->
        <div class="btns" v-if="qnnFormBtns && qnnFormBtns.length &&  $props.btnsPosition === 'bottom'">
            <el-button v-for="(btnConfig, index) in qnnFormBtns" 
              :key="index" 
              :loading="$props.loadingsBtn && Array.isArray($props.loadingsBtn) && $props.loadingsBtn.includes(btnConfig.field)" 
              :type="btnConfig.btnStyle || 'primary'" 
              :icon="btnConfig.icon || (btnConfig.type === 'submit' ? 'el-icon-check' : '')" 
              :size="'small'"
              @click="$emit('btnClick', btnConfig, index)"
            >{{btnConfig.label}}</el-button> 
        </div> 
    </div>
</template>
<script lang="ts">  
import QnnTable from './qnn-table.vue'
import { BtnInfo, FetchConfig, FormFieldConfig, Obj } from "../interface"  
export default { 
    components:{
        // MyQnnTable:QnnTable
    },
    props:{
        formFields:Array,
        curClickBtn:Object,
        // refresh:Function,
        clearSelectedRows:Array,
        loadingsBtn:Array,
        disabeld:Boolean,
        curClickRowData:Object,
        btnsPosition:String,
        noFiles:Boolean,
        attachmentsList:Object
    },
    mounted(){
        // 请求下拉数据 
        this.getSelectOptionData();
    },
    data(){
        const fields:FormFieldConfig[] = (this as any).$cloneDeep([...this.$props.formFields]);
        const btns:BtnInfo[] = (this as any).$cloneDeep([...(this.$props.curClickBtn?.formBtns || [])]);
        const values:Obj = (this as any).$cloneDeep(this.$props.curClickRowData )|| {};
        // console.log('fields:', values)
        // 表单值... ing
        fields.forEach(({ type, field, initialValue }) => { 
            if(type === "checkbox" || type === "files"){
                // 值需要为数组，不然会报错
                values[field] = values[field] || initialValue || [];
            }
        }); 
        return {
            qnnFormFields: fields,
            qnnFormBtns: btns,
            disabled:this.$props.disabeld,
            values:values,  
            /**
             * 所有下拉字段的下拉数据，进入页面时候会请求
             * { [field]:any[] }  
            **/ 
            optionDatas:{}, 
            
            // 附件清单配置
            qAttachmentsList:this.$props.attachmentsList || {},

            // 当前视图 form | files
            view:"form"
        }
    },
    methods:{
        getPlaceholder(fieldConfig:FormFieldConfig){
            const { type } = fieldConfig;
            switch(type){ 
                case "select":
                case "cascader":
                    return "请选择...";   
                case "daterange":
                    return "";   
                default:
                    return "请输入...";
            }
        },
        getRules(fieldConfig:FormFieldConfig){
            const { type, required, label } = fieldConfig;
            const rules:any[] = [];
            if(required){
                rules.push({ required: true, message: label + '不能为空'})
            } 
            switch(type){ 
                case "string":  
                case "email":    
                case "integer":    
                case "float":    
                case "url":     
                    rules.push({  
                        type:type, 
                        message:{
                            "string":"请输入字符串！",
                            "email":"请输入正确的邮箱！",
                            "integer":"请输入整数！",
                            "float":"请输入小数！",
                            "url":"请输入正确的网址！", 
                        }[type]
                    })
                    break; 
                case "phone":  
                    rules.push({  
                        validator: (rule:any, value:any, callback:any)=>{
                            const reg = new RegExp(/^1(?:3\d|4[4-9]|5[0-35-9]|6[67]|7[013-8]|8\d|9\d)\d{8}$/);
                            if (value && !reg.test(value)) {
                                callback(new Error('请输入正确的手机号码！'));
                            }
                            callback();
                        }
                    })
                    break; 
                case "postalCode":  
                    rules.push({  
                        validator: (rule:any, value:any, callback:any)=>{
                            const reg = new RegExp(/^[0-9][0-9]{3,5}$/);
                            if (value && !reg.test(value)) {
                                callback(new Error('请输入正确的邮编号码！'));
                            }
                            callback();
                        }
                    })
                break;
                case "specialPlane":  
                    rules.push({  
                        validator: (rule:any, value:any, callback:any)=>{
                            const reg = new RegExp(/^0\d{2,3}-\d{7,8}$/);
                            if (value && !reg.test(value)) {
                                callback(new Error('请输入正确的座机号码！'));
                            }
                            callback();
                        }
                    })
                break; 
                case "identity":  
                    rules.push({  
                        validator: (rule:any, value:any, callback:any)=>{
                            const reg = new RegExp(/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/);
                            if (value && !reg.test(value)) {
                                callback(new Error('请输入正确的身份证号码！'));
                            }
                            callback();
                        }
                    })
                break;  
                default: 
                break;
            } 
            return rules;
        },

        // 根据 field 设置属性，如： optionData
        setFieldConfigByField(field:string, attr:Obj){
            this.qnnFormFields = [...this.qnnFormFields].map(item=>{
                if(item.field === field){ 
                    return {...item, ...attr}
                }
                return item
            })
        },
        
        /**
         * 文件上传、预览、删除、超出最大限制、历史记录的钩子
        */
        async fileUpload(fieldConfig:FormFieldConfig, e:any){ 
            const _this = this;
            const { data, success, message } = await this.$myUpload({
                apiName:fieldConfig.fetchConfig?.apiName,
                file:e.file,
                onUploadProgress(val:number){},
            }); 
            const oldVal:any[] = _this.values[fieldConfig.field]; 
            if(success){
                if(!data){
                    fieldConfig.uploadedCb && fieldConfig.uploadedCb({fieldConfig, res:{ data, message }});
                    return
                };
                // 将新数据设置进 values
                _this.$set(_this.values, fieldConfig.field, [...oldVal, data ]);
                fieldConfig.uploadedCb && fieldConfig.uploadedCb({fieldConfig, res:{ data, message }});
            }else{
                _this.$message.error(message); 
                _this.$set(_this.values, fieldConfig.field, [...oldVal])
            }
 
        },
        filePreview(fieldConfig:FormFieldConfig, e:any){
            // console.log('预览', fieldConfig, e);
            window.open(e.filePath, "_block")
        },
        fileRemove(fieldConfig:FormFieldConfig, e:any){
            // console.log('删除', fieldConfig, e)
            const oldVal:any[] = this.values[fieldConfig.field]; 
            this.$set(this.values, fieldConfig.field, [...oldVal].filter((item)=>item.filePath !== e.filePath))
        },
        fileExceed(fieldConfig:FormFieldConfig, e:any){
            // console.log('超出文件大小', fieldConfig, e) 
            this.$message({  message: `最多只可上传 ${fieldConfig.limit} 个文件。`, type: 'warning'  });
        },
        fileHistory(fieldConfig:FormFieldConfig, fileData:any){
            this.$parent.fileHistory(fileData, true);  
        },

        /**
         * 获取所有字段的下拉数据
        */
        async getSelectOptionData(){
            (this.qnnFormFields as FormFieldConfig[]).forEach(async (item) => {
                const { type, field, fetchConfig = {} } = item;
                const { apiName, otherParams } = fetchConfig as FormFieldConfig["fetchConfig"]; 
                const needGet:boolean = type === "select" ||type === "cascader" || type === "checkbox" || type === "radio";
                if(needGet && apiName){
                    const _this = this; 
                    const { data, success, message } = await this.$myFetch({
                        apiName:apiName,
                        params:typeof otherParams === 'function' ? otherParams({ qnnForm:_this }) : otherParams, 
                    });
                    if(success){
                        // 将新数据设置进 values
                        _this.$set(_this.optionDatas, field, data);
                    }else{ 
                        _this.$message.error(message);
                    }
 
                   
                }
            });
        },
        /**
         * 值操作
        */
        getValues(isValid:boolean){
            if(isValid){
                return new Promise((resolve)=>{
                    this.$refs.qnnForm.validate((valid:boolean) => {
                        if (valid) {
                            resolve( this.$cloneDeep(this.values))
                        } else { 
                            return false;
                        }
                    });
                })
            }
           
            return this.$cloneDeep(this.values)
        },
        setValues(values:Obj){
            return this.values = this.$cloneDeep(values)
        },
        resetValues(){  
            this.$refs.qnnForm.resetFields()
        },

        // 更新 qnnFormFields
        updateFormFields(qnnFormFields:FormFieldConfig[]){ 
            this.qnnFormFields = qnnFormFields;
        },

        toFilesView(){
            this.view = "files"
        },
        toFormView(){
            this.view = "form"
        },

        async querySearch(fieldConfig:FormFieldConfig, queryString:string, cb:(arg:any)=>void) {
            const { fetchConfig = {} } = fieldConfig;
            const { apiName, otherParams={} } = fetchConfig as FetchConfig; 
            // if(apiName){
            //     const body = {
            //         query:queryString,
            //         ...otherParams
            //     }

            //     const _this = this;
            //     const { data, success, message } = await this.$myFetch({
            //         apiName:apiName,
            //         params:body, 
            //     }); 
            //     if(success){
            //         cb(data)
            //     }else{
            //         _this.$message.error(message); 
            //     } 
            // }
            cb([
                { "value": "红辣椒麻辣烫", "address": "上海市长宁区天山西路492号" },
                { "value": "(小杨生煎)西郊百联餐厅", "address": "长宁区仙霞西路88号百联2楼" },
            ]) 
        },
    }
}

</script>
<style lang="less" scoped src="../style/qnn-form.less"></style>
