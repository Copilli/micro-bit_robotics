// Firmware del robot. Prepara calibración real antes de usar abrir/cerrar.
radio.setGroup(26)
copilli.iniciarMaqueen()

// PLANTILLA CON CALIBRACIÓN PENDIENTE: cambia estos valores por límites medidos sin carga.
// Montaje histórico Plus original: no garantiza compatibilidad mecánica con Lite.
copilli.configurarMechanic(copilli.ModeloMechanic.Beetle, copilli.PuertoServo.S2)
copilli.configurarMechanic(copilli.ModeloMechanic.ElevacionPinza, copilli.PuertoServo.S1)

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
        copilli.ponerMechanic(copilli.ModeloMechanic.Beetle, 100)
    } else if (mensaje == "cerrar") {
        copilli.ponerMechanic(copilli.ModeloMechanic.Beetle, 0)
    } else if (mensaje == "subir") {
        copilli.ponerMechanic(copilli.ModeloMechanic.ElevacionPinza, 100)
    } else if (mensaje == "bajar") {
        copilli.ponerMechanic(copilli.ModeloMechanic.ElevacionPinza, 0)
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
