// Firmware del micro:bit instalado en Maqueen; configura el mismo grupo que el mando.
radio.setGroup(21)
copilli.iniciarMaqueen()

let ultimaOrdenValida = control.millis()
let yaDetenidoPorTimeout = true

// Un solo manejador centraliza todos los mensajes; mensajes desconocidos no renuevan el plazo.
radio.onReceivedString(function (mensaje) {
    if (mensaje == "avanzar") {
        copilli.avanzar(40)
    } else if (mensaje == "retroceder") {
        copilli.retroceder(40)
    } else if (mensaje == "izquierda") {
        copilli.girar(copilli.Lado.Izquierda, 35)
    } else if (mensaje == "derecha") {
        copilli.girar(copilli.Lado.Derecha, 35)
    } else if (mensaje == "parar") {
        copilli.detener()
    } else {
        return
    }
    ultimaOrdenValida = control.millis()
    yaDetenidoPorTimeout = mensaje == "parar"
})

basic.forever(function () {
    if (!yaDetenidoPorTimeout && control.millis() - ultimaOrdenValida > 500) {
        copilli.detener()
        yaDetenidoPorTimeout = true
    }
    basic.pause(20)
})
