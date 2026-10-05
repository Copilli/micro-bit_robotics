const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { runtime, root } = require('./runtime.cjs');
const i2c = r => r.log.filter(x=>x[0]==='i2c');
const last = r => i2c(r).slice(-2).map(x=>x[2]);

test('H09: import and configuration do not access hardware',()=>{
    const r=runtime(); assert.deepEqual(r.log,[]); assert.equal(r.loops.length,0);
    r.api.configurarPinza(0,30,100); r.api.configurarElevacionPinza(1,120,60);
    r.api.perfilMechanic(0);r.api.objetivoMechanic(4);r.api.resultadoConfiguracionMechanic(4);
    assert.deepEqual(r.log,[]);
});
for(const [first,second] of [['iniciarMaqueen','iniciarGamepad'],['iniciarGamepad','iniciarMaqueen']]) {
    test(`H10: ${first} rejects ${second} before hardware and keeps first role`,()=>{
        const r=runtime();r.api[first]();const before=r.log.length,loops=r.loops.length;
        r.api[second]();assert.equal(r.log.length,before);assert.equal(r.loops.length,loops);
        assert.match(r.api.diagnostico(),/Rol rechazado/);r.api[first]();assert.equal(r.log.length,before);
        if(first==='iniciarMaqueen'){assert.equal(r.api.gamepadPreparado(),false);r.api.vibrar(100);r.api.joystickX();}
        else {assert.equal(r.api.maqueenPreparado(),false);r.api.avanzar(50);r.api.distanciaCm();}
        assert.equal(r.log.length,before);
    });
}
test('H09/H12: actual motor buffers, stop, signed limits and legacy turn',()=>{
    const r=runtime();r.api.iniciarMaqueen();assert.deepEqual(i2c(r),[['i2c',16,[0,0,0]],['i2c',16,[2,0,0]]]);
    r.api.moverRuedas(-200,50);assert.deepEqual(last(r),[[0,1,255],[2,0,128]]);
    r.api.girarHacia(0,40);assert.deepEqual(last(r),[[0,1,102],[2,0,102]]);
    r.api.girar(2,40);assert.deepEqual(last(r),[[0,0,0],[2,0,0]]);
    r.api.avanzar(NaN);assert.deepEqual(last(r),[[0,0,0],[2,0,0]]);
});
test('H05/H09: headlights write their own pins; legacy RGB explicitly unavailable',()=>{
    const r=runtime();r.api.iniciarMaqueen();r.log.length=0;r.api.faros(2,true);
    assert.deepEqual(r.log,[['write',8,1],['write',12,1]]);
    r.log.length=0;r.api.lucesInferiores(0xff0000);r.api.apagarLucesInferiores();
    assert.deepEqual(r.log,[]);assert.match(r.api.diagnosticoRobot(),/no implementado/);
});
test('H06: percent of each calibrated half-axis, boundaries and inversion',()=>{
    const f=runtime().ctx.copilliLogic.normalizeAxis;
    for(const center of [100,512,923]) {
        assert.equal(f(0,center,30,false),-100);assert.equal(f(1023,center,30,false),100);
        assert.equal(f(center,center,30,false),0);assert.equal(f(0,center,30,true),100);
        assert.equal(f(1023,center,30,true),-100);
        let previous=-100;for(let raw=0;raw<=1023;raw++){const value=f(raw,center,30,false);assert.ok(value>=previous);assert.ok(value-previous<=2);previous=value;}
    }
    assert.equal(f(150,500,30,false),-57);assert.equal(f(350,500,30,false),0);
    assert.equal(f(351,500,30,false),0);assert.equal(f(0,0,30,false),0);assert.equal(f(NaN,512,15,false),0);
});
test('H06: calibration accepts useful asymmetric range and rejects invalid range atomically',()=>{
    const r=runtime();r.api.iniciarGamepad();r.analog[1]=100;r.analog[2]=923;r.api.calibrarCentroGamepad();r.api.configurarZonaMuerta(30);
    r.analog[1]=0;assert.equal(r.api.joystickX(),-100);r.analog[1]=1023;assert.equal(r.api.joystickX(),100);
    r.analog[1]=99;r.api.calibrarCentroGamepad();assert.match(r.api.diagnosticoGamepad(),/rechazada/);
    r.analog[1]=0;assert.equal(r.api.joystickX(),-100);
    r.analog[1]=NaN;r.api.calibrarCentroGamepad();assert.match(r.api.diagnosticoGamepad(),/rechazada/);
    r.analog[1]=0;assert.equal(r.api.joystickX(),-100);
});
for(const [level,expectedWrites,pulseLevel] of [[0,[1,0,0,1,0],1],[1,[1,0,1,0,0],0]]) {
    test(`H07: real trigger sequence at initial echo level ${level}`,()=>{
        const r=runtime();r.api.iniciarMaqueen();r.log.length=0;r.digital[2]=level;r.pulse=1180;
        assert.equal(r.api.distanciaCm(),20);
        assert.deepEqual(r.log.filter(x=>x[0]==='write'),expectedWrites.map(v=>['write',1,v]));
        assert.deepEqual(r.log.filter(x=>x[0]==='pause'),[['pause',1],['pause',20]]);
        assert.deepEqual(r.log.filter(x=>x[0]==='pulse'),[['pulse',2,pulseLevel,29000]]);
        for(const pulse of [0,-1,29000]){r.pulse=pulse;assert.equal(r.api.distanciaCm(),-1);}
        r.pulse=590;assert.equal(r.api.distanciaCm(),10);
    });
}
test('H07: obstacle example stops for invalid readings using actual sensor code',()=>{
    const r=runtime();r.loadExample('examples/maqueen-obstacle/main.ts');r.pulse=0;r.loops[0]();assert.deepEqual(last(r),[[0,0,0],[2,0,0]]);
    r.pulse=1180;r.loops[0]();assert.deepEqual(last(r),[[0,0,77],[2,0,77]]);
});
test('H08/B: independent opening/lift profiles, targets, rejection and later success',()=>{
    const r=runtime();r.api.configurarPinza(1,30,100);r.api.configurarElevacionPinza(0,120,60);r.api.iniciarMaqueen();
    r.api.abrirPinza();assert.deepEqual(i2c(r).at(-1),['i2c',16,[21,30]]);assert.equal(r.api.objetivoMechanic(4),-1);
    r.api.subirPinza();assert.deepEqual(i2c(r).at(-1),['i2c',16,[20,60]]);assert.equal(r.api.objetivoMechanic(0),30);
    r.api.bajarPinza();assert.deepEqual(i2c(r).at(-1),['i2c',16,[20,120]]);r.api.cerrarPinza();assert.deepEqual(i2c(r).at(-1),['i2c',16,[21,100]]);
    const profile=r.api.perfilMechanic(0),before=r.log.length;r.api.configurarPinza(1,0,0);
    assert.equal(r.api.perfilMechanic(0),profile);assert.equal(r.log.length,before);
    assert.match(r.api.resultadoConfiguracionMechanic(0),/continúa vigente la anterior/);
    r.api.iniciarMaqueen();assert.match(r.api.diagnosticoMechanic(0),/rechazada/);
    r.api.configurarElevacionPinza(0,125,65);assert.match(r.api.diagnosticoMechanic(0),/rechazada/);
    r.api.configurarPinza(0,35,105);assert.match(r.api.resultadoConfiguracionMechanic(0),/otro mecanismo/);
    r.api.configurarPinza(9,35,105);assert.match(r.api.resultadoConfiguracionMechanic(0),/puerto/);
    r.api.configurarPinza(1,35,105);assert.match(r.api.resultadoConfiguracionMechanic(0),/aceptada/);
    assert.equal(r.api.diagnosticoMechanic(0),'');assert.equal(r.api.objetivoMechanic(0),-1);
});
test('H09: Loader, Forklift, Push endpoints and port release',()=>{
    const r=runtime();r.api.iniciarMaqueen();
    for(const [configure,down,up] of [['configurarPala','bajarPala','subirPala'],['configurarHorquillas','bajarHorquillas','subirHorquillas']]){
        r.api.quitarConfiguracionMechanic(0);r.api[configure](0,120,60);r.api[down]();assert.deepEqual(i2c(r).at(-1)[2],[20,120]);r.api[up]();assert.deepEqual(i2c(r).at(-1)[2],[20,60]);
    }
    r.api.configurarSensorGiratorio(1,40,90,140);for(const [direction,angle] of [[0,40],[1,90],[2,140]]){r.api.orientarSensor(direction);assert.deepEqual(i2c(r).at(-1)[2],[21,angle]);}
    const before=r.log.length;r.api.orientarSensor(9);r.api.configurarSensorGiratorio(1,40,40,140);assert.equal(r.log.length,before);
    r.api.quitarConfiguracionMechanic(1);r.api.orientarSensor(1);assert.equal(r.log.length,before);
});
test('H02/H12: multiple listeners, cooperative pause, release and bounded busy reentry',()=>{
    const r=runtime();let c=0,d=0,released=0,second=0;
    r.api.alPulsarBoton(0,()=>{c++;r.ctx.basic.pause(1000);});r.api.alPulsarBoton(0,()=>second++);
    r.api.alPulsarBoton(1,()=>d++);r.api.alSoltarBoton(0,()=>released++);
    r.api.iniciarGamepad();r.api.iniciarGamepad();assert.equal(r.loops.length,1);
    r.digital[13]=0;r.sample();assert.equal(c,0);assert.equal(r.queue.length,2);
    r.pauseHook=ms=>{if(ms!==1000)return;
        r.digital[13]=1;r.digital[14]=0;r.sample();assert.equal(r.api.botonPresionado(0),false);
        r.flush();assert.equal(d,1);assert.equal(released,1);
        // A new C transition while the first listener remains busy: no second C execution.
        r.digital[13]=0;r.sample();r.flush();assert.equal(c,1);
    };
    r.flush();assert.equal(c,1);assert.equal(second,2);assert.equal(r.queue.length,0);
    r.sample(10);r.flush();assert.equal(c,1);
});
test('H02: alternating bounce never dispatches; listener registrations are capped',()=>{
    const r=runtime();let called=0;r.api.alPulsarBoton(0,()=>called++);r.api.iniciarGamepad();
    for(let i=0;i<20;i++){r.digital[13]=i%2;r.sample(1);r.flush();}assert.equal(called,0);
    for(let i=0;i<40;i++)r.api.alPulsarBoton(0,()=>called++);
    assert.match(r.api.diagnosticoGamepad(),/32/);r.digital[13]=0;r.sample();assert.equal(r.queue.length,32);
});
test('H09: vibration clamps time, drops overlap, switches output off',()=>{
    const r=runtime();r.api.iniciarGamepad();r.log.length=0;
    r.pauseHook=ms=>{if(ms===5000)r.api.vibrar(200);};r.api.vibrar(8000);
    assert.deepEqual(r.log,[['write',12,1],['pause',5000],['write',12,0]]);
    r.log.length=0;r.api.vibrar(NaN);r.api.vibrar(0);assert.deepEqual(r.log,[]);
});
test('H03/H09: all manifests, radio declarations, local paths and block IDs',()=>{
    let projects=0;const path=require('node:path');
    function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory()&&!['built','pxt_modules'].includes(entry.name))walk(p);else if(entry.name==='pxt.json'){projects++;const cfg=JSON.parse(fs.readFileSync(p));const main=fs.readFileSync(path.join(dir,'main.ts'),'utf8');if(main.includes('radio.'))assert.equal(cfg.dependencies.radio,'*');for(const source of cfg.files)assert.ok(fs.existsSync(path.join(dir,source)));const local=cfg.dependencies['robotics'];if(local)assert.equal(path.resolve(dir,local.slice(5)),root);}}}
    walk(path.join(root,'examples'));assert.ok(projects>=15);
    const ids=[];for(const file of require('../pxt.json').files){const source=fs.readFileSync(path.join(root,file),'utf8');assert.doesNotMatch(source,/\bradio\s*\./);for(const match of source.matchAll(/blockId=([^\s]+)/g))ids.push(match[1]);}
    assert.equal(ids.length,new Set(ids).size);assert.equal(require('../pxt.json').dependencies.radio,undefined);
});
