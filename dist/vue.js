(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

    const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{   xxx  }}  

    function genProps(attrs) {
      // {key:value,key:value,}
      let str = '';

      for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i];

        if (attr.name === 'style') {
          // {name:id,value:'app'}
          let styles = {};
          attr.value.replace(/([^;:]+):([^;:]+)/g, function () {
            styles[arguments[1]] = arguments[2];
          });
          attr.value = styles;
        }

        str += `${attr.name}:${JSON.stringify(attr.value)},`;
      }

      return `{${str.slice(0, -1)}}`;
    }

    function gen(el) {
      if (el.type == 1) {
        return generate(el); // 如果是元素就递归的生成
      } else {
        let text = el.text; // {{}}

        if (!defaultTagRE.test(text)) return `_v('${text}')`; // 说明就是普通文本
        // 说明有表达式 我需要 做一个表达式和普通值的拼接 ['aaaa',_s(name),'bbb'].join('+)
        // _v('aaaa'+_s(name) + 'bbb')

        let lastIndex = defaultTagRE.lastIndex = 0;
        let tokens = []; // <div> aaa{{bbb}} aaa </div>

        let match; // ，每次匹配的时候 lastIndex 会自动向后移动

        while (match = defaultTagRE.exec(text)) {
          // 如果正则 + g 配合exec 就会有一个问题 lastIndex的问题
          let index = match.index;

          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }

          tokens.push(`_s(${match[1].trim()})`);
          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }

        return `_v(${tokens.join('+')})`; // webpack 源码 css-loader  图片处理
      }
    }

    function genChildren(el) {
      let children = el.children;

      if (children) {
        return children.map(item => gen(item)).join(',');
      }

      return false;
    } // _c(div,{},c1,c2,c3,c4)


    function generate(ast) {
      let children = genChildren(ast);
      let code = `_c('${ast.tag}',${ast.attrs.length ? genProps(ast.attrs) : 'undefined'}${children ? `,${children}` : ''})`;
      return code;
    }

    const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; //匹配标签名 aa-xxx

    const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //aa:aa-xxx

    const startTagOpen = new RegExp(`^<${qnameCapture}`); //标签开头正则表达式 捕获的内容是标签名,匹配到结果的第一个（索引第一个）[1]

    const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); //匹配标签结尾的</div> [1] 

    const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //属性的匹配

    const startTagClose = /^\s*(\/?)>/; //匹配标签结束符 >

    function parserHTML(html) {
      //console.log(html)
      let stack = [];
      let root = null; //我要构建父子关系

      function createASTElement(tag, attrs, parent = null) {
        return {
          tag,
          type: 1,
          //元素
          children: [],
          parent,
          attrs
        };
      }

      function start(tagName, attrs) {
        //遇到开始标签 就取栈中的最后一个作为父节点
        let parent = stack[stack.length - 1];
        let element = createASTElement(tagName, attrs, parent);

        if (root == null) {
          //说明当前节点就是根节点
          root = element;
        }

        if (parent) {
          element.parent = parent; //更新p的parent属性 指向parent

          parent.children.push(element);
        }

        stack.push(element); //console.log('start',tagName,attrs)
      }

      function end(tagName) {
        let endTag = stack.pop(tagName);

        if (endTag.tag != tagName) {
          console.log('标签出错');
        }
      }

      function text(chars) {
        let parent = stack[stack.length - 1];
        chars = chars.replace(/\s/g, ""); //空格

        if (chars) {
          parent.children.push({
            type: 2,
            text: chars
          });
        }

        console.log('chars', chars);
      }

      function advance(len) {
        //将解析完的删除
        html = html.substring(len);
      }

      function parseStargTag() {
        const start = html.match(startTagOpen);

        if (start) {
          const match = {
            tagName: start[1],
            attrs: []
          };
          advance(start[0].length);
          console.log(match, html);
          let end;
          let attr;

          while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            match.attrs.push({
              name: attr[1],
              value: attr[3] || attr[4] || attr[5]
            }); // <div id="app"

            advance(attr[0].length);
          }

          if (end) {
            advance(end[0].length);
          }

          return match;
        }

        return false;
      }

      while (html) {
        //解析标签和文本,看内容的第一个字符是不是<,如果第一个是<就是标签，如果第一个不是<,那就是文本
        let index = html.indexOf('<'); //console.log('index-----',index)

        if (index == 0) {
          //解析开始标签，并且把属性也解析出来
          const startTagMatch = parseStargTag(); //console.log(startTagMatch)

          if (startTagMatch) {
            //开始标签
            start(startTagMatch.tagName, startTagMatch.attrs);
            continue;
          }

          let endTagMatch;

          if (endTagMatch = html.match(endTag)) {
            //结束标签
            end(endTagMatch[1]);
            advance(endTagMatch[0].length);
            continue;
          }

          break;
        } //文本


        if (index > 0) {
          let chars = html.substring(0, index);
          text(chars);
          advance(chars.length);
        }
      }

      return root;
    }

    function compileToFunction(template) {
      //1.将模板生成ast语法树
      let ast = parserHTML(template); //代码优化，标记静态节点
      //2.代码生成

      let code = generate(ast);
      let render = new Function(`with(this){return ${code}}`);
      console.log(render.toString()); //1.编译原理
      //2.响应式原理 依赖收集
      //3.组件化开发（贯穿了vue的流程）
      //4.diff算法
    }

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
      arrayMethods[method] = function (...args) {
        //数组新增的属性是不是对象，是对象，继续劫持
        //调用数组的原生逻辑
        oldArrayPortotype[method].call(this, ...args); //又有自己的逻辑，又有原来的逻辑，函数切片

        console.log(method, '数组的方法进行重新操作');
        let inserted = null;
        let ob = this.__ob__;

        switch (method) {
          case 'splice':
            //删除，修改，添加，arr.splice(),第三个参数起为新添加的
            inserted = args.splice(2); //splice方法从第三个参数开始都是新添加的

            break;

          case 'push':
          case 'unshift':
            inserted = args; //调用push 和unshift 传递的参数就是新增的逻辑

            break;
        }

        if (inserted) ob.observeArray(inserted);
      };
    });

    //1.每个对象都有一个__proto__属性， 它指向所属类的原型  fn.__proto__ = Function.prototype
    //2.每个原型上都有一个constructor属性，指向函数本身， Function.prototype.constructor = Function

    class Observer {
      constructor(value) {
        //不让__ob__被遍历
        value.__ob__ = this;
        Object.defineProperty(value, '__ob__', {
          value: this,
          enumerable: false //表示这个属性不能被列举出来，也就是不能被枚举

        });

        if (isArray(value)) {
          //更改数组原型方法
          value.__proto__ = arrayMethods; //只重写vue里的七个方法

          this.observeArray(value);
        } else {
          this.walk(value); //核心就是循环对象
        }
      }

      observeArray(data) {
        //递归遍历数组，对数组内部的额对象再次重写[[]]
        data.forEach(item => observe(item)); //数组里面如果是引用类型的那么是响应式的
        //vm.arr[0].a = 100//会触发
        //vm.arr[0]=100 不会触发，更改索引不会触发
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
          console.log('秀嘎');
          observe(newValue);
        }

      });
    }

    function observe(value) {
      //1、如果value不是对象，就不需要观测了，说明写的有问题
      if (!isObject(value)) {
        return;
      }

      if (value.__ob__) {
        return; //一个对象不需要被重新观测
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
          //现在数据已经被劫持了，数据变换需更新视图 diff 算法更新需要更新的部分
          //vue -> template（写起来更符合直觉） -> jsx（灵活）
          //vue3-> template写起来性能会更高一些，内部做了很多优化
          //template -> ast语法树（用来描述语法的，描述语法本身的）->描述成一个树结构 -> 将代码重组成js语法
          // 模板编译原理（把template模板编译成render函数->虚拟DOM ->diff算法比对虚拟DOM)
          //ast ->render返回->vnode —》 生成真实DOM
          // 更新的时候再次调用render-》新的vnode ->新旧比对，--》更新真是的dom
          vm.$mount(vm.$options.el);
          console.log('页面进行挂载了');
        }
      }, Vue.prototype.$mount = function (el) {
        const vm = this;
        const opts = vm.$options;
        el = document.querySelector(el);
        vm.$el = el; //页面真实的数据

        if (!opts.render) {
          //模板编译
          let template = opts.template;

          if (!template) {
            template = el.outerHTML;
          }

          let render = compileToFunction(template);
          opts.render = render;
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
    //5.observe 去观测data中的数据 和vm没有关系，说明datayijign 变成了响应式的
    //6.vm上像取值也能取到data中的数据vm._data = data 这样用户能取到data 了 vm._data
    //7.用户觉得有点麻烦 vm.xx => vm._data.xx
    //8.如果更新对象不存在的属性，会导致视图不更新，如果是数组更新索引和长度不会触发更新
    //9.如果替换成一个新对象，新对象会被进行劫持，如果是数组存新内容 push unshift() 新增的内容也会被劫持
    //通过__ob__进行标识这个对象被监控过， 在(vue 中被监控的对象身上都有一个__ob__这个属性)
    //10.如果你就想改变索引 可以使用$set方法， 内部就是splice()

    return Vue;

})));
//# sourceMappingURL=vue.js.map
