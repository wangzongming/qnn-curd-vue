export type Obj = {
    [field: string]: any
};

export type RowData = Obj;

export type Arg = {
    [field: string]: any
};

export type OptionData = {
    [field: string]: any
};

export type KVConfig = {
    label?: string;
    value?: string;
    children?: string;
};

export type FetchConfig = {
    apiName: string;
    otherParams: Obj | ((arg: Arg) => Obj);
}
export type FormFieldType =
    "string" | "number" | "textarea" | "radio" |
    "checkbox" | "date" | "year" | "month" |
     "dates" | "week" |  "datetime" | "datetimerange" | 
     "daterange" | "monthrange" | "datetime" | "select" | 
     "files" | "custom" | "cascader";

export type BtnType = "add" | "del" | "detail" | "submit" | 
                "cancel" | "edit" | "history" | "download" | 
                "import" | "export" | "custom" | "pass" | 
                "reject" | "audit" | "copy" | "auditHistory";

export type BtnInfo = {
    // field 必须设置，不然按钮loading将会失效
    field: string,
    label: string,
    disabled?: boolean,
    icon?: string,
    size?: "medium" | "small" | "mini",
    // 按钮风格
    btnStyle?: "primary" | "success" | "warning" | "danger" | "info" | "text",
    /**
     * history 弹出一个列表，用于查询历史数据等
     * custom  自定义点击事件，需要在 onClick 事件中自定义逻辑
     * download 点击后下载文件，待定...
     * export 导出数据，待定...
     * import 导入，待定...
    */
    type: BtnType;
    formBtns?: BtnInfo[],
    formFields?: FormFieldConfig[],
    fetchConfig?: FetchConfig,
    targetUrl?: string,
    onClick?: (arg?: Arg) => void
}

export interface FormFieldConfig {
    field: string;
    type: FormFieldType;
    label?: string;
    initialValue?: any;
    optnionData?: OptionData[];
    optnionConfig?: KVConfig;
    fetchConfig?: FetchConfig;
    required?:boolean;

    /**
     * 最多上传文件数量
    */
    limit?: number;

    /**
     * 是否为搜索条件
    */
    isInSearch?: boolean;

}


export interface TableFieldConfig {
    [field: string]: any
}

export interface QnnCurdVueProps {
    fetch?: any;
    upload?: any;
    fetchConfig?: FetchConfig;
    formatData?: (tableData: RowData[]) => RowData[];
    rowKey: string;
    actionBtns?: BtnInfo[];
    tableFields?: TableFieldConfig[];
    formFields?: FormFieldConfig[];
    data?: RowData[];
}