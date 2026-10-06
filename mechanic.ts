namespace copilli {
    interface ServoProfile {
        mechanism: number
        port: PuertoServo
        lowAngle: number
        highAngle: number
        frontAngle: number
        targetAngle: number
        operation: number
    }

    let servoProfiles: ServoProfile[] = []
    let globalSpeed = 0
    let axisSpeeds: number[] = [-1, -1, -1, -1, -1]
    let configurationResults: string[] = ["No solicitada", "No solicitada", "No solicitada", "No solicitada", "No solicitada"]

    function validAngle(angle: number): boolean {
        return angle == Math.round(angle) && angle >= 10 && angle <= 170
    }

    function findProfile(mechanism: number): ServoProfile {
        for (let i = 0; i < servoProfiles.length; i++) {
            if (servoProfiles[i].mechanism == mechanism) return servoProfiles[i]
        }
        return null
    }

    function rejectConfiguration(mechanism: number, reason: string): void {
        let notice = "Calibracion rechazada: " + reason
        if (findProfile(mechanism) != null) notice += "; continúa vigente la anterior"
        else notice += "; no hay perfil vigente"
        configurationResults[mechanism] = notice
        copilliDiagnostics.setMechanic(mechanism, notice)
    }

    function configureProfile(mechanism: number, port: PuertoServo, lowAngle: number, highAngle: number, frontAngle?: number): void {
        if (!validAngle(lowAngle) || !validAngle(highAngle) || lowAngle == highAngle) {
            rejectConfiguration(mechanism, "usa dos ángulos distintos entre 10 y 170")
            return
        }
        if (frontAngle == null) frontAngle = lowAngle
        for (let i = 0; i < servoProfiles.length; i++) {
            if (servoProfiles[i].port == port && servoProfiles[i].mechanism != mechanism) {
                rejectConfiguration(mechanism, "ese puerto ya tiene otro mecanismo; quita su configuración antes de reemplazarla")
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
            frontAngle: frontAngle,
            targetAngle: -1,
            operation: 0
        })
        configurationResults[mechanism] = "Configuración aceptada; perfil vigente actualizado sin movimiento"
        copilliDiagnostics.setMechanic(mechanism, "")
    }

    function moveMechanism(mechanism: number, percentage: number): void {
        let profile = findProfile(mechanism)
        if (profile == null) {
            copilliDiagnostics.setMechanic(mechanism, "Acción segura: falta configurar y calibrar este accesorio.")
            return
        }
        if (!copilliRobotIsReady()) {
            copilliDiagnostics.setMechanic(mechanism, "Prepara Maqueen antes de mover un servo; no se envió ningún ángulo.")
            return
        }
        let angle = percentageAngle(profile, percentage)
        moveAngle(profile, angle, false)
    }

    function validAxis(axis: number): boolean { return axis >= 0 && axis <= 4 && axis == Math.round(axis) }
    function percentageAngle(profile: ServoProfile, percentage: number): number {
        if (profile.mechanism == 3) {
            if (percentage <= 50) return copilliLogic.angleBetween(profile.lowAngle, profile.frontAngle, percentage * 2)
            return copilliLogic.angleBetween(profile.frontAngle, profile.highAngle, (percentage - 50) * 2)
        }
        return copilliLogic.angleBetween(profile.lowAngle, profile.highAngle, percentage)
    }
    function moveAngle(profile: ServoProfile, angle: number, initial: boolean): void {
        let mechanism = profile.mechanism
        profile.operation++
        let id = profile.operation
        let speed = axisSpeeds[mechanism] < 0 ? globalSpeed : axisSpeeds[mechanism]
        if (speed > 0 && profile.targetAngle < 0 && !initial) {
            copilliDiagnostics.setMechanic(mechanism, "Establece la posición inicial antes del movimiento gradual; posición real desconocida.")
            return
        }
        copilliDiagnostics.setMechanic(mechanism, "")
        if (initial || speed == 0) {
            copilliHardware.setServo(profile.port, angle)
            profile.targetAngle = angle
            return
        }
        let startAngle = profile.targetAngle
        let duration = Math.abs(angle - startAngle) * 1000 / (speed * 1.8)
        let started = control.millis()
        while (findProfile(mechanism) == profile && profile.operation == id) {
            let elapsed = control.millis() - started
            let next = duration == 0 ? angle : Math.round(startAngle + (angle - startAngle) * Math.min(1, elapsed / duration))
            if (next != profile.targetAngle) {
                copilliHardware.setServo(profile.port, next)
                profile.targetAngle = next
            }
            if (elapsed >= duration) return
            basic.pause(20)
        }
    }

    function configureMechanic(mechanism: number, port: PuertoServo, low: number, high: number): void {
        if (port != PuertoServo.S1 && port != PuertoServo.S2) {
            rejectConfiguration(mechanism, "puerto Mechanic no válido")
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

    /** Elevación opcional, independiente de apertura. Configurar no mueve. */
    //% blockId=copilli_configurar_elevacion_pinza block="configurar elevación de pinza en %puerto baja %anguloBaja alta %anguloAlta"
    //% anguloBaja.min=10 anguloBaja.max=170 anguloAlta.min=10 anguloAlta.max=170
    //% group="Avanzado" advanced=true
    export function configurarElevacionPinza(puerto: PuertoServo, anguloBaja: number, anguloAlta: number): void {
        configureMechanic(4, puerto, anguloBaja, anguloAlta)
    }
    //% blockId=copilli_subir_pinza block="subir pinza"
    //% group="Mechanic" weight=94
    export function subirPinza(): void { moveMechanism(4, 100) }
    //% blockId=copilli_bajar_pinza block="bajar pinza"
    //% group="Mechanic" weight=93
    export function bajarPinza(): void { moveMechanism(4, 0) }

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
            rejectConfiguration(3, "usa tres ángulos distintos entre 10 y 170")
            return
        }
        if (puerto != PuertoServo.S1 && puerto != PuertoServo.S2) {
            rejectConfiguration(3, "puerto Mechanic no válido")
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
            if (servoProfiles[i].port == puerto) {
                let mechanism = servoProfiles[i].mechanism
                servoProfiles.removeAt(i)
                configurationResults[mechanism] = "Configuración retirada; no hay perfil vigente"
                copilliDiagnostics.setMechanic(mechanism, "")
            }
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
            copilliDiagnostics.setMechanic(3, "Accion segura: falta configurar y calibrar el sensor giratorio Push.")
            return
        }
        if (!copilliRobotIsReady()) {
            copilliDiagnostics.setMechanic(3, "Prepara Maqueen antes de mover un servo; no se envio ningun angulo.")
            return
        }
        if (direccion != DireccionSensor.Izquierda && direccion != DireccionSensor.Frente &&
            direccion != DireccionSensor.Derecha) {
            copilliDiagnostics.setMechanic(3, "Direccion del sensor no valida; no se envio ningun angulo.")
            return
        }
        let angle = profile.lowAngle
        if (direccion == DireccionSensor.Frente) angle = profile.frontAngle
        else if (direccion == DireccionSensor.Derecha) angle = profile.highAngle
        moveAngle(profile, angle, false)
    }

    /**
     * Posición semántica avanzada: 0 % cerrada/baja y 100 % abierta/alta.
     */
    //% blockId=copilli_posicion_mechanic block="poner %mecanismo en %porcentaje \\%"
    //% porcentaje.min=0 porcentaje.max=100 porcentaje.defl=50
    //% group="Avanzado" weight=75 advanced=true
    export function posicionMechanic(mecanismo: Mecanismo, porcentaje: number): void {
        if (!copilliMotion.finite(porcentaje)) {
            copilliDiagnostics.setMechanic(mecanismo, "Porcentaje Mechanic no válido; no se envió ningún ángulo.")
            return
        }
        moveMechanism(mecanismo, copilliLogic.limit(porcentaje, 0, 100))
    }

    /** Posición entre extremos calibrados. Push: 0 izquierda, 50 frente, 100 derecha. */
    //% blockId=copilli_poner_eje_mechanic block="poner %eje en %porcentaje \\%"
    //% porcentaje.min=0 porcentaje.max=100 porcentaje.defl=50
    //% group="Mechanic" weight=110
    export function ponerEjeMechanic(eje: EjeMechanic, porcentaje: number): void {
        if (!validAxis(eje) || !copilliMotion.finite(porcentaje) || porcentaje < 0 || porcentaje > 100) {
            copilliDiagnostics.setMechanic(eje, "Posición rechazada: eje válido y porcentaje entre 0 y 100."); return
        }
        moveMechanism(eje, porcentaje)
    }
    /** Envía directamente la posición inicial calibrada; no mide la posición real. */
    //% blockId=copilli_posicion_inicial_mechanic block="establecer posición inicial de %eje en %porcentaje \\%"
    //% porcentaje.min=0 porcentaje.max=100 porcentaje.defl=50
    //% group="Preparación" weight=90
    export function establecerPosicionInicialMechanic(eje: EjeMechanic, porcentaje: number): void {
        if (!validAxis(eje) || !copilliMotion.finite(porcentaje) || porcentaje < 0 || porcentaje > 100) {
            copilliDiagnostics.setMechanic(eje, "Posición inicial rechazada: eje válido y porcentaje entre 0 y 100."); return
        }
        let profile = findProfile(eje)
        if (profile == null || !copilliRobotIsReady()) {
            copilliDiagnostics.setMechanic(eje, "Prepara Maqueen y configura el eje antes de establecer posición inicial."); return
        }
        moveAngle(profile, percentageAngle(profile, porcentaje), true)
    }
    /** Rapidez de trayectoria ordenada: 1–100% equivale a 1,8–180 grados/s, no velocidad física medida. */
    //% blockId=copilli_rapidez_mechanic block="fijar rapidez de Mechanic a %rapidez \\%"
    //% rapidez.min=1 rapidez.max=100 rapidez.defl=50
    //% group="Preparación" weight=91
    export function fijarRapidezMechanic(rapidez: number): void {
        if (!copilliMotion.finite(rapidez) || rapidez < 1 || rapidez > 100) {
            copilliDiagnostics.set("Rapidez rechazada: usa 1–100%."); return
        }
        globalSpeed = rapidez
        copilliDiagnostics.set("")
    }
    /** Ajuste por eje: -1 usa global, 0 inmediato, 1–100 gradual. No mueve. */
    //% blockId=copilli_rapidez_eje_mechanic block="rapidez de %eje %rapidez (-1 global, 0 inmediato)"
    //% rapidez.min=-1 rapidez.max=100 rapidez.defl=-1
    //% group="Avanzado" advanced=true
    export function configurarRapidezEjeMechanic(eje: EjeMechanic, rapidez: number): void {
        if (!validAxis(eje) || !copilliMotion.finite(rapidez) || rapidez < -1 || rapidez > 100 || (rapidez > -1 && rapidez < 0) || (rapidez > 0 && rapidez < 1)) {
            copilliDiagnostics.setMechanic(eje, "Rapidez rechazada: -1 global, 0 inmediato o 1–100%."); return
        }
        axisSpeeds[eje] = rapidez
        copilliDiagnostics.setMechanic(eje, "")
    }
    /** Cancela pasos futuros; conserva el último ángulo enviado, sin liberar ni desconectar el servo. */
    //% blockId=copilli_detener_eje_mechanic block="detener movimiento de %eje"
    //% group="Mechanic" weight=65
    export function detenerMovimientoMechanic(eje: EjeMechanic): void {
        if (!validAxis(eje)) { copilliDiagnostics.set("Eje Mechanic no válido."); return }
        let profile = findProfile(eje)
        if (profile != null) profile.operation++
        copilliDiagnostics.setMechanic(eje, "")
    }

    /** Consulta sin hardware: -1 significa sin perfil o sin objetivo enviado. */
    //% blockId=copilli_mechanic_configurado block="%eje configurado"
    //% group="Avanzado" advanced=true
    export function mechanicConfigurado(eje: EjeMechanic): boolean { return findProfile(eje) != null }
    //% blockId=copilli_puerto_mechanic block="puerto vigente de %eje (0 S1, 1 S2)"
    //% group="Avanzado" advanced=true
    export function puertoMechanic(eje: EjeMechanic): number {
        let profile = findProfile(eje)
        return profile == null ? -1 : profile.port
    }
    //% blockId=copilli_objetivo_mechanic block="último ángulo enviado a %eje"
    //% group="Avanzado" advanced=true
    export function objetivoMechanic(eje: EjeMechanic): number {
        let profile = findProfile(eje)
        return profile == null ? -1 : profile.targetAngle
    }
    //% blockId=copilli_perfil_mechanic block="perfil vigente de %eje"
    //% group="Avanzado" advanced=true
    export function perfilMechanic(eje: EjeMechanic): string {
        let profile = findProfile(eje)
        if (profile == null) return "Sin perfil"
        return "S" + (profile.port + 1) + ": " + profile.lowAngle + "/" + profile.frontAngle + "/" + profile.highAngle
    }
    //% blockId=copilli_resultado_configuracion_mechanic block="resultado de configurar %eje"
    //% group="Avanzado" advanced=true
    export function resultadoConfiguracionMechanic(eje: EjeMechanic): string {
        return eje >= 0 && eje <= 4 ? configurationResults[eje] : "Eje no válido"
    }
}
