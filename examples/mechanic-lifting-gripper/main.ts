// Plantilla: la compatibilidad mecánica de Lite con este elevador no está confirmada.
// S1 elevación / S2 apertura es referencia histórica de Plus original, no garantía de Lite.
copilli.configurarPinza(copilli.PuertoServo.S2, 0, 0)
copilli.configurarElevacionPinza(copilli.PuertoServo.S1, 0, 0)
copilli.iniciarMaqueen()
input.onButtonPressed(Button.A, function () {
    copilli.abrirPinza()
})
input.onButtonPressed(Button.B, function () {
    copilli.cerrarPinza()
})
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    copilli.subirPinza()
})
input.onGesture(Gesture.Shake, function () {
    copilli.bajarPinza()
})
