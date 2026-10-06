namespace copilli {
    let maqueenReady = false

    function reportNotReady(device: string): void {
        copilliDiagnostics.setRobot("Prepara " + device + " con su bloque iniciar antes de usar esta accion.")
    }

    /**
     * Prepara Maqueen Lite clásico/v4 y detiene sus ruedas. No inicializa accesorios.
     */
    //% blockId=copilli_iniciar_maqueen block="iniciar Maqueen"
    //% group="Preparación" weight=100
    export function iniciarMaqueen(): void {
        if (!copilliRuntime.claim(1)) return
        if (maqueenReady) {
            copilliDiagnostics.setRobot("")
            return
        }
        maqueenReady = true
        copilliHardware.stopMotors()
        copilliDiagnostics.setRobot("")
    }

    //% blockHidden=true
    export function copilliRobotIsReady(): boolean {
        return maqueenReady
    }

    /**
     * Avanza a una potencia de 0 a 100 por ciento. El movimiento continúa hasta otra orden.
     */
    //% blockId=copilli_avanzar block="avanzar a potencia %potencia \\%"
    //% potencia.min=0 potencia.max=100 potencia.defl=40
    //% group="Robot" weight=100 advanced=true
    export function avanzar(potencia: number): void {
        let power = copilliLogic.limit(potencia, 0, 100)
        moverRuedas(power, power)
    }

    /**
     * Retrocede a una potencia de 0 a 100 por ciento.
     */
    //% blockId=copilli_retroceder block="retroceder a potencia %potencia \\%"
    //% potencia.min=0 potencia.max=100 potencia.defl=40
    //% group="Robot" weight=95 advanced=true
    export function retroceder(potencia: number): void {
        let power = copilliLogic.limit(potencia, 0, 100)
        moverRuedas(-power, -power)
    }

    /**
     * Gira sobre el sitio hacia el lado elegido.
     */
    //% blockId=copilli_girar block="girar sobre el sitio hacia %lado a potencia %potencia \\%"
    //% potencia.min=0 potencia.max=100 potencia.defl=40
    //% group="Robot" weight=90 blockHidden=true deprecated=true
    export function girar(lado: Lado, potencia: number): void {
        let power = copilliLogic.limit(potencia, 0, 100)
        if (lado == Lado.Izquierda)
            moverRuedas(-power, power)
        else if (lado == Lado.Derecha)
            moverRuedas(power, -power)
        else
            detener()
    }

    /**
     * Detiene ambas ruedas; no apaga ni libera un servo.
     */
    //% blockId=copilli_detener block="detener robot"
    //% group="Robot" weight=85
    export function detener(): void {
        copilliMotion.cancel()
        if (!maqueenReady) {
            reportNotReady("Maqueen")
            return
        }
        copilliHardware.stopMotors()
        copilliDiagnostics.setRobot("")
    }

    /**
     * Control avanzado de ruedas con valores entre -100 y 100.
     */
    //% blockId=copilli_mover_ruedas block="mover ruedas izquierda %izquierda derecha %derecha"
    //% izquierda.min=-100 izquierda.max=100 izquierda.defl=40
    //% derecha.min=-100 derecha.max=100 derecha.defl=40
    //% group="Robot" weight=20 advanced=true
    export function moverRuedas(izquierda: number, derecha: number): void {
        copilliMotion.cancel()
        if (!maqueenReady) {
            reportNotReady("Maqueen")
            return
        }
        copilliMotion.write(izquierda, derecha)
        copilliDiagnostics.setRobot("")
    }

    /**
     * Lee distancia en centímetros; -1 significa que no hubo eco válido.
     */
    //% blockId=copilli_distancia_cm block="distancia en cm"
    //% group="Sensores" weight=100
    export function distanciaCm(): number {
        if (!maqueenReady) {
            reportNotReady("Maqueen")
            return -1
        }
        return copilliHardware.distanceCm()
    }

    /**
     * Indica si el sensor seleccionado está sobre una línea negra.
     */
    //% blockId=copilli_sobre_linea block="sensor %sensor sobre línea negra"
    //% group="Sensores" weight=90
    export function sobreLinea(sensor: SensorLinea): boolean {
        if (!maqueenReady) {
            reportNotReady("Maqueen")
            return false
        }
        return copilliHardware.lineSensor(sensor) == 0
    }

    /**
     * Enciende los faros delanteros izquierdo, derecho o ambos.
     */
    //% blockId=copilli_faros block="faros %lado %encendidos"
    //% group="Luces" weight=100
    export function faros(lado: Lado, encendidos: boolean): void {
        if (!maqueenReady) {
            reportNotReady("Maqueen")
            return
        }
        copilliHardware.setHeadlight(lado, encendidos)
        copilliDiagnostics.setRobot("")
    }

    /**
     * API antigua: RGB ambiental no implementado, aunque el hardware lo incluya.
     */
    //% blockId=copilli_luces_inferiores block="luces inferiores color %color"
    //% group="Luces" weight=90 blockHidden=true deprecated=true
    export function lucesInferiores(color: Color): void {
        copilliDiagnostics.setRobot("RGB ambiental no implementado en esta versión; no se envió ninguna salida.")
    }

    /**
     * API antigua: apagado RGB no implementado en esta versión.
     */
    //% blockId=copilli_apagar_luces_inferiores block="apagar luces inferiores"
    //% group="Luces" weight=85 blockHidden=true deprecated=true
    export function apagarLucesInferiores(): void {
        copilliDiagnostics.setRobot("RGB ambiental no implementado en esta versión; no se envió ninguna salida.")
    }
    /** Giro infantil con dos direcciones. La API girar antigua sigue disponible. */
    //% blockId=copilli_girar_direccion block="girar hacia %direccion a potencia %potencia \\%"
    //% potencia.min=0 potencia.max=100 potencia.defl=40
    //% group="Robot" weight=90 advanced=true
    export function girarHacia(direccion: DireccionGiro, potencia: number): void {
        girar(<Lado><number>direccion, potencia)
    }
    //% blockId=copilli_maqueen_preparado block="Maqueen preparado"
    //% group="Avanzado" advanced=true
    export function maqueenPreparado(): boolean { return maqueenReady }
}
