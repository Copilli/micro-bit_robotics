const {test} = require('node:test');
const assert = require('node:assert/strict');
const {runtime} = require('./runtime.cjs');
const motors = r => r.log.filter(x => x[0] === 'i2c' && x[2].length === 3).map(x => x[2]);
const last = r => motors(r).slice(-2);
function setup() { const r = runtime({advanceTime:true}); r.api.iniciarMaqueen(); r.log.length=0; return r; }
function compass(r, h=0) { r.heading=h; r.api.prepararBrujula(); r.log.length=0; }

test('configuration touches no hardware and invalid values keep current defaults', () => {
    const r=runtime(); const a=r.api;
    a.fijarPotenciaMovimiento(40); a.fijarPotenciaGiro(30); a.ajustarBalanceRuedas(0);
    a.configurarMinimosRuedas(0,0); a.mantenerRumboConBrujula(false);
    a.configurarCorreccionRumbo(0.5,15); a.configurarToleranciaGiro(5); a.calibrarRecorrido(0,20,2);
    assert.deepEqual(r.log,[]);
    a.fijarPotenciaMovimiento(Infinity); a.ajustarBalanceRuedas(NaN); a.configurarMinimosRuedas(61,0);
    a.iniciarMaqueen(); a.moverContinuamente(0);
    assert.deepEqual(last(r),[[0,0,102],[2,0,102]]);
});
test('legacy orders also map minima then balance, with zero always stopped', () => {
    const r=setup(); r.api.configurarMinimosRuedas(20,10); r.api.ajustarBalanceRuedas(20);
    r.api.moverRuedas(-50,50);
    assert.deepEqual(last(r),[[0,1,153],[2,0,112]]);
    r.api.ajustarBalanceRuedas(-30); r.api.avanzar(100);
    assert.deepEqual(last(r),[[0,0,179],[2,0,255]]);
    r.api.avanzar(0); assert.deepEqual(last(r),[[0,0,0],[2,0,0]]);
});
test('timed motion uses elapsed time, stops and rejects durations over 120s', () => {
    const r=setup(); let n=0;
    r.pauseHook=() => { if (++n===1) r.time+=80; };
    r.api.moverPor(1,0.1,0);
    assert.equal(r.time,100); assert.deepEqual(last(r),[[0,0,0],[2,0,0]]);
    assert.ok(motors(r).some(x=>x[1]===1 && x[2]===102));
    r.api.moverPor(0,121,0); assert.match(r.api.diagnosticoRobot(),/120/);
});
test('power changes only affect subsequent orders', () => {
    const r=setup(); let once=false;
    r.pauseHook=()=>{if(!once){once=true; r.api.fijarPotenciaMovimiento(80);}};
    r.api.moverPor(0,0.1,0);
    assert.ok(motors(r).filter(x=>x[2]>0).every(x=>x[2]===102));
    r.api.moverContinuamente(0); assert.deepEqual(last(r),[[0,0,204],[2,0,204]]);
});
test('stop cancels pending timed operation and a replacement cannot be stopped by old fiber', () => {
    for(const replacement of [false,true]) {
        const r=setup(); let once=false;
        r.pauseHook=()=>{if(!once){once=true; if(replacement) r.api.retroceder(60); else r.api.detener();}};
        r.api.moverPor(0,1,0);
        assert.equal(r.time,20);
        assert.deepEqual(last(r),replacement?[[0,1,153],[2,1,153]]:[[0,0,0],[2,0,0]]);
    }
});
test('cm calibration is directional, estimates time and rejects absent/stale calibration', () => {
    const r=setup(); r.api.calibrarRecorrido(0,20,2); assert.equal(r.api.recorridoCalibrado(0),true);
    r.api.moverPor(0,5,1); assert.equal(r.time,500);
    r.api.moverPor(1,5,1); assert.match(r.api.diagnosticoRobot(),/calibración/);
    r.api.calibrarRecorrido(1,10,2); r.api.moverPor(1,5,1); assert.equal(r.time,1500);
    r.api.fijarPotenciaMovimiento(50); r.api.fijarPotenciaMovimiento(40);
    assert.equal(r.api.recorridoCalibrado(0),false);
});
test('all trajectory settings invalidate calibration, unchanged values do not', () => {
    for(const change of [a=>a.ajustarBalanceRuedas(5),a=>a.configurarMinimosRuedas(1,0),
        a=>a.mantenerRumboConBrujula(true),a=>a.configurarCorreccionRumbo(1,15)]) {
        const r=setup(); r.api.calibrarRecorrido(0,20,2); change(r.api);
        assert.equal(r.api.recorridoCalibrado(0),false);
    }
    const r=setup(); r.api.calibrarRecorrido(0,20,2); r.api.fijarPotenciaMovimiento(40);
    r.api.fijarPotenciaGiro(50); assert.equal(r.api.recorridoCalibrado(0),true);
    r.api.calibrarRecorrido(0,0,2); assert.equal(r.api.recorridoCalibrado(0),true);
});
test('invalid enums, nonfinite quantities and zero produce no movement', () => {
    for(const [direction,amount,unit] of [[2,1,0],[0,-1,0],[0,Infinity,0],[0,NaN,0],[0,1,3],[0,0,1]]) {
        const r=setup(); r.api.moverPor(direction,amount,unit);
        assert.ok(motors(r).every(x=>x[2]===0));
    }
    for(const [direction,amount,unit] of [[2,90,0],[0,-1,0],[0,Infinity,0],[0,361,0],[0,121,1],[0,1,3],[0,0,0]]) {
        const r=setup(); r.api.girarPor(direction,amount,unit);
        assert.ok(motors(r).every(x=>x[2]===0));
    }
});
test('compass preparation stops first and degrees require explicit preparation', () => {
    const r=setup(); r.api.girarPor(1,90,0); assert.match(r.api.diagnosticoRobot(),/Prepara la brújula/);
    r.api.prepararBrujula(); const index=r.log.findIndex(x=>x[0]==='calibrateCompass');
    assert.ok(index>=2); assert.deepEqual(r.log.slice(index-2,index).map(x=>x[2]),[[0,0,0],[2,0,0]]);
    assert.equal(r.api.brujulaPreparada(),true);
});
for(const direction of [0,1]) for(const angle of [90,180,360]) {
    test(`compass turn ${direction===0?'left':'right'} ${angle}° crosses north and slows near target`, () => {
        const r=setup(); compass(r,direction===0?10:350); let progress=0;
        r.pauseHook=()=>{progress+=5; r.heading=(r.heading+(direction===0?-5:5)+360)%360;};
        r.api.girarPor(direction,angle,0);
        assert.ok(progress>=angle-5 && progress<=angle);
        assert.equal(r.api.diagnosticoRobot(),'');
        assert.ok(motors(r).some(x=>x[2]===38)); // 15% -> 38
        assert.deepEqual(last(r),[[0,0,0],[2,0,0]]);
    });
}
test('compass invalid reading, jump and no progress stop with diagnosis', () => {
    for(const mode of ['invalid','jump','still','wrong-way']) {
        const r=setup(); compass(r); r.pauseHook=()=>{
            if(mode==='invalid')r.heading=-1003;
            if(mode==='jump')r.heading=100;
            if(mode==='wrong-way')r.heading=(r.heading-1+360)%360;
        };
        r.api.girarPor(1,90,0);
        assert.notEqual(r.api.diagnosticoRobot(),'');
        assert.ok(r.time<=2500); assert.deepEqual(last(r),[[0,0,0],[2,0,0]]);
    }
});
test('slow progressing turn reaches 30s maximum', () => {
    const r=setup(); compass(r); let samples=0;
    r.pauseHook=()=>{if(++samples%50===0)r.heading=(r.heading+1)%360;};
    r.api.girarPor(1,360,0); assert.equal(r.time,30500);
    assert.match(r.api.diagnosticoRobot(),/tiempo máximo/);
});
test('timed turning does not read or require compass and uses configured turn power', () => {
    const r=setup(); r.headingHook=()=>{throw Error('unexpected compass');};
    r.api.fijarPotenciaGiro(50); r.api.girarPor(0,0.1,1);
    assert.equal(r.time,100); assert.ok(motors(r).some(x=>x[1]===1 && x[2]===128));
    assert.deepEqual(last(r),[[0,0,0],[2,0,0]]);
});
test('heading correction steers left for positive heading error, also in reverse', () => {
    for(const direction of [0,1]) {
        const r=setup(); compass(r,350); r.api.mantenerRumboConBrujula(true);
        let correction;
        r.pauseHook=()=>{r.heading=10; if(r.time>=540)correction=last(r);};
        r.api.moverPor(direction,0.06,0);
        assert.deepEqual(correction,direction===0?[[0,0,77],[2,0,128]]:[[0,1,128],[2,1,77]]);
    }
});
test('continuous heading correction starts promptly and is cancelled by replacement', () => {
    const r=setup(); compass(r); r.api.mantenerRumboConBrujula(true);
    r.api.moverContinuamente(0); assert.equal(r.queue.length,1);
    assert.deepEqual(last(r),[[0,0,102],[2,0,102]]);
    r.api.retroceder(70); const count=motors(r).length; r.flush();
    assert.equal(motors(r).length,count); assert.deepEqual(last(r),[[0,1,179],[2,1,179]]);
});
test('cancel during a compass read never reactivates motors or stops replacement', () => {
    const r=setup(); compass(r); let n=0;
    r.headingHook=()=>{if(++n===2)r.api.retroceder(80);return 0;};
    r.api.girarPor(1,90,0);
    assert.deepEqual(last(r),[[0,1,204],[2,1,204]]);
});
