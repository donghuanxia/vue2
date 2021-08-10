npm install rollup //安装rollup
@babel/core  //高级语法转成低级语法 es6->es5
rollup-plugin-babel //rollup和babel等进行关联
@babel/preset-env //将高级语法转义成低级语法
rollup-plugin-node-resolve 安装这个插件可以自动解析文件夹里的index.js文件

//2021/8/9
数据变化是如何变化的，Object.defineProperty,将对象中原有的属性更改成带有get和set的一个属性，这样当修改的时候，会触发 set ->更新视图
//1.new Vue 会调用_init方法进行初始化操作
//2.会将用户的选项放到vm.$options上
//3.会对当前属性上搜索有没有data数据 initState
//4.有data 判断data是不是一个函数，如果是函数，取值返回initData
//5.observe 去观测data中的数据


//vue2 应用了defineProperty需要一加载的时候，就进行递归操作， 所以耗性能，如果层次过深也会浪费性能
//1.性能优化的原则
//1)不要把所有的数据都放到data中，因为所有的数据都会增加get和set
//2)不要写数据的时候 层次过深，尽量扁平化数据
//3)不要频繁获取数据
//4)如果数据不需要响应式，可以使用Object.freeze冻结属性