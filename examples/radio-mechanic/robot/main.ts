// Firmware del robot. Prepara calibración real antes de usar abrir/cerrar.
radio.setGroup(22)
copilli.iniciarMaqueen()

// PLANTILLA CON CALIBRACIÓN PENDIENTE: cambia estos valores por límites medidos sin carga.
copilli.configurarPinza(copilli.PuertoServo.S1, 0, 0)

let ultimaOrdenValida = control.millis()
let yaDetenidoPorTimeout = true

// Un manejador para conducción y accesorios. Abrir/cerrar no renueva la vigencia de conducción.
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
    } else if (mensaje == "abrir") {
        copilli.abrirPinza()
    } else if (mensaje == "cerrar") {
        copilli.cerrarPinza()
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
