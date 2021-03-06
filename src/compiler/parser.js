const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`//匹配标签名 aa-xxx
const qnameCapture = `((?:${ncname}\\:)?${ncname})`//aa:aa-xxx
const startTagOpen = new RegExp(`^<${qnameCapture}`)//标签开头正则表达式 捕获的内容是标签名,匹配到结果的第一个（索引第一个）[1]
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)//匹配标签结尾的</div> [1] 
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;//属性的匹配
const startTagClose = /^\s*(\/?)>/;//匹配标签结束符 >
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g ;//{{xxxx}}
let htm1 = 'id=app'
//console.log('id=app'.match(attribute))// [1]属性的key, [3] || [4] || [5]属性的值

function parserHTML(html){
    //console.log(html)
    let stack = []
    let root  = null
    //我要构建父子关系
    function createASTElement(tag,attrs,parent = null){
        return {
            tag,
            type:1,//元素
            children:[],
            parent,
            attrs
        }
    }
    function start(tagName,attrs){
        //遇到开始标签 就取栈中的最后一个作为父节点
        let parent = stack[stack.length-1]
        let element = createASTElement(tagName,attrs,parent)
        if(root == null){//说明当前节点就是根节点
            root = element
        }
        if(parent){
            element.parent = parent//更新p的parent属性 指向parent
            parent.children.push(element)
        }
        stack.push(element)
        //console.log('start',tagName,attrs)
    }
    function end(tagName){
        let endTag = stack.pop(tagName)
        if(endTag.tag != tagName){
            console.log('标签出错')
        }
    }
    function text(chars){
        let parent = stack[stack.length-1]
        chars = chars.replace(/\s/g,"")//空格
        if(chars){
            parent.children.push({
                type:2,
                text:chars
            })
        }
        console.log('chars',chars)
    }
    function advance(len){//将解析完的删除
        html = html.substring(len)
    }
    function parseStargTag(){
        const start = html.match(startTagOpen)
        if(start){
            const match = {
                tagName:start[1],
                attrs:[]
            }
            advance(start[0].length)
            console.log(match,html)
    
            let end;
            let attr;
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                match.attrs.push({
                    name:attr[1],
                    value:attr[3] || attr[4] || attr[5]
                })// <div id="app"
                advance(attr[0].length)
            }
            if(end){
                advance(end[0].length)
            }
            return match
        }
        return false
        
    }
    while(html){
        //解析标签和文本,看内容的第一个字符是不是<,如果第一个是<就是标签，如果第一个不是<,那就是文本
        let index = html.indexOf('<')
        //console.log('index-----',index)
        if(index == 0){
            //解析开始标签，并且把属性也解析出来
            const startTagMatch = parseStargTag()
            //console.log(startTagMatch)
            if(startTagMatch){//开始标签
                start(startTagMatch.tagName,startTagMatch.attrs)
                continue;
            }
            let endTagMatch;
            if(endTagMatch = html.match(endTag)){//结束标签
                end(endTagMatch[1])
                advance(endTagMatch[0].length)
                continue;
            }
            break;
        }
        //文本
        if(index > 0 ){
            let chars = html.substring(0,index)
            text(chars)
            advance(chars.length)
        }

        
    }
    return root
}

export default parserHTML