radio.setGroup(23)
copilli.iniciarMaqueen()

let x = 0
let y = 0
let ultimaOrdenValida = control.millis()
let yaDetenidoPorTimeout = true

// Un único receptor nativo de valores; x/y son nombres cortos legibles, no un paquete opaco.
radio.onReceivedValue(function (nombre, valor) {
    if (nombre == "x") {
        x = Math.max(-100, Math.min(100, valor))
    } else if (nombre == "y") {
        y = Math.max(-100, Math.min(100, valor))
    } else {
        return
    }
    ultimaOrdenValida = control.millis()
    yaDetenidoPorTimeout = false
    let izquierda = y + x
    let derecha = y - x
    let divisor = Math.max(100, Math.max(Math.abs(izquierda), Math.abs(derecha)))
    copilli.moverRuedas(izquierda * 100 / divisor, derecha * 100 / divisor)
})

basic.forever(function () {
    if (!yaDetenidoPorTimeout && control.millis() - ultimaOrdenValida > 500) {
        copilli.detener()
        yaDetenidoPorTimeout = true
    }
    basic.pause(20)
})
