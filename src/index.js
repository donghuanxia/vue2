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
//5.observe 去观测data中的数据 和vm没有关系，说明datayijign 变成了响应式的
//6.vm上像取值也能取到data中的数据vm._data = data 这样用户能取到data 了 vm._data
//7.用户觉得有点麻烦 vm.xx => vm._data.xx
//8.如果更新对象不存在的属性，会导致视图不更新，如果是数组更新索引和长度不会触发更新
//9.如果替换成一个新对象，新对象会被进行劫持，如果是数组存新内容 push unshift() 新增的内容也会被劫持
//通过__ob__进行标识这个对象被监控过， 在(vue 中被监控的对象身上都有一个__ob__这个属性)
//10.如果你就想改变索引 可以使用$set方法， 内部就是splice()
