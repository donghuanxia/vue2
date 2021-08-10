import { initState } from "./state"

export function initMixin(Vue){
    //后续组件话开发的时候，Vue.extend可以创造一个子组件，子组件可以继承Vue，子组件也可以调用_init方法
    Vue.prototype._init = function(options){
        const vm = this
        //把用户的选项都放到vm上，这样在其他方法中可以获取到options
        vm.$options = options//为了后续扩展的方法，都可以获取$options选项
        console.log(vm)
        initState(vm)
        if(vm.$options.el){
            //要将数据挂载到页面上
            console.log('页面进行挂载了')
        }
    }
}