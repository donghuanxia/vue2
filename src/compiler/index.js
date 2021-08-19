function parserHTML(template){
    console.log(template)    
}
export function compileToFunction(template){
    //将模板生成ast语法树
    let ast = parserHTML(template)
}