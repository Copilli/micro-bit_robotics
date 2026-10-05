// Uses an already opened Playwright CLI session; never shares/publishes a project.
// Usage: node scripts/web-roundtrip.cjs <path-to-playwright-cli.js> [example-name ...]
const fs=require('node:fs');const path=require('node:path');const {spawnSync}=require('node:child_process');
const {root,options,compile}=require('./pxt-memory.cjs');
const {calls}=require('../tests/roundtrip-values.cjs');
const assert=require('node:assert/strict');
const cli=process.argv[2];if(!cli)throw new Error('Provide the installed Playwright CLI entry point');
const output=path.join(root,'output/playwright');fs.mkdirSync(output,{recursive:true});
const selected=process.argv.slice(3);
const names=selected.length?selected:fs.readdirSync(path.join(root,'output/makecode')).filter(f=>f.endsWith('.mkcd')).map(f=>f.slice(0,-5));
const reportFile=path.join(output,'web-validation.json');
const results=fs.existsSync(reportFile)?JSON.parse(fs.readFileSync(reportFile)):[];
const originals={};
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory()&&!['built','pxt_modules'].includes(e.name))walk(f);else if(e.name==='pxt.json')originals[path.relative(path.join(root,'examples'),dir).split(path.sep).join('-')]=fs.readFileSync(path.join(dir,'main.ts'),'utf8');}}
walk(path.join(root,'examples'));
for(const name of names){
    const file=path.join(root,'output/makecode',name+'.mkcd');
    const screenshot=path.join(output,name+'.png');
    const code=`async (page) => {
        if (page.url().includes('#editor')) await page.getByRole('button', {name:'Home screen', exact:true}).click();
        await page.getByRole('button', {name:'Import', exact:true}).click();
        await page.getByRole('button', {name:'Open files from your computer', exact:true}).click();
        await page.getByRole('button', {name:'Select a .mkcd or .hex file to open.', exact:true}).setInputFiles(${JSON.stringify(file)});
        await page.getByRole('button', {name:'Go ahead!',exact:true}).click();
        await page.waitForURL('**/#editor');
        await page.waitForTimeout(2500);
        await page.getByRole('button', {name:'Convert code to JavaScript',exact:true}).click();
        await page.getByRole('textbox', {name:/JavaScript editor/}).waitFor();
        const first = await page.evaluate(()=>monaco.editor.getModels().find(m=>m.uri.toString().endsWith('/main.ts')).getValue());
        await page.waitForTimeout(1000);
        await page.getByRole('button', {name:'Convert code to Blocks',exact:true}).click();
        for (let attempt=0;attempt<5 && await page.getByRole('textbox', {name:/JavaScript editor/}).isVisible();attempt++) {
            await page.waitForTimeout(1000);
            if (await page.getByRole('textbox', {name:/JavaScript editor/}).isVisible()) await page.getByRole('button', {name:'Convert code to Blocks',exact:true}).click();
        }
        await page.getByRole('textbox', {name:/JavaScript editor/}).waitFor({state:'hidden',timeout:10000});
        await page.waitForTimeout(1500);
        await page.screenshot({path:${JSON.stringify(screenshot)}});
        await page.getByRole('button', {name:'Convert code to JavaScript',exact:true}).click();
        await page.getByRole('textbox', {name:/JavaScript editor/}).waitFor();
        await page.waitForTimeout(500);
        const source = await page.evaluate(()=>monaco.editor.getModels().find(m=>m.uri.toString().endsWith('/main.ts')).getValue());
        return {name:${JSON.stringify(name)},target:await page.evaluate(()=>pxt.appTarget.versions),first,source};
    }`;
    const response=spawnSync(process.execPath,[cli,'-s=copilli','run-code',code],{cwd:root,encoding:'utf8',timeout:60000});
    const stdout=(response.stdout||'')+(response.stderr||'');fs.writeFileSync(path.join(output,name+'.log'),stdout);
    const match=/### Result\s+([\s\S]*?)\s+### Ran/.exec(stdout);
    let entry={name,status:'FAIL',error:response.error?.message||stdout};
    try{
        if(response.status!==0||!match)throw new Error(entry.error);
        const data=JSON.parse(match[1]);if(!data.source)throw new Error('Missing converted source');
        compile(options(data.source,data.source.includes('radio.'),name!=='native-v2'));
        assert.deepEqual(calls(data.source),calls(originals[name]),'Configured API arguments changed during roundtrip');
        fs.writeFileSync(path.join(output,name+'.ts'),data.source);
        entry={name,status:'PASS',target:data.target,roundtripCompilation:'microbit 8.0.22 / PXT 12.0.19',apiArgumentsPreserved:true,screenshot:path.relative(root,screenshot)};
        console.log(`${name}: web import, blocks roundtrip and pinned compilation PASS`);
    }catch(error){entry.error=error.message;console.error(`${name}: FAIL ${error.message.slice(0,250)}`);process.exitCode=1;}
    const previous=results.findIndex(r=>r.name===name);if(previous>=0)results[previous]=entry;else results.push(entry);
    fs.writeFileSync(reportFile,JSON.stringify(results,null,2));
    if(entry.status==='FAIL')break;
}
