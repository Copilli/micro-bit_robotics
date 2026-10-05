radio.setGroup(23)
copilli.iniciarMaqueen()

let x = 0
let y = 0
let recibidoX = false
let recibidoY = false
let instanteX = 0
let instanteY = 0
// Emisión nominal cada 100 ms. Ventana de ejemplo, pendiente de ensayo físico.
let vigencia = 500

function invalidarConduccion() {
    copilli.detener()
    x = 0
    y = 0
    recibidoX = false
    recibidoY = false
}

function comprobarCaducidad() {
    let ahora = control.millis()
    if ((recibidoX && ahora - instanteX >= vigencia) || (recibidoY && ahora - instanteY >= vigencia)) {
        invalidarConduccion()
    }
}

radio.onReceivedValue(function (nombre, valor) {
    // Caducidad antes de aceptar una muestra: el vigilante puede no haber corrido aún.
    comprobarCaducidad()
    if ((nombre == "x" || nombre == "y") && valor >= -100 && valor <= 100 && valor == valor) {
        if (nombre == "x") {
            x = valor
            instanteX = control.millis()
            recibidoX = true
        } else {
            y = valor
            instanteY = control.millis()
            recibidoY = true
        }
        if (recibidoX && recibidoY) {
            let izquierda = y + x
            let derecha = y - x
            let divisor = Math.max(100, Math.max(Math.abs(izquierda), Math.abs(derecha)))
            copilli.moverRuedas(izquierda * 100 / divisor, derecha * 100 / divisor)
        }
    }
})

radio.onReceivedString(function (mensaje) {
    comprobarCaducidad()
    if (mensaje == "parar") {
        invalidarConduccion()
    }
})

basic.forever(function () {
    comprobarCaducidad()
    basic.pause(20)
})
