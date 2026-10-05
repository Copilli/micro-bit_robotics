// PXT's own compressed project format, with a local source snapshot of Copilli.
// No unpublished GitHub revision or file: dependency is sent to the web editor.
const fs=require('node:fs');const path=require('node:path');
const {root,options,decompile}=require('./pxt-memory.cjs');
async function main(){
    const output=path.join(root,'output/makecode');fs.mkdirSync(output,{recursive:true});
    const projects=[];
    function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory()&&!['built','pxt_modules'].includes(e.name))walk(f);else if(e.name==='pxt.json')projects.push(dir);}}
    walk(path.join(root,'examples'));
    for(const dir of projects){
        const config=JSON.parse(fs.readFileSync(path.join(dir,'pxt.json'))),hasCopilli=!!config.dependencies['robotics'];
        const source=fs.readFileSync(path.join(dir,'main.ts'),'utf8');const {xml}=decompile(options(source,!!config.dependencies.radio,hasCopilli));
        const files={'main.ts':source,'main.blocks':xml};
        const bundled=hasCopilli?require('../pxt.json').files:[];
        for(const file of bundled)files[file]=fs.readFileSync(path.join(root,file),'utf8');
        const dependencies={core:'*'};if(config.dependencies.radio)dependencies.radio='*';
        files['pxt.json']=JSON.stringify({...config,dependencies,files:['main.ts','main.blocks',...bundled],preferredEditor:'blocksprj'},null,4);
        const host={
            readFile:(pkg,file)=>pkg.id==='this'?files[file]:pxt.appTarget.bundledpkgs[pkg.id]?.[file],
            writeFile:(pkg,file,text)=>{if(pkg.id==='this')files[file]=text;},
            downloadPackageAsync:()=>Promise.resolve(),resolveVersionAsync:()=>Promise.resolve('*'),
            cacheStoreAsync:()=>Promise.resolve(),cacheGetAsync:()=>Promise.resolve(null)
        };
        const pkg=new pxt.MainPackage(host);const blob=await pkg.compressToFileAsync();if(!blob)throw new Error('PXT compression failed');
        const decoded=JSON.parse(await pxt.lzmaDecompressAsync(blob));const restored=JSON.parse(decoded.source);
        if(restored['main.ts']!==source||/file:/.test(restored['pxt.json']))throw new Error('Invalid web export');
        const filename=path.relative(path.join(root,'examples'),dir).split(path.sep).join('-')+'.mkcd';
        fs.writeFileSync(path.join(output,filename),blob);console.log(filename);
    }
    console.log(`${projects.length} PXT projects exported and decoded. Web UI import is a separate check.`);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
