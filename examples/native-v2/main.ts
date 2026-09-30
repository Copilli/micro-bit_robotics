// Solo bloques nativos: toca el logo para ver un corazón y oír un tono.
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    basic.showIcon(IconNames.Heart)
    music.playTone(262, music.beat(BeatFraction.Quarter))
})
