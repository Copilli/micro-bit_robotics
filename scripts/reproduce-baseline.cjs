// Read-only reproduction against the audited commit; no checkout or source replacement.
const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');const ts=require('typescript');const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),revision='0b47cf6764e1b5135de7c00fad7e403caf4ec312';
const git=file=>execFileSync('git',['show',`${revision}:${file}`],{cwd:root,encoding:'utf8'});
const cfg=JSON.parse(git('pxt.json')),files=cfg.files.map(f=>path.join(root,f));
const host=ts.createCompilerHost({target:ts.ScriptTarget.ES2017});const original=host.getSourceFile.bind(host);
host.getSourceFile=(file,version,...args)=>cfg.files.includes(path.relative(root,file))?ts.createSourceFile(file,git(path.relative(root,file).replaceAll(path.sep,'/')),version,true):original(file,version,...args);
const program=ts.createProgram(files,{target:ts.ScriptTarget.ES2017},host),output=[];program.emit(undefined,(file,text)=>{if(file.endsWith('.js'))output.push(text);});
let now=0,poller,receiver;const ctx=vm.createContext({DigitalPin:{P1:1,P2:2,P8:8,P12:12,P13:13,P14:14,P15:15,P16:16},AnalogPin:{P1:1,P2:2},PinPullMode:{PullUp:1,PullNone:0},pins:{setPull(){},digitalReadPin:()=>0},basic:{pause:ms=>{now+=ms;},forever:fn=>{poller=fn;}},control:{millis:()=>now},radio:{setGroup(){},onReceivedValue:fn=>{receiver=fn;}}});
vm.runInContext('Math.idiv=(a,b)=>Math.trunc(a/b);Array.prototype.removeAt=function(i){this.splice(i,1)}',ctx);output.forEach(source=>vm.runInContext(source,ctx));
const tree=execFileSync('git',['ls-tree','-r','--name-only',revision],{cwd:root,encoding:'utf8'}).split('\n');
const result={revision,initialDirtyFiles:0,node:process.version,exampleProjects:tree.filter(f=>/^examples\/.*\/pxt.json$/.test(f)).length,blockIds:cfg.files.reduce((n,f)=>n+[...git(f).matchAll(/blockId=/g)].length,0)};
result.H06=ctx.copilliLogic.normalizeAxis(0,100,153,false);
const observations=[];ctx.copilli.alPulsarBoton(0,()=>{observations.push(['C',now]);ctx.basic.pause(1000);});ctx.copilli.alPulsarBoton(1,()=>observations.push(['D',now]));ctx.copilli.iniciarGamepad();poller();poller();poller();result.H02=observations;
ctx.copilli.iniciarMaqueen=()=>{};ctx.copilli.detener=()=>{};const wheels=[];ctx.copilli.moverRuedas=(l,r)=>wheels.push([now,l,r]);
ctx.basic.pause=()=>{};
vm.runInContext(ts.transpileModule(git('examples/radio-proportional/robot/main.ts'),{compilerOptions:{target:ts.ScriptTarget.ES2017}}).outputText,ctx);
now=0;receiver('y',80);for(now=100;now<=1000;now+=100){receiver('x',0);poller();}result.H01=wheels.at(-1);
fs.mkdirSync(path.join(root,'built/validation'),{recursive:true});fs.writeFileSync(path.join(root,'built/validation/baseline.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
