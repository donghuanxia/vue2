import { initMixin } from "./init";

//vue 要如何实现， 原型模式， 所有的功能都通过原型扩展的方式添加
function Vue(options){
    //实现vue的初始化功能
    this._init(options)
}
initMixin(Vue)

//导出Vue给别人使用
export default Vue;

//1.new Vue 会调用_init方法进行初始化操作
//2.会将用户的选项放到vm.$options上
//3.会对当前属性上搜索有没有data数据 initState
//4.有data 判断data是不是一个函数，如果是函数，取值返回initData
//5.observe 去观测data中的数据