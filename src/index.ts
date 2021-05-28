import component from './index.vue';

const win: any = window; 
export function install(Vue: any): void { 
    Vue.component('QnnCurd', component); 
}
/* istanbul ignore if */
if (typeof win !== 'undefined' && win.Vue) {
    console.log('--', win.Vue)
    install(win.Vue);
}
// Create module definition for Vue.use()
const plugin = {
    install,
};
 
let GlobalVue = null;
if (typeof win !== 'undefined') {
    GlobalVue = win.Vue;
} else if (typeof global !== 'undefined') {
    GlobalVue = (global as any).Vue;
}
if (GlobalVue) {
    GlobalVue.use(plugin);
}
 
export default {
    version: "1.0",
    install,
    QnnCurd: component
};