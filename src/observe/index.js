import { isArray, isObject } from "../utils";
import { arrayMethods } from "./array";

//原型链指向问题
//1.每个对象都有一个__proto__属性， 它指向所属类的原型  fn.__proto__ = Function.prototype
//2.每个原型上都有一个constructor属性，指向函数本身， Function.prototype.constructor = Function

class Observer{
    constructor(value){
        if(isArray(value)){
            //更改数组原型方法
           value.__proto__ = arrayMethods//只重写vue里的七个方法
        }else{
            this.walk(value)//核心就是循环对象
        }
        
    }
    walk(data){
        Object.keys(data).forEach(key=>{//要使用defineProperty重新定义
            defineReactive(data,key,data[key])
        })
    }
}
//vue2 应用了defineProperty需要一加载的时候，就进行递归操作， 所以耗性能，如果层次过深也会浪费性能
//1.性能优化的原则
//1)不要把所有的数据都放到data中，因为所有的数据都会增加get和set
//2)不要写数据的时候 层次过深，尽量扁平化数据
//3)不要频繁获取数据
//4)如果数据不需要响应式，可以使用Object.freeze冻结属性
function defineReactive(obj,key,value){//vue2慢的原因 主要在这个方法中
    observe(value)
    Object.defineProperty(obj,key,{
        get(){
            return value//闭包，此value 会向上层的value查找
        },
        set(newValue){
            if(value === newValue) return 
            value = newValue
        }
    })
}

export function observe(value){
    //1、如果value不是对象，就不需要观测了，说明写的有问题
    if(!isObject(value)){
        return
    }
    //需要对对象进行观测，最外层必须是一个{}，不能是数组
    //如果一个数据已经被观测过了，就不要在观测了，用类来实现，我观测过就增加一个标识，说明观测过了，在观测时候可以先检测是否观测过
    //如果观测过了就跳过

    return new Observer(value)
    console.log(value)
}
