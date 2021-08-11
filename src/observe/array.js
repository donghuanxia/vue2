let oldArrayPortotype = Array.prototype//获取数组老的原型方法

export let arrayMethods = Object.create(oldArrayPortotype)//让arrayMethods 通过__proto__能获取到数组的方法
// arrayMethods.__proto__ == oldArrayPortotype
// arrayMethods.push = function
let methods = [//只有这七个方法可以导致数组发生变化
    'push',
    'shift',
    'pop',
    'unshift',
    'reverse',
    'sort',
    'splice'
]

methods.forEach(method=>{
    arrayMethods[method] = function(...args){
        //数组新增的属性是不是对象，是对象，继续劫持
        //调用数组的原生逻辑
        oldArrayPortotype[method].call(this,...args)//又有自己的逻辑，又有原来的逻辑，函数切片
        console.log(method,'数组的方法进行重新操作')
        let inserted = null
        let ob = this.__ob__
        switch(method){
            case 'splice'://删除，修改，添加，arr.splice(),第三个参数起为新添加的
                inserted = args.splice(2);//splice方法从第三个参数开始都是新添加的
                break;
            case 'push':
            case 'unshift':
                inserted = args;//调用push 和unshift 传递的参数就是新增的逻辑
                break;
        }
        if(inserted) ob.observeArray(inserted)
    }
})