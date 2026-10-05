const {test}=require('node:test');const assert=require('node:assert/strict');
const {options,decompile}=require('../scripts/pxt-memory.cjs');
test('H05/H12: old turn and RGB APIs still compile and retain their historical block IDs',()=>{
    const source='copilli.iniciarMaqueen()\ncopilli.girar(copilli.Lado.Ambos, 40)\ncopilli.lucesInferiores(copilli.Color.Rojo)\ncopilli.apagarLucesInferiores()\n';
    const {xml}=decompile(options(source));
    for(const id of ['copilli_girar','copilli_luces_inferiores','copilli_apagar_luces_inferiores'])assert.ok(xml.includes(`type="${id}"`));
    assert.ok(xml.includes('copilli.Lado.Ambos'));
});
