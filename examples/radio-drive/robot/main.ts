// Firmware del micro:bit instalado en Maqueen; configura el mismo grupo que el mando.
radio.setGroup(21)
copilli.iniciarMaqueen()

let ultimaOrdenValida = control.millis()
let yaDetenidoPorTimeout = true

// Un solo manejador centraliza todos los mensajes; mensajes desconocidos no renuevan el plazo.
radio.onReceivedString(function (mensaje) {
    let ordenConduccion = false
    if (mensaje == "avanzar") {
        copilli.avanzar(40)
        ordenConduccion = true
    } else if (mensaje == "retroceder") {
        copilli.retroceder(40)
        ordenConduccion = true
    } else if (mensaje == "izquierda") {
        copilli.girarHacia(copilli.DireccionGiro.Izquierda, 35)
        ordenConduccion = true
    } else if (mensaje == "derecha") {
        copilli.girarHacia(copilli.DireccionGiro.Derecha, 35)
        ordenConduccion = true
    } else if (mensaje == "parar") {
        copilli.detener()
        ordenConduccion = true
    }
    if (ordenConduccion) {
        ultimaOrdenValida = control.millis()
        yaDetenidoPorTimeout = mensaje == "parar"
    }
})

basic.forever(function () {
    if (!yaDetenidoPorTimeout && control.millis() - ultimaOrdenValida > 500) {
        copilli.detener()
        yaDetenidoPorTimeout = true
    }
    basic.pause(20)
})
