const {test}=require('node:test');
const assert=require('node:assert/strict');
const {runtime}=require('./runtime.cjs');
const servo=r=>r.log.filter(x=>x[0]==='i2c'&&x[2].length===2).map(x=>x[2]);
function setup(){const r=runtime({advanceTime:true});r.api.iniciarMaqueen();r.api.configurarPinza(0,150,30);r.log.length=0;return r;}
test('new axis positions support inverted calibration, elevation and Push piecewise front',()=>{
    const r=setup();r.api.configurarElevacionPinza(1,140,40);
    r.api.ponerEjeMechanic(0,25);r.api.ponerEjeMechanic(4,25);
    assert.deepEqual(servo(r),[[20,60],[21,115]]);
    r.api.quitarConfiguracionMechanic(1);r.api.configurarSensorGiratorio(1,20,120,160);
    for(const percent of [0,25,50,75,100])r.api.ponerEjeMechanic(3,percent);
    assert.deepEqual(servo(r).slice(-5),[[21,20],[21,70],[21,120],[21,140],[21,160]]);
});
test('global gradual speed requires explicit initial position and configuration never moves',()=>{
    const r=setup();r.api.fijarRapidezMechanic(50);r.api.abrirPinza();
    assert.deepEqual(servo(r),[]);assert.match(r.api.diagnosticoMechanic(0),/posición inicial/);
    r.api.establecerPosicionInicialMechanic(0,0);assert.deepEqual(servo(r),[[20,30]]);
    r.api.abrirPinza();const positions=servo(r).map(x=>x[1]);
    assert.equal(positions.at(-1),150);assert.ok(positions.length>20);
    assert.ok(positions.every((v,i)=>i===0||v>=positions[i-1]));
    assert.ok(r.time>=120/90*1000 && r.time<120/90*1000+20);
});
test('axis speed overrides global, -1 restores inheritance and 0 is immediate',()=>{
    const r=setup();r.api.establecerPosicionInicialMechanic(0,0);r.api.fijarRapidezMechanic(50);
    r.api.configurarRapidezEjeMechanic(0,100);r.api.abrirPinza();const fast=r.time;
    r.api.configurarRapidezEjeMechanic(0,-1);r.api.cerrarPinza();assert.ok(r.time-fast>fast);
    r.api.configurarRapidezEjeMechanic(0,0);const before=r.time; r.api.abrirPinza();assert.equal(r.time,before);
});
test('servo stop cancels future steps and does not disconnect or change last command',()=>{
    const r=setup();r.api.establecerPosicionInicialMechanic(0,0);r.api.fijarRapidezMechanic(50);
    r.pauseHook=()=>{if(r.time>=100)r.api.detenerMovimientoMechanic(0);};
    r.api.abrirPinza();assert.ok(r.api.objetivoMechanic(0)>30&&r.api.objetivoMechanic(0)<150);
    assert.equal(servo(r).at(-1)[1],r.api.objetivoMechanic(0));assert.equal(r.time,100);
});
test('replacement trajectory wins and changing speed does not modify active motion',()=>{
    const r=setup();r.api.establecerPosicionInicialMechanic(0,0);r.api.fijarRapidezMechanic(50);
    let once=false;r.pauseHook=()=>{if(!once){once=true;r.api.fijarRapidezMechanic(100);r.api.ponerEjeMechanic(0,25);}};
    r.api.abrirPinza();assert.equal(r.api.objetivoMechanic(0),60);assert.equal(servo(r).at(-1)[1],60);
    const s=setup();s.api.establecerPosicionInicialMechanic(0,0);s.api.fijarRapidezMechanic(50);
    s.pauseHook=()=>s.api.fijarRapidezMechanic(100);s.api.abrirPinza();assert.ok(s.time>=1333);
});
test('reconfiguring or removing profile interrupts old trajectory without later writes',()=>{
    for(const remove of [false,true]){
        const r=setup();r.api.establecerPosicionInicialMechanic(0,0);r.api.fijarRapidezMechanic(50);
        let count;
        r.pauseHook=()=>{if(r.time===40){if(remove)r.api.quitarConfiguracionMechanic(0);else r.api.configurarPinza(0,140,40);count=servo(r).length;}};
        r.api.abrirPinza();assert.equal(servo(r).length,count);assert.equal(r.api.objetivoMechanic(0),-1);
    }
});
test('different axes operate independently and wheel stop leaves servo trajectory intact',()=>{
    const r=setup();r.api.configurarElevacionPinza(1,20,80);
    r.api.establecerPosicionInicialMechanic(0,0);r.api.establecerPosicionInicialMechanic(4,0);r.api.fijarRapidezMechanic(100);
    let once=false;r.pauseHook=()=>{if(!once){once=true;r.api.detener();r.api.ponerEjeMechanic(4,100);}};
    r.api.abrirPinza();assert.equal(r.api.objetivoMechanic(0),150);assert.equal(r.api.objetivoMechanic(4),80);
});
test('invalid axis, percentages and speed values emit no servo commands',()=>{
    const r=setup();
    for(const p of [-1,101,NaN,Infinity]){r.api.ponerEjeMechanic(0,p);r.api.establecerPosicionInicialMechanic(0,p);}
    r.api.ponerEjeMechanic(5,50);r.api.fijarRapidezMechanic(0);r.api.configurarRapidezEjeMechanic(0,Infinity);
    assert.deepEqual(servo(r),[]);r.api.abrirPinza();assert.deepEqual(servo(r),[[20,150]]);
});
