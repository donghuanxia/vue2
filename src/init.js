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
            //现在数据已经被劫持了，数据变换需更新视图 diff 算法更新需要更新的部分
            //vue -> template（写起来更符合直觉） -> jsx（灵活）
            //vue3-> template写起来性能会更高一些，内部做了很多优化
            //template -> ast语法树（用来描述语法的，描述语法本身的）->描述成一个树结构 -> 将代码重组成js语法
            // 模板编译原理（把template模板编译成render函数->虚拟DOM ->diff算法比对虚拟DOM)
            //ast ->render返回->vnode —》 生成真实DOM
            // 更新的时候再次调用render-》新的vnode ->新旧比对，--》更新真是的dom
            console.log('页面进行挂载了')
        }
    }
}