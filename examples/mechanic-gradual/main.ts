// Usa perfiles iniciales; ajusta límites de cada modelo al montaje antes de ejecutarlo.
copilli.iniciarMaqueen()
copilli.configurarMechanic(copilli.ModeloMechanic.Beetle, copilli.PuertoServo.S2)
copilli.configurarMechanic(copilli.ModeloMechanic.ElevacionPinza, copilli.PuertoServo.S1)
copilli.fijarRapidezMechanic(30)
copilli.configurarRapidezEjeMechanic(copilli.EjeMechanic.ElevacionPinza, 20)
// Estas órdenes iniciales son directas, no graduales; comprueba el espacio libre.
if (copilli.mechanicConfigurado(copilli.EjeMechanic.AperturaPinza)) {
    copilli.establecerPosicionInicialMechanic(copilli.EjeMechanic.AperturaPinza, 0)
}
if (copilli.mechanicConfigurado(copilli.EjeMechanic.ElevacionPinza)) {
    copilli.establecerPosicionInicialMechanic(copilli.EjeMechanic.ElevacionPinza, 0)
}
input.onButtonPressed(Button.A, function () {
    copilli.ponerMechanic(copilli.ModeloMechanic.Beetle, 50)
})
input.onButtonPressed(Button.B, function () {
    copilli.ponerMechanic(copilli.ModeloMechanic.ElevacionPinza, 50)
})
input.onButtonPressed(Button.AB, function () {
    copilli.detenerMovimientoMechanic(copilli.EjeMechanic.AperturaPinza)
    copilli.detenerMovimientoMechanic(copilli.EjeMechanic.ElevacionPinza)
})
