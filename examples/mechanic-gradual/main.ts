// Sustituye SOLO por límites de apertura/cierre y elevación medidos sin carga.
let abierta = 0
let cerrada = 0
let baja = 0
let alta = 0
copilli.iniciarMaqueen()
copilli.configurarPinza(copilli.PuertoServo.S2, abierta, cerrada)
copilli.configurarElevacionPinza(copilli.PuertoServo.S1, baja, alta)
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
    copilli.ponerEjeMechanic(copilli.EjeMechanic.AperturaPinza, 50)
})
input.onButtonPressed(Button.B, function () {
    copilli.ponerEjeMechanic(copilli.EjeMechanic.ElevacionPinza, 50)
})
input.onButtonPressed(Button.AB, function () {
    copilli.detenerMovimientoMechanic(copilli.EjeMechanic.AperturaPinza)
    copilli.detenerMovimientoMechanic(copilli.EjeMechanic.ElevacionPinza)
})
