const fs=require('node:fs');const path=require('node:path');
require('pxt-core/built/pxt.js');
const root=path.resolve(__dirname,'..');
pxt.setAppTarget(require('pxt-microbit/built/target.json'));
function options(main,radio=false,copilli=true){
    const fileSystem={};
    for(const name of radio?['core','radio']:['core'])for(const [file,source]of Object.entries(pxt.appTarget.bundledpkgs[name]))if(/\.ts$/.test(file))fileSystem[`pxt_modules/${name}/${file}`]=source;
    if(copilli)for(const file of require('../pxt.json').files)fileSystem[`pxt_modules/copilli/${file}`]=fs.readFileSync(path.join(root,file),'utf8');
    fileSystem['main.ts']=main;
    return {fileSystem,sourceFiles:Object.keys(fileSystem),target:{...pxt.appTarget.compile,isNative:false},ast:true};
}
function compile(opts){const result=pxtc.compile(opts);if(!result.success)throw new Error(JSON.stringify(result.diagnostics,null,2));return result;}
function decompile(opts){const result=compile(opts);const blocks=pxtc.decompile(result.ast,opts,'main.ts');if(!blocks.success)throw new Error(JSON.stringify(blocks.diagnostics,null,2));const xml=blocks.outfiles['main.blocks'];if(/type="typescript_statement"|type="typescript_expression"/.test(xml))throw new Error('JavaScript grey block');return {xml,result,info:pxtc.getBlocksInfo(pxtc.getApiInfo(result.ast,opts.jres))};}
module.exports={root,options,compile,decompile};
