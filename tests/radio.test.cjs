const {test}=require('node:test');const assert=require('node:assert/strict');const {runtime}=require('./runtime.cjs');
const fs=require('node:fs');const path=require('node:path');const {root}=require('./runtime.cjs');
function receiver(){const r=runtime(),events=r.loadExample('examples/radio-proportional/robot/main.ts');r.log.length=0;return {r,...events};}
const commands=r=>r.log.filter(x=>x[0]==='i2c').map(x=>x[2]);
const stopped=r=>assert.deepEqual(commands(r).slice(-2),[[0,0,0],[2,0,0]]);
for(const axis of ['x','y'])test(`H01: only ${axis} at startup never moves`,()=>{const {r,value}=receiver();for(r.time=0;r.time<1000;r.time+=100)value(axis,80);assert.ok(commands(r).every(p=>p[2]===0));});
test('H01: a recent pair gives the expected differential drive',()=>{const {r,value}=receiver();value('x',20);value('y',40);assert.deepEqual(commands(r).slice(-2),[[0,0,153],[2,0,51]]);});
for(const stale of ['x','y'])test(`H01: fresh other axis cannot prolong stale ${stale}`,()=>{const {r,value}=receiver();value(stale,80);value(stale==='x'?'y':'x',0);for(r.time=100;r.time<=900;r.time+=100)value(stale==='x'?'y':'x',0);stopped(r);});
test('H01: timeout and a single axis cannot restart; new zero pair discards old drive',()=>{const {r,value}=receiver();value('x',0);value('y',80);r.time=500;r.loops[0]();stopped(r);const before=commands(r).length;r.time=510;value('x',0);assert.equal(commands(r).length,before);value('y',0);stopped(r);});
test('H01: expired sample before periodic watchdog cannot reuse its partner',()=>{const {r,value}=receiver();value('x',60);value('y',80);r.time=501;value('x',0);stopped(r);value('y',30);assert.deepEqual(commands(r).slice(-2),[[0,0,77],[2,0,77]]);});
test('H01: accessory, unknown and invalid messages never renew axes; explicit stop invalidates',()=>{const {r,value,string}=receiver();value('x',0);value('y',80);r.time=400;string('abrir');value('other',0);value('x',NaN);value('y',101);r.time=500;r.loops[0]();stopped(r);value('x',0);value('y',30);string('parar');const before=commands(r).length;value('x',90);assert.equal(commands(r).length,before);value('y',0);assert.deepEqual(commands(r).slice(-2),[[0,0,230],[2,1,230]]);});
test('H01: unknown first packet after expiry also discards stale axes',()=>{const {r,value}=receiver();value('x',0);value('y',80);r.time=700;value('accessory',0);stopped(r);const before=commands(r).length;value('x',0);assert.equal(commands(r).length,before);});

for(const kind of ['drive','mechanic','loader','forklift','lifting-gripper'])test(`H09/H11: real radio-${kind} accessory traffic never prolongs drive or moves servo on timeout`,()=>{
    const r=runtime(),{string}=r.loadExample(`examples/radio-${kind}/robot/main.ts`);
    if(kind==='mechanic')r.api.configurarPinza(0,30,100);
    if(kind==='loader')r.api.configurarPala(0,120,60);
    if(kind==='forklift')r.api.configurarHorquillas(0,120,60);
    if(kind==='lifting-gripper'){r.api.configurarPinza(1,30,100);r.api.configurarElevacionPinza(0,120,60);}
    r.log.length=0;string('avanzar');assert.deepEqual(commands(r).slice(-2),[[0,0,102],[2,0,102]]);
    r.time=400;string(kind==='mechanic'||kind==='lifting-gripper'?'abrir':'subir');string('desconocido');
    if(kind==='lifting-gripper'){assert.equal(r.api.objetivoMechanic(0),30);assert.equal(r.api.objetivoMechanic(4),-1);string('subir');assert.equal(r.api.objetivoMechanic(0),30);assert.equal(r.api.objetivoMechanic(4),60);}
    const servos=commands(r).filter(p=>p[0]>=20).length;r.time=501;r.loops[0]();stopped(r);
    assert.equal(commands(r).filter(p=>p[0]>=20).length,servos);
    string('retroceder');assert.deepEqual(commands(r).slice(-2),[[0,1,102],[2,1,102]]);string('parar');stopped(r);
});

// Run when web artifacts exist; ordinary CI does not silently claim this browser validation.
if(fs.existsSync(path.join(root,'output/playwright/radio-proportional-robot.ts')))test('H04: actual web-converted proportional receiver preserves stale-axis/stop behavior',()=>{
    const source=fs.readFileSync(path.join(root,'output/playwright/radio-proportional-robot.ts'),'utf8');
    const r=runtime(),{value,string}=r.loadExample('',source);r.log.length=0;
    value('y',80);assert.ok(commands(r).every(p=>p[2]===0));value('x',0);
    for(r.time=100;r.time<=900;r.time+=100)value('x',0);stopped(r);
    value('y',30);assert.deepEqual(commands(r).slice(-2),[[0,0,77],[2,0,77]]);
    string('parar');const before=commands(r).length;value('x',80);assert.equal(commands(r).length,before);value('y',0);assert.deepEqual(commands(r).slice(-2),[[0,0,204],[2,1,204]]);
});
