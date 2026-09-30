// Control proporcional avanzado. Las llamadas Radio son las nativas de MakeCode.
copilli.iniciarGamepad()
radio.setGroup(23)

basic.forever(function () {
    let x = copilli.joystickX()
    let y = copilli.joystickY()
    radio.sendValue("x", x)
    radio.sendValue("y", y)
    basic.pause(100)
})
