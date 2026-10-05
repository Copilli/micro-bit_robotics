// Compare configured API arguments across a blocks roundtrip, ignoring comments/layout.
const ts=require('typescript');
function calls(source){
    const tree=ts.createSourceFile('main.ts',source,ts.ScriptTarget.Latest,true);
    const values=[];
    function visit(node){
        if(ts.isCallExpression(node)){
            const name=node.expression.getText(tree);
            if(/^(copilli\.|radio\.|input\.|music\.|basic\.)/.test(name)){
                values.push(name+'('+node.arguments.map(a=>ts.isFunctionExpression(a)||ts.isArrowFunction(a)?'<handler>':a.getText(tree).replace(/\s+/g,'')).join(',')+')');
            }
        }
        ts.forEachChild(node,visit);
    }
    visit(tree);return values.sort();
}
module.exports={calls};
