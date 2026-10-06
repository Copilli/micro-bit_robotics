const fs=require('node:fs');const path=require('node:path');const {spawnSync}=require('node:child_process');
const {root,options,decompile}=require('./pxt-memory.cjs');
const output=path.join(root,'built/validation');fs.mkdirSync(output,{recursive:true});
const projects=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory()&&!['built','pxt_modules'].includes(e.name))walk(f);else if(e.name==='pxt.json')projects.push(dir);}}
walk(path.join(root,'examples'));
const report={node:process.version,target:require('pxt-microbit/package.json').version,pxt:require('pxt-core/package.json').version,projects:[]};
let failures=0;
function command(dir,args){const v2Test=args[0]==='test';const cliArgs=v2Test?[path.join(root,'scripts/test-pxt-v2.cjs')]:[require.resolve('pxt/cli.js'),...args];const r=spawnSync(process.execPath,cliArgs,{cwd:dir,encoding:'utf8',env:process.env,timeout:120000});return {command:v2Test?'pxt test (micro:bit V2)':`pxt ${args.join(' ')}`,status:r.status,error:r.error?.message,output:(r.stdout||'')+(r.stderr||'')};}
for(const dir of [root,...projects]){
    const relative=path.relative(root,dir)||'.';const entry={project:relative,commands:[]};
    entry.commands.push(command(dir,['install']));entry.commands.push(command(dir,['build']));
    if(dir===root)entry.commands.push(command(dir,['test']));
    if(dir!==root){
        const cfg=JSON.parse(fs.readFileSync(path.join(dir,'pxt.json')));
        const main=fs.readFileSync(path.join(dir,'main.ts'),'utf8');
        try{const {xml}=decompile(options(main,!!cfg.dependencies.radio,!!cfg.dependencies['robotics']));entry.decompile='PASS, no grey JS blocks';fs.writeFileSync(path.join(output,relative.replaceAll(path.sep,'-')+'.blocks'),xml);}
        catch(error){entry.decompile=error.message;failures++;}
    }
    const failed=entry.commands.some(c=>c.status!==0);if(failed)failures++;
    console.log(`${relative}: ${failed?'BUILD FAILED':'BUILD PASS'}; ${entry.decompile||'root test compilation'}`);
    report.projects.push(entry);fs.writeFileSync(path.join(output,'pxt.json'),JSON.stringify(report,null,2));
}
console.log(`${projects.length} example projects; ${failures} failures. Full evidence: built/validation/pxt.json`);
process.exitCode=failures?1:0;
