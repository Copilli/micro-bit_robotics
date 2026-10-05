const {test}=require('node:test');const assert=require('node:assert/strict');const {runtime}=require('./runtime.cjs');
test('School DFR0536 V2: four digital directions, X/Y events and no analog/P16 access',()=>{
    const r=runtime();r.api.iniciarGamepadBotones();assert.equal(r.api.gamepadPreparado(),true);
    assert.ok(r.log.filter(x=>x[0]==='pull').every(x=>x[1]!==16&&x[2]===1));
    r.log.length=0;assert.equal(r.api.mandoHacia(4),true);
    for(const [pin,direction,x,y] of [[8,0,0,100],[13,1,0,-100],[14,2,-100,0],[15,3,100,0]]){
        r.digital[pin]=0;assert.equal(r.api.mandoHacia(direction),true);assert.equal(r.api.mandoX(),x);assert.equal(r.api.mandoY(),y);r.digital[pin]=1;
    }
    r.digital[14]=0;r.digital[15]=0;assert.equal(r.api.mandoX(),0);r.digital[14]=1;r.digital[15]=1;
    let x=0,y=0,up=0;r.api.alPulsarBoton(5,()=>x++);r.api.alPulsarBoton(6,()=>y++);r.api.alPulsarBoton(7,()=>up++);
    r.digital[1]=0;r.digital[2]=0;r.digital[8]=0;r.sample();r.flush();assert.deepEqual([x,y,up],[1,1,1]);r.sample(10);r.flush();assert.equal(x,1);
    r.api.joystickX();r.api.calibrarCentroGamepad();r.api.botonPresionado(0);r.api.alPulsarBoton(0,()=>{throw new Error('V4 handler on V2');});
    assert.ok(r.log.every(e=>e[0]!=='analog'&&e[1]!==16));
    const before=r.log.length;r.api.iniciarGamepad();assert.equal(r.log.length,before);assert.match(r.api.diagnosticoGamepad(),/Perfil rechazado/);
    r.api.iniciarMaqueen();assert.equal(r.log.length,before);r.api.iniciarGamepadBotones();assert.equal(r.loops.length,1);
});
