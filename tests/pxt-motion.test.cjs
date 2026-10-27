// Actual PXT fibers: independent servo axes and cancelled wheel orders.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');
const {options,compile,decompile}=require('../scripts/pxt-memory.cjs');
test('PXT simulator: replacement cancels wheels and servo axes run concurrently',async()=>{
    const main=fs.readFileSync(__dirname+'/pxt-motion.ts','utf8');
    const compiled=compile(options(main));
    const sandbox=vm.createContext({console,setTimeout,clearTimeout,setInterval,clearInterval,performance,Promise,Uint8Array,Buffer});
    vm.runInContext(fs.readFileSync(require.resolve('pxt-core/built/pxtsim.js'),'utf8'),sandbox);
    const sim=sandbox.pxsim;let runtime,passed=false;
    await new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>{runtime?.kill();reject(Error('PXT motion test timed out'));},8000);
        sim.initCurrentRuntime=()=>{
            sim.initBareRuntime();sim.basic.forever=sim.thread.forever;
            sim.control.millis=()=>Date.now();
            sim.serial.writeString=message=>{if(message==='PXT MOTION PASS'){passed=true;clearTimeout(timer);runtime.kill();resolve();}};
        };
        runtime=new sim.Runtime({type:'run',code:compiled.outfiles['binary.js']});
        runtime.errorHandler=error=>{clearTimeout(timer);runtime.kill();reject(error);};
        runtime.run(()=>{});
    });
    assert.equal(passed,true);
});
test('new public APIs compile and decompile to named blocks including More settings',()=>{
    const source=`
copilli.iniciarMaqueen()
copilli.configurarMechanic(copilli.ModeloMechanic.Beetle,copilli.PuertoServo.S1)
copilli.ajustarLimitesMechanic(copilli.ModeloMechanic.Beetle,100,30)
copilli.ponerMechanic(copilli.ModeloMechanic.Beetle,0)
copilli.ponerAnguloMechanic(copilli.ModeloMechanic.Beetle,90)
copilli.establecerCeroMechanic(copilli.ModeloMechanic.Beetle)
copilli.orientarMechanicGrados(copilli.ModeloMechanic.Beetle,0)
copilli.girarMechanicGrados(copilli.ModeloMechanic.Beetle,5)
copilli.configurarPinza(copilli.PuertoServo.S1,80,100)
copilli.configurarElevacionPinza(copilli.PuertoServo.S2,80,100)
copilli.ponerServoGrados(copilli.PuertoServo.S1,90)
copilli.fijarPotenciaMovimiento(40)
copilli.fijarPotenciaGiro(30)
copilli.ajustarBalanceRuedas(-5)
copilli.configurarMinimosRuedas(10,12)
copilli.prepararBrujula()
copilli.mantenerRumboConBrujula(true)
copilli.configurarCorreccionRumbo(0.5,15)
copilli.configurarToleranciaGiro(5)
copilli.calibrarRecorrido(copilli.DireccionMovimiento.Adelante,20,2)
copilli.moverContinuamente(copilli.DireccionMovimiento.Atras)
copilli.moverPorSegundos(copilli.DireccionMovimiento.Adelante,2)
copilli.moverPorCentimetros(copilli.DireccionMovimiento.Adelante,20)
copilli.moverPor(copilli.DireccionMovimiento.Adelante,20,copilli.UnidadMovimiento.Centimetros)
copilli.girarPor(copilli.DireccionGiro.Izquierda,90,copilli.UnidadGiro.Grados)
copilli.fijarRapidezMechanic(50)
copilli.configurarRapidezEjeMechanic(copilli.EjeMechanic.ElevacionPinza,-1)
copilli.establecerPosicionInicialMechanic(copilli.EjeMechanic.AperturaPinza,25)
copilli.ponerEjeMechanic(copilli.EjeMechanic.SensorPush,75)
copilli.detenerMovimientoMechanic(copilli.EjeMechanic.AperturaPinza)
copilli.configurarSensorGiratorio(copilli.PuertoServo.S1,60,90,120)
copilli.orientarSensorGrados(15)
copilli.establecerCeroSensor()
copilli.girarSensorGrados(-10)
basic.showNumber(copilli.brujulaPreparada() ? 1 : 0)
basic.showNumber(copilli.recorridoCalibrado(copilli.DireccionMovimiento.Adelante) ? 1 : 0)
`;
    // Use native if blocks rather than a ternary, which MakeCode represents as gray JS.
    const main=source.replace(/basic.showNumber\((.+) \? 1 : 0\)/g,'if ($1) { basic.showNumber(1) }');
    const {xml,info}=decompile(options(main));
    for(const id of ['copilli_mover_segundos','copilli_mover_centimetros','copilli_mover_por','copilli_girar_por','copilli_minimos_ruedas','copilli_poner_eje_mechanic','copilli_rapidez_eje_mechanic'])
        assert.ok(xml.includes(`type="${id}"`),id);
    const blocks=info.blocks;
    assert.equal(blocks.some(b=>b.attributes.blockId==='copilli_iniciar_maqueen_modelo'),false);
    assert.ok(xml.includes('type="copilli_servo_grados"'));
    for(const id of ['copilli_configurar_pinza','copilli_configurar_elevacion_pinza'])
        assert.equal(blocks.find(b=>b.attributes.blockId===id).attributes.blockHidden,true,id);
    for(const id of ['copilli_orientar_sensor_grados','copilli_cero_sensor','copilli_girar_sensor_grados','copilli_configurar_sensor_giratorio']) {
        assert.ok(xml.includes(`type="${id}"`),id);
        assert.ok(!blocks.find(b=>b.attributes.blockId===id).attributes.advanced,id);
    }
    assert.ok(!blocks.find(b=>b.attributes.blockId==='copilli_iniciar_maqueen').attributes.blockHidden);
    for(const id of ['copilli_iniciar_maqueen','copilli_configurar_mechanic_modelo','copilli_posicion_modelo_mechanic','copilli_angulo_modelo_mechanic']) {
        assert.ok(xml.includes(`type="${id}"`),id);
        assert.ok(!blocks.find(b=>b.attributes.blockId===id).attributes.blockHidden,id);
    }
    assert.equal(blocks.find(b=>b.attributes.blockId==='copilli_avanzar').attributes.advanced,true);
    assert.ok(!blocks.find(b=>b.attributes.blockId==='copilli_mover_por').attributes.advanced);
    for(const id of ['copilli_potencia_movimiento','copilli_mover_segundos','copilli_mover_centimetros']) {
        const block=blocks.find(b=>b.attributes.blockId===id);
        assert.ok(block,id);
        assert.ok(!block.attributes.advanced,id);
        assert.ok(!block.attributes.blockHidden,id);
    }
});
