namespace copilli {
    interface ServoProfile {
        mechanism: number
        port: PuertoServo
        lowAngle: number
        highAngle: number
        frontAngle: number
    }

    let servoProfiles: ServoProfile[] = []

    function validAngle(angle: number): boolean {
        return angle == Math.round(angle) && angle >= 10 && angle <= 170
    }

    function findProfile(mechanism: number): ServoProfile {
        for (let i = 0; i < servoProfiles.length; i++) {
            if (servoProfiles[i].mechanism == mechanism) return servoProfiles[i]
        }
        return null
    }

    function configureProfile(mechanism: number, port: PuertoServo, lowAngle: number, highAngle: number, frontAngle?: number): void {
        if (!validAngle(lowAngle) || !validAngle(highAngle) || lowAngle == highAngle) {
            copilliDiagnostics.set("Calibracion rechazada: usa dos angulos distintos entre 10 y 170.")
            return
        }
        if (frontAngle == null) frontAngle = lowAngle
        for (let i = 0; i < servoProfiles.length; i++) {
            if (servoProfiles[i].port == port && servoProfiles[i].mechanism != mechanism) {
                copilliDiagnostics.set("Ese puerto ya tiene otro mecanismo. Quita su configuración antes de reemplazarla.")
                return
            }
        }
        for (let i = servoProfiles.length - 1; i >= 0; i--) {
            if (servoProfiles[i].mechanism == mechanism || servoProfiles[i].port == port)
                servoProfiles.removeAt(i)
        }
        servoProfiles.push({
            mechanism: mechanism,
            port: port,
            lowAngle: lowAngle,
            highAngle: highAngle,
            frontAngle: frontAngle
        })
        copilliDiagnostics.set("")
    }

    function moveMechanism(mechanism: number, percentage: number): void {
        let profile = findProfile(mechanism)
        if (profile == null) {
            copilliDiagnostics.set("Accion segura: falta configurar y calibrar este accesorio.")
            return
        }
        if (!copilliRobotIsReady()) {
            copilliDiagnostics.set("Prepara Maqueen antes de mover un servo; no se envio ningun angulo.")
            return
        }
        let angle = copilliLogic.angleBetween(profile.lowAngle, profile.highAngle, percentage)
        copilliHardware.setServo(profile.port, angle)
        copilliDiagnostics.set("")
    }

    function configureMechanic(mechanism: number, port: PuertoServo, low: number, high: number): void {
        if (port != PuertoServo.S1 && port != PuertoServo.S2) {
            copilliDiagnostics.set("Puerto Mechanic no válido.")
            return
        }
        configureProfile(mechanism, port, low, high)
    }

    /**
     * Configura pinza Beetle: ángulo abierta y ángulo cerrada, sin mover el servo.
     */
    //% blockId=copilli_configurar_pinza block="configurar pinza en %puerto abierta %anguloAbierta cerrada %anguloCerrada"
    //% anguloAbierta.min=10 anguloAbierta.max=170 anguloCerrada.min=10 anguloCerrada.max=170
    //% group="Avanzado" weight=100 advanced=true
    export function configurarPinza(puerto: PuertoServo, anguloAbierta: number, anguloCerrada: number): void {
        configureMechanic(Mecanismo.Pinza, puerto, anguloCerrada, anguloAbierta)
    }

    /**
     * Configura pala Loader: ángulo baja y ángulo alta, sin mover el servo.
     */
    //% blockId=copilli_configurar_pala block="configurar pala en %puerto baja %anguloBaja alta %anguloAlta"
    //% anguloBaja.min=10 anguloBaja.max=170 anguloAlta.min=10 anguloAlta.max=170
    //% group="Avanzado" weight=95 advanced=true
    export function configurarPala(puerto: PuertoServo, anguloBaja: number, anguloAlta: number): void {
        configureMechanic(Mecanismo.Pala, puerto, anguloBaja, anguloAlta)
    }

    /**
     * Configura horquillas Forklift: ángulo bajas y ángulo altas, sin mover el servo.
     */
    //% blockId=copilli_configurar_horquillas block="configurar horquillas en %puerto bajas %anguloBajas altas %anguloAltas"
    //% anguloBajas.min=10 anguloBajas.max=170 anguloAltas.min=10 anguloAltas.max=170
    //% group="Avanzado" weight=90 advanced=true
    export function configurarHorquillas(puerto: PuertoServo, anguloBajas: number, anguloAltas: number): void {
        configureMechanic(Mecanismo.Horquillas, puerto, anguloBajas, anguloAltas)
    }

