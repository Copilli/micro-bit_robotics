copilliHardware.enableTestDouble()
copilli.iniciarMaqueen()
let finished = false
control.inBackground(function () {
    copilli.moverPor(copilli.DireccionMovimiento.Adelante, 1, copilli.UnidadMovimiento.Segundos)
    finished = true
})
basic.pause(100)
copilli.retroceder(60)
basic.pause(100)
let wheelCount = copilliHardware.testMotorCommandCount()
basic.pause(100)
control.assert(finished, "timed fiber released after replacement")
control.assert(copilliHardware.testMotorCommandCount() == wheelCount, "old fiber cannot issue stop")
control.assert(copilliHardware.testMotorDirection(wheelCount - 1) == 1, "replacement still reversing")
copilli.detener()
copilli.configurarPinza(copilli.PuertoServo.S1, 150, 30)
copilli.configurarElevacionPinza(copilli.PuertoServo.S2, 20, 80)
copilli.establecerPosicionInicialMechanic(copilli.EjeMechanic.AperturaPinza, 0)
copilli.establecerPosicionInicialMechanic(copilli.EjeMechanic.ElevacionPinza, 0)
copilli.fijarRapidezMechanic(50)
let openingFinished = false
let liftingFinished = false
control.inBackground(function () {
    copilli.abrirPinza()
    openingFinished = true
})
control.inBackground(function () {
    copilli.subirPinza()
    liftingFinished = true
})
basic.pause(150)
control.assert(copilli.objetivoMechanic(copilli.EjeMechanic.AperturaPinza) > 30, "opening has progressed")
control.assert(copilli.objetivoMechanic(copilli.EjeMechanic.ElevacionPinza) > 20, "lifting has progressed concurrently")
copilli.detenerMovimientoMechanic(copilli.EjeMechanic.AperturaPinza)
let stoppedAngle = copilli.objetivoMechanic(copilli.EjeMechanic.AperturaPinza)
basic.pause(900)
control.assert(openingFinished && liftingFinished, "both fibers finish independently")
control.assert(copilli.objetivoMechanic(copilli.EjeMechanic.AperturaPinza) == stoppedAngle, "servo stays stopped")
control.assert(copilli.objetivoMechanic(copilli.EjeMechanic.ElevacionPinza) == 80, "other axis completes")
serial.writeString("PXT MOTION PASS")
