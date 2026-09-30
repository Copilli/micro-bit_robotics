// Firmware del robot. Prepara calibración real antes de usar abrir/cerrar.
radio.setGroup(22)
copilli.iniciarMaqueen()

// EJEMPLO COMPILABLE, NO CALIBRADO: cambia estos valores por límites medidos sin carga.
copilli.configurarPinza(copilli.PuertoServo.S1, 0, 0)

let ultimaOrdenValida = control.millis()
let yaDetenidoPorTimeout = true

// Un manejador para conducción y accesorios. Abrir/cerrar no renueva la vigencia de conducción.
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
    } else if (mensaje == "abrir") {
        copilli.abrirPinza()
        return
    } else if (mensaje == "cerrar") {
        copilli.cerrarPinza()
        return
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
