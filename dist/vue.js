(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

    function isFunction(val) {
      //判断是否为方法
      return typeof val == 'function';
    }
    function isObject(val) {
      //判断是否为对象
      return typeof val == 'object' && val !== null;
    }
    let isArray = Array.isArray; //判断是否为数组

    let oldArrayPortotype = Array.prototype; //获取数组老的原型方法

    let arrayMethods = Object.create(oldArrayPortotype); //让arrayMethods 通过__proto__能获取到数组的方法
    // arrayMethods.__proto__ == oldArrayPortotype
    // arrayMethods.push = function

    let methods = [//只有这七个方法可以导致数组发生变化
    'push', 'shift', 'pop', 'unshift', 'reverse', 'sort', 'splice'];
    methods.forEach(method => {
      arrayMethods[method] = function () {
        console.log(method, '数组的方法进行重新操作');
      };
    });

    //1.每个对象都有一个__proto__属性， 它指向所属类的原型  fn.__proto__ = Function.prototype
    //2.每个原型上都有一个constructor属性，指向函数本身， Function.prototype.constructor = Function

    class Observer {
      constructor(value) {
        if (isArray(value)) {
          //更改数组原型方法
          value.__proto__ = arrayMethods; //只重写vue里的七个方法
        } else {
          this.walk(value); //核心就是循环对象
        }
      }

      walk(data) {
        Object.keys(data).forEach(key => {
          //要使用defineProperty重新定义
          defineReactive(data, key, data[key]);
        });
      }

    } //vue2 应用了defineProperty需要一加载的时候，就进行递归操作， 所以耗性能，如果层次过深也会浪费性能
    //1.性能优化的原则
    //1)不要把所有的数据都放到data中，因为所有的数据都会增加get和set
    //2)不要写数据的时候 层次过深，尽量扁平化数据
    //3)不要频繁获取数据
    //4)如果数据不需要响应式，可以使用Object.freeze冻结属性


    function defineReactive(obj, key, value) {
      //vue2慢的原因 主要在这个方法中
      observe(value);
      Object.defineProperty(obj, key, {
        get() {
          return value; //闭包，此value 会向上层的value查找
        },

        set(newValue) {
          if (value === newValue) return;
          value = newValue;
        }

      });
    }

    function observe(value) {
      //1、如果value不是对象，就不需要观测了，说明写的有问题
      if (!isObject(value)) {
        return;
      } //需要对对象进行观测，最外层必须是一个{}，不能是数组
      //如果一个数据已经被观测过了，就不要在观测了，用类来实现，我观测过就增加一个标识，说明观测过了，在观测时候可以先检测是否观测过
      //如果观测过了就跳过


      return new Observer(value);
    }

    function initState(vm) {
      const options = vm.$options;

      if (options.data) {
        //做数据的初始化
        initData(vm);
      }
    }

    function proxy(vm, key, source) {
      //取值的时候做代理，不是暴力的把_data属性赋予给vm,而且直接赋值会有命名冲突的问题
      Object.defineProperty(vm, key, {
        get() {
          return vm[source][key];
        },

        set(newValue) {
          vm[source][key] = newValue;
        }

      });
    }

    function initData(vm) {
      let data = vm.$options.data; //用户传入的数据
      //如果用户传递的是一个函数，则取函数的返回值作为对象，如果就是对象那就直接使用这个对象
      //只有根实例可以data一个对象

      data = vm._data = isFunction(data) ? data.call(vm) : data; //判断data 是函数还是对象,_data已经是响应式的了
      //需要将data变成响应式的， Object.defineProperty,重写data的所有属性

      observe(data); //取观测数据，重要，核心模块
      //console.log('222',data)
      //data.arr.push(100)
      //data.arr.pop(100)

      for (let key in data) {
        //vm.message=>vm._data.message
        proxy(vm, key, '_data');
      } //vm.message = vm._data.message

    }

    function initMixin(Vue) {
      //后续组件话开发的时候，Vue.extend可以创造一个子组件，子组件可以继承Vue，子组件也可以调用_init方法
      Vue.prototype._init = function (options) {
        const vm = this; //把用户的选项都放到vm上，这样在其他方法中可以获取到options

        vm.$options = options; //为了后续扩展的方法，都可以获取$options选项

        console.log(vm);
        initState(vm);

        if (vm.$options.el) {
          //要将数据挂载到页面上
          console.log('页面进行挂载了');
        }
      };
    }

    function Vue(options) {
      //实现vue的初始化功能
      this._init(options);
    }

    initMixin(Vue); //导出Vue给别人使用
    //2.会将用户的选项放到vm.$options上
    //3.会对当前属性上搜索有没有data数据 initState
    //4.有data 判断data是不是一个函数，如果是函数，取值返回initData
    //5.observe 去观测data中的数据

    return Vue;

})));
//# sourceMappingURL=vue.js.map
