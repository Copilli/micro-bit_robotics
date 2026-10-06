// Lados estimados por tiempo. Los giros usan brújula; comprobar el montaje físicamente.
copilli.iniciarMaqueen()
copilli.fijarPotenciaMovimiento(40)
copilli.fijarPotenciaGiro(30)
copilli.prepararBrujula()
input.onButtonPressed(Button.A, function () {
    for (let lado = 0; lado < 4; lado++) {
        copilli.moverPor(copilli.DireccionMovimiento.Adelante, 1, copilli.UnidadMovimiento.Segundos)
        if (copilli.diagnosticoRobot() != "") break
        copilli.girarPor(copilli.DireccionGiro.Derecha, 90, copilli.UnidadGiro.Grados)
        if (copilli.diagnosticoRobot() != "") break
    }
})
input.onButtonPressed(Button.B, function () {
    copilli.detener()
})
