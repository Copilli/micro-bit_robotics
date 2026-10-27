// Plantilla: la compatibilidad mecánica de Lite con este elevador no está confirmada.
// S1 elevación / S2 apertura es referencia histórica de Plus original, no garantía de Lite.
copilli.configurarMechanic(copilli.ModeloMechanic.Beetle, copilli.PuertoServo.S2)
copilli.configurarMechanic(copilli.ModeloMechanic.ElevacionPinza, copilli.PuertoServo.S1)
copilli.iniciarMaqueen()
input.onButtonPressed(Button.A, function () {
    copilli.ponerMechanic(copilli.ModeloMechanic.Beetle, 100)
})
input.onButtonPressed(Button.B, function () {
    copilli.ponerMechanic(copilli.ModeloMechanic.Beetle, 0)
})
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    copilli.ponerMechanic(copilli.ModeloMechanic.ElevacionPinza, 100)
})
input.onGesture(Gesture.Shake, function () {
    copilli.ponerMechanic(copilli.ModeloMechanic.ElevacionPinza, 0)
})
