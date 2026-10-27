const {test}=require('node:test');
const assert=require('node:assert/strict');
const {runtime}=require('./runtime.cjs');
const packets=r=>r.log.filter(x=>x[0]==='i2c').map(x=>x[2]);

test('Mechanic model selector applies usable defaults without movement and adjusts each profile',()=>{
    for(const [model,low,front,high]of [[0,100,100,30],[1,120,120,60],[2,120,120,60],[3,40,90,140],[4,120,120,60]]) {
        const r=runtime();r.api.configurarMechanic(model,0);assert.deepEqual(r.log,[]);
        assert.equal(r.api.perfilMechanic(model),`S1: ${low}/${front}/${high}`);
        r.api.iniciarMaqueen();r.log.length=0;r.api.ponerMechanic(model,0);r.api.ponerMechanic(model,100);
        assert.deepEqual(packets(r),[[20,low],[20,high]]);
        r.api.ajustarLimitesMechanic(model,60,120);r.api.ponerAnguloMechanic(model,73);
        assert.deepEqual(packets(r).at(-1),[20,73]);
        const count=r.log.length;r.api.ponerAnguloMechanic(model,130);assert.equal(r.log.length,count);
    }
});
test('Mechanic selector replaces occupied port and invalid overrides preserve current settings',()=>{
    const r=runtime();r.api.configurarMechanic(0,0);r.api.configurarMechanic(1,0);
    assert.equal(r.api.mechanicConfigurado(0),false);assert.equal(r.api.mechanicConfigurado(1),true);
    r.api.configurarMechanic(3,1);r.api.ajustarLimitesMechanic(3,140,40,100);
    const profile=r.api.perfilMechanic(3);
    r.api.ajustarLimitesMechanic(3,0,0);r.api.configurarMechanic(3,5);
    assert.equal(r.api.perfilMechanic(3),profile);assert.deepEqual(r.log,[]);
    r.api.iniciarMaqueen();r.api.ponerMechanic(3,50);r.api.establecerCeroMechanic(3);
    r.api.orientarMechanicGrados(3,7);assert.deepEqual(packets(r).at(-1),[21,93]);
    r.api.girarMechanicGrados(3,-3);assert.deepEqual(packets(r).at(-1),[21,96]);
});
