// Robot como único rol. Las funciones de micro:bit siguen siendo nativas.
copilli.iniciarMaqueen()
input.onButtonPressed(Button.A, function () {
    copilli.faros(copilli.Lado.Ambos, true)
    basic.showIcon(IconNames.Happy)
})
input.onButtonPressed(Button.B, function () {
    copilli.faros(copilli.Lado.Ambos, false)
    basic.showNumber(input.temperature())
})
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    basic.showIcon(IconNames.Heart)
    music.playTone(262, music.beat(BeatFraction.Quarter))
})
input.onGesture(Gesture.Shake, function () {
    copilli.detener()
    basic.showNumber(input.lightLevel())
})
