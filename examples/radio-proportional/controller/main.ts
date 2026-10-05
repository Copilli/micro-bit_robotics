// Perfil escolar: DFR0536 V2 con cuatro botones de dirección, X/Y y A/B nativos.
// Control proporcional avanzado. Las llamadas Radio son las nativas de MakeCode.
copilli.iniciarGamepadBotones()
radio.setGroup(23)

basic.forever(function () {
    let x = copilli.mandoX()
    let y = copilli.mandoY()
    radio.sendValue("x", x)
    radio.sendValue("y", y)
    basic.pause(100)
})
