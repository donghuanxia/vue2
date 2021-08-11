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
    arrayMethods[method] = function(){
        console.log(method,'数组的方法进行重新操作')
    }
})