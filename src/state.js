import { observe } from "./observe"//rollup-plugin-node-resolve 安装这个插件可以自动解析文件夹里的index.js文件
import { isFunction } from "./utils"

export function initState(vm){
     const options = vm.$options
     if(options.data){
         //做数据的初始化
         initData(vm)
     }
}

function proxy(vm,key,source){//取值的时候做代理，不是暴力的把_data属性赋予给vm,而且直接赋值会有命名冲突的问题
    
    Object.defineProperty(vm,key,{
        get(){
            return vm[source][key];
        },
        set(newValue){
            vm[source][key] = newValue;
        }
    })
}

function initData(vm){
    let data = vm.$options.data//用户传入的数据

    //如果用户传递的是一个函数，则取函数的返回值作为对象，如果就是对象那就直接使用这个对象
    //只有根实例可以data一个对象
    data = vm._data = isFunction(data) ? data.call(vm) : data//判断data 是函数还是对象,_data已经是响应式的了
    //需要将data变成响应式的， Object.defineProperty,重写data的所有属性
    observe(data)//取观测数据，重要，核心模块
    //console.log('222',data)
    //data.arr.push(100)
    //data.arr.pop(100)
    for(let key in data){//vm.message=>vm._data.message
        proxy(vm,key,'_data')
    }
    //vm.message = vm._data.message
}