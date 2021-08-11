export function isFunction(val){//判断是否为方法
    return typeof val == 'function'
}

export function isObject(val){//判断是否为对象
    return typeof val == 'object'&& val!==null
}

export let isArray = Array.isArray//判断是否为数组