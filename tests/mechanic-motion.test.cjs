const {test}=require('node:test');
const assert=require('node:assert/strict');
const {runtime}=require('./runtime.cjs');
const servo=r=>r.log.filter(x=>x[0]==='i2c'&&x[2].length===2).map(x=>x[2]);
function setup(){const r=runtime({advanceTime:true});r.api.iniciarMaqueen();r.api.configurarPinza(0,150,30);r.log.length=0;return r;}

test('direct servo test emits original Maqueen I2C packets without accessory configuration',()=>{
    const r=runtime();r.api.ponerServoGrados(0,80);assert.deepEqual(servo(r),[]);
    r.api.iniciarMaqueen();r.log.length=0;
    r.api.ponerServoGrados(0,80);r.api.ponerServoGrados(0,100);r.api.ponerServoGrados(1,90);
    assert.deepEqual(r.log,[['i2c',16,[20,80]],['i2c',16,[20,100]],['i2c',16,[21,90]]]);
    for(const [port,angle] of [[2,90],[NaN,90],[0,0],[0,180],[0,80.5],[0,NaN],[0,Infinity]])r.api.ponerServoGrados(port,angle);
    assert.equal(servo(r).length,3);
});
test('direct servo respects assigned limits and cancels gradual steps without losing target',()=>{
    const r=setup();r.api.establecerPosicionInicialMechanic(0,0);r.api.fijarRapidezMechanic(50);
    r.pauseHook=()=>{if(r.time===40)r.api.ponerServoGrados(0,90);};
    r.api.abrirPinza();assert.equal(r.api.objetivoMechanic(0),90);assert.equal(servo(r).at(-1)[1],90);
    const count=servo(r).length;r.api.ponerServoGrados(0,160);
    assert.equal(servo(r).length,count);assert.equal(r.api.objetivoMechanic(0),90);
    assert.match(r.api.diagnosticoMechanic(0),/límites/);
});
test('gripper missing profile retains rejected configuration reason and valid S1 sends close angle',()=>{
    const r=runtime();r.api.iniciarMaqueen();r.api.configurarPinza(0,0,0);r.api.cerrarPinza();
    assert.deepEqual(servo(r),[]);assert.match(r.api.diagnosticoMechanic(0),/configurar pinza.*rechazada/);
    r.api.configurarPinza(0,80,100);r.api.cerrarPinza();r.api.abrirPinza();
    assert.deepEqual(servo(r),[[20,100],[20,80]]);
});
for(const example of ['servo-s1-test','mechanic-beetle'])test(`${example}: actual A/B handlers send S1 packets`,()=>{
    const r=runtime();const buttons={};r.ctx.Button={A:0,B:1,AB:2};
    r.ctx.input.onButtonPressed=(button,handler)=>buttons[button]=handler;
    r.ctx.basic.showString=()=>{};
    r.loadExample(`examples/${example}/main.ts`);
    assert.deepEqual(servo(r),[]);
    buttons[0]();buttons[1]();buttons[2]();
    assert.deepEqual(servo(r),[[20,example==='mechanic-beetle'?30:80],[20,100]]);
});

test('Push reports missing configuration and rejects the old zero template without servo writes',()=>{
    const r=runtime();r.api.iniciarMaqueen();r.api.orientarSensor(1);
    assert.match(r.api.diagnosticoMechanic(3),/configurar sensor giratorio/);
    r.api.configurarSensorGiratorio(0,0,0,0);r.api.orientarSensor(0);
    assert.deepEqual(servo(r),[]);
    r.api.configurarSensorGiratorio(0,60,90,120);r.api.orientarSensor(1);
    assert.deepEqual(servo(r),[[20,90]]);
});
test('Push degree commands preserve exact degrees, zero reference, inverted mounts and limits on either port',()=>{
    for(const port of [0,1])for(const sign of [1,-1]) {
        const r=runtime();r.api.iniciarMaqueen();
        r.api.configurarSensorGiratorio(port,90-sign*40,90,90+sign*50);
        r.api.orientarSensorGrados(17);
        assert.deepEqual(servo(r),[[20+port,90+sign*17]]);
        r.api.establecerCeroSensor();assert.equal(servo(r).length,1);
        r.api.orientarSensorGrados(-7);assert.equal(servo(r).at(-1)[1],90+sign*10);
        r.api.girarSensorGrados(3);assert.equal(servo(r).at(-1)[1],90+sign*13);
        const count=servo(r).length;
        for(const angle of [100,-100,NaN,Infinity,0.5]) {
            r.api.orientarSensorGrados(angle);r.api.girarSensorGrados(angle);
        }
        assert.equal(servo(r).length,count);
        r.api.orientarSensor(0);assert.equal(servo(r).at(-1)[1],90-sign*40);
        r.api.orientarSensor(2);assert.equal(servo(r).at(-1)[1],90+sign*50);
        r.api.configurarSensorGiratorio(port,60,90,120);
        r.api.orientarSensorGrados(0);assert.equal(servo(r).at(-1)[1],90);
    }
});
test('Push degree commands require ready robot, known relative position and initialization for gradual motion',()=>{
    const r=runtime({advanceTime:true});
    r.api.orientarSensorGrados(0);r.api.girarSensorGrados(1);r.api.establecerCeroSensor();
    r.api.configurarSensorGiratorio(0,60,90,120);r.api.orientarSensorGrados(0);
    assert.deepEqual(servo(r),[]);
    r.api.iniciarMaqueen();r.api.girarSensorGrados(1);r.api.establecerCeroSensor();
    assert.deepEqual(servo(r),[]);
    r.api.fijarRapidezMechanic(50);r.api.orientarSensorGrados(10);
    assert.deepEqual(servo(r),[]);
    r.api.establecerPosicionInicialMechanic(3,50);
    let zeroed=false;
    r.pauseHook=()=>{if(!zeroed){zeroed=true;r.api.establecerCeroSensor();}};
    r.api.orientarSensorGrados(20);
    assert.equal(r.api.objetivoMechanic(3),90);
    r.pauseHook=undefined;r.api.girarSensorGrados(5);
    assert.equal(r.api.objetivoMechanic(3),95);
    r.api.orientarSensorGrados(0);assert.equal(r.api.objetivoMechanic(3),90);
    const profile=r.api.perfilMechanic(3);
    r.api.configurarSensorGiratorio(0,60,140,120);
    assert.equal(r.api.perfilMechanic(3),profile);
});
test('Push example initializes servo and buttons move in 10 degree increments',()=>{
    const r=runtime();const buttons={};let logo;
    r.ctx.Button={A:0,B:1};r.ctx.TouchButtonEvent={Pressed:0};
    r.ctx.input.onButtonPressed=(button,handler)=>buttons[button]=handler;
    r.ctx.input.onLogoEvent=(event,handler)=>logo=handler;
    r.loadExample('examples/mechanic-push/main.ts');
    assert.deepEqual(servo(r),[[20,90]]);
    buttons[0]();assert.equal(servo(r).at(-1)[1],80);
    buttons[1]();buttons[1]();assert.equal(servo(r).at(-1)[1],100);
    logo();assert.equal(servo(r).at(-1)[1],90);
});
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
