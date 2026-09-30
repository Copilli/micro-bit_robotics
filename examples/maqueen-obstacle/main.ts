copilli.iniciarMaqueen()

basic.forever(function () {
    let centimetros = copilli.distanciaCm()
    // Sin eco (-1), o a menos de 15 cm, detenerse: una lectura inválida no es camino libre.
    if (centimetros < 0 || centimetros < 15) {
        copilli.detener()
    } else {
        copilli.avanzar(30)
    }
    basic.pause(100)
})