    /**
     * Configura los tres objetivos del servo ultrasónico Push, sin moverlo.
     */
    //% blockId=copilli_configurar_sensor_giratorio block="configurar sensor giratorio en %puerto izquierda %izquierda frente %frente derecha %derecha"
    //% izquierda.min=10 izquierda.max=170 frente.min=10 frente.max=170 derecha.min=10 derecha.max=170
    //% group="Avanzado" weight=85 advanced=true
    export function configurarSensorGiratorio(puerto: PuertoServo, izquierda: number, frente: number, derecha: number): void {
        if (!validAngle(izquierda) || !validAngle(frente) || !validAngle(derecha) ||
            izquierda == frente || izquierda == derecha || frente == derecha) {
            copilliDiagnostics.set("Calibracion rechazada: usa tres angulos distintos entre 10 y 170.")
            return
        }
        if (puerto != PuertoServo.S1 && puerto != PuertoServo.S2) {
            copilliDiagnostics.set("Puerto Mechanic no válido.")
            return
        }
        configureProfile(3, puerto, izquierda, derecha, frente)
    }

    /**
     * Quita la asignación de un puerto sin enviar ningún comando al servo.
     */
    //% blockId=copilli_quitar_configuracion_mechanic block="quitar configuración Mechanic del puerto %puerto"
    //% group="Avanzado" weight=80 advanced=true
    export function quitarConfiguracionMechanic(puerto: PuertoServo): void {
        for (let i = servoProfiles.length - 1; i >= 0; i--) {
            if (servoProfiles[i].port == puerto) servoProfiles.removeAt(i)
        }
    }

    /**
     * Abre la pinza Beetle a la posición calibrada.
     */
    //% blockId=copilli_abrir_pinza block="abrir pinza"
    //% group="Mechanic" weight=100
    export function abrirPinza(): void {
        moveMechanism(Mecanismo.Pinza, 100)
    }

    /**
     * Cierra la pinza Beetle a la posición calibrada.
     */
    //% blockId=copilli_cerrar_pinza block="cerrar pinza"
    //% group="Mechanic" weight=95
    export function cerrarPinza(): void {
        moveMechanism(Mecanismo.Pinza, 0)
    }

    /**
     * Sube la pala Loader a la posición calibrada.
     */
    //% blockId=copilli_subir_pala block="subir pala"
    //% group="Mechanic" weight=90
    export function subirPala(): void {
        moveMechanism(Mecanismo.Pala, 100)
    }

    /**
     * Baja la pala Loader a la posición calibrada.
     */
    //% blockId=copilli_bajar_pala block="bajar pala"
    //% group="Mechanic" weight=85
    export function bajarPala(): void {
        moveMechanism(Mecanismo.Pala, 0)
    }

    /**
     * Sube las horquillas Forklift a la posición calibrada.
     */
    //% blockId=copilli_subir_horquillas block="subir horquillas"
    //% group="Mechanic" weight=80
    export function subirHorquillas(): void {
        moveMechanism(Mecanismo.Horquillas, 100)
    }

    /**
     * Baja las horquillas Forklift a la posición calibrada.
     */
    //% blockId=copilli_bajar_horquillas block="bajar horquillas"
    //% group="Mechanic" weight=75
    export function bajarHorquillas(): void {
        moveMechanism(Mecanismo.Horquillas, 0)
    }

    /**
     * Orienta el ultrasonido giratorio del accesorio Push. La placa frontal empuja al conducir.
     */
    //% blockId=copilli_orientar_sensor block="orientar sensor %direccion"
    //% group="Mechanic" weight=70
    export function orientarSensor(direccion: DireccionSensor): void {
        let profile = findProfile(3)
        if (profile == null) {
            copilliDiagnostics.set("Accion segura: falta configurar y calibrar el sensor giratorio Push.")
            return
        }
        if (!copilliRobotIsReady()) {
            copilliDiagnostics.set("Prepara Maqueen antes de mover un servo; no se envio ningun angulo.")
            return
        }
        if (direccion != DireccionSensor.Izquierda && direccion != DireccionSensor.Frente &&
            direccion != DireccionSensor.Derecha) {
            copilliDiagnostics.set("Direccion del sensor no valida; no se envio ningun angulo.")
            return
        }
        let angle = profile.lowAngle
        if (direccion == DireccionSensor.Frente) angle = profile.frontAngle
        else if (direccion == DireccionSensor.Derecha) angle = profile.highAngle
        copilliHardware.setServo(profile.port, angle)
        copilliDiagnostics.set("")
    }

    /**
     * Posición semántica avanzada: 0 % cerrada/baja y 100 % abierta/alta.
     */
    //% blockId=copilli_posicion_mechanic block="poner %mecanismo en %porcentaje \\%"
    //% porcentaje.min=0 porcentaje.max=100 porcentaje.defl=50
    //% group="Avanzado" weight=75 advanced=true
    export function posicionMechanic(mecanismo: Mecanismo, porcentaje: number): void {
        if (porcentaje != porcentaje) {
            copilliDiagnostics.set("Porcentaje Mechanic no valido; no se envio ningun angulo.")
            return
        }
        moveMechanism(mecanismo, copilliLogic.limit(porcentaje, 0, 100))
    }

}
