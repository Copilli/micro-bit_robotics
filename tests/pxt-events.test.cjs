// Real PXT compiler and cooperative simulator runtime, with injected hardware shims.
const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');
const {options,compile}=require('../scripts/pxt-memory.cjs');
test('H02/H12: PXT fibers allow D and release while C pauses, with bounded reentry',async()=>{
    const main=fs.readFileSync(__dirname+'/pxt-events.ts','utf8');const compiled=compile(options(main));
    const sandbox=vm.createContext({console,setTimeout,clearTimeout,setInterval,clearInterval,performance,Promise,Uint8Array,Buffer});
    vm.runInContext(fs.readFileSync(require.resolve('pxt-core/built/pxtsim.js'),'utf8'),sandbox);
    const sim=sandbox.pxsim,digital={13:1,14:1,15:1,16:1,8:1};
    let log=[],runtime;
    await new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>{runtime?.kill();reject(new Error('PXT event regression timed out'));},6000);
        sim.initCurrentRuntime=()=>{
            sim.initBareRuntime();
            // Same delegation used by pxt-microbit/built/sim.js (basic.forever).
            sim.basic.forever=sim.thread.forever;
            sim.pins.setPull=()=>{};
            sim.pins.digitalReadPin=pin=>{log.push(['read',pin,digital[pin]??1]);return digital[pin]??1;};
            sim.pins.digitalWritePin=(pin,value)=>{log.push(['write',pin,value]);digital[pin]=value;};
            sim.control.millis=()=>Date.now();
            sim.serial.writeString=message=>{log.push(message);if(message==='PXT EVENTS PASS'){clearTimeout(timer);runtime.kill();resolve();}};
        };
        runtime=new sim.Runtime({type:'run',code:compiled.outfiles['binary.js']});
        runtime.errorHandler=error=>{clearTimeout(timer);runtime.kill();error.message+=' '+JSON.stringify(log.slice(-30));reject(error);};
        runtime.run(()=>{});
    });
    assert.ok(log.includes('PXT EVENTS PASS'));
});
