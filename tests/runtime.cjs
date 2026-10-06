// Auxiliary Node execution of the real TypeScript. PXT validation is separate.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const files = require('../pxt.json').files.map(f => path.join(root, f));
const program = ts.createProgram(files, { target: ts.ScriptTarget.ES2017, module: ts.ModuleKind.None });
const emitted = [];
program.emit(undefined, (file, source) => { if (file.endsWith('.js')) emitted.push(source); });

function runtime(options = {}) {
    const log = [], loops = [], queue = [];
    const digital = {}, analog = { 1: 512, 2: 512 };
    let now = 0, pulse = 0, pauseHook, heading = 0, headingHook;
    const ctx = vm.createContext({
        DigitalPin: { P1:1, P2:2, P8:8, P12:12, P13:13, P14:14, P15:15, P16:16 },
        AnalogPin: { P1:1, P2:2 }, PinPullMode: { PullNone:0, PullUp:1 }, PulseValue: { High:1, Low:0 },
        input: {
            compassHeading: () => headingHook ? headingHook() : heading,
            calibrateCompass: () => log.push(['calibrateCompass'])
        },
        pins: {
            createBuffer: n => new Uint8Array(n),
            i2cWriteBuffer: (address, buffer) => log.push(['i2c', address, [...buffer]]),
            digitalWritePin: (pin, value) => log.push(['write', pin, value]),
            digitalReadPin: pin => { log.push(['read',pin]); return digital[pin] ?? 1; },
            analogReadPin: pin => { log.push(['analog',pin]); return analog[pin]; },
            setPull: (pin, mode) => log.push(['pull',pin,mode]),
            pulseIn: (pin, level, timeout) => { log.push(['pulse',pin,level,timeout]); return pulse; }
        },
        basic: {
            forever: fn => loops.push(fn),
            pause: ms => { log.push(['pause',ms]); if (options.advanceTime) now += ms; if (pauseHook) pauseHook(ms); }
        },
        control: {
            millis: () => now,
            inBackground: fn => queue.push(fn),
            assert: (ok, message) => { if (!ok) throw new Error(message); }
        }
    });
    vm.runInContext('Math.idiv=(a,b)=>Math.trunc(a/b); Array.prototype.removeAt=function(i){this.splice(i,1)}',ctx);
    for (const source of emitted) vm.runInContext(source, ctx);
    return {
        ctx, api:ctx.copilli, log, loops, queue, digital, analog,
        set time(value) { now = value; }, get time() { return now; },
        set pulse(value) { pulse = value; },
        set heading(value) { heading = value; }, get heading() { return heading; },
        set headingHook(value) { headingHook = value; },
        set pauseHook(value) { pauseHook = value; },
        sample(times=3) { for(let i=0;i<times;i++) { now += 10; loops.forEach(fn=>fn()); } },
        flush() { while(queue.length) queue.shift()(); },
        loadExample(file, source) {
            let stringHandler, valueHandler;
            ctx.radio = {
                setGroup() {},
                onReceivedString: fn => { stringHandler=fn; },
                onReceivedValue: fn => { valueHandler=fn; }
            };
            vm.runInContext(ts.transpileModule(source ?? fs.readFileSync(path.join(root,file),'utf8'),{
                compilerOptions:{target:ts.ScriptTarget.ES2017}
            }).outputText,ctx);
            return { string: msg=>stringHandler(msg), value:(key,value)=>valueHandler(key,value) };
        }
    };
}
module.exports = { runtime, root };
