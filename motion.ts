namespace copilliMotion {
    interface Settings {
        power: number
        turnPower: number
        balance: number
        leftMinimum: number
        rightMinimum: number
        heading: boolean
        gain: number
        correctionLimit: number
        tolerance: number
    }
    interface Calibration {
        cms: number
        revision: number
    }
    let settings: Settings = { power: 40, turnPower: 30, balance: 0, leftMinimum: 0,
        rightMinimum: 0, heading: false, gain: 0.5, correctionLimit: 15, tolerance: 5 }
    let revision = 0
    let calibrations: Calibration[] = [null, null]
    let operation = 0
    let compassReady = false

    //% blockHidden=true
    export function finite(value: number): boolean { return value - value == 0 }
    function valid(value: number, low: number, high: number): boolean {
        return finite(value) && value >= low && value <= high
    }
    function snapshot(): Settings {
        return { power: settings.power, turnPower: settings.turnPower, balance: settings.balance,
            leftMinimum: settings.leftMinimum, rightMinimum: settings.rightMinimum,
            heading: settings.heading, gain: settings.gain, correctionLimit: settings.correctionLimit,
            tolerance: settings.tolerance }
    }
    //% blockHidden=true
    export function cancel(): number { operation++; return operation }
    function ready(): boolean {
        if (copilli.copilliRobotIsReady()) return true
        copilliDiagnostics.setRobot("Prepara Maqueen antes de mover el robot.")
        return false
    }
    function stop(id: number, message: string): void {
        if (id != operation) return
        copilliHardware.stopMotors()
        copilliDiagnostics.setRobot(message)
    }
    function wheel(left: boolean, value: number, cfg: Settings): void {
        value = copilliLogic.limit(value, -100, 100)
        if (value == 0) { copilliHardware.driveMotor(left, 0, 0); return }
        let minimum = left ? cfg.leftMinimum : cfg.rightMinimum
        let magnitude = minimum + Math.abs(value) * (100 - minimum) / 100
        let reduction = left ? Math.max(0, -cfg.balance) : Math.max(0, cfg.balance)
        magnitude = magnitude * (100 - reduction) / 100
        copilliHardware.driveMotor(left, value < 0 ? 1 : 0, Math.round(magnitude * 255 / 100))
    }
    //% blockHidden=true
    export function write(left: number, right: number): void { output(left, right, settings) }
    function output(left: number, right: number, cfg: Settings): void {
        wheel(true, left, cfg); wheel(false, right, cfg)
    }
    function fault(message: string): void {
        let id = cancel()
        if (ready()) stop(id, message)
    }
    function delta(current: number, previous: number): number {
        let difference = current - previous
        if (difference > 180) difference -= 360
        if (difference < -180) difference += 360
        return difference
    }
    function heading(): number {
        let value = input.compassHeading()
        return valid(value, 0, 359) ? value : -1
    }
    function initialHeading(id: number, cfg: Settings): number {
        if (!cfg.heading) return 0
        if (!compassReady) { stop(id, "Prepara la brújula antes de usar grados o mantener rumbo."); return -1 }
        let value = heading()
        if (value < 0) stop(id, "Lectura de brújula no válida; robot detenido.")
        return value
    }
    function straight(id: number, direction: number, cfg: Settings, target: number, current: number): void {
        if (id != operation) return
        let correction = cfg.heading ? copilliLogic.limit(delta(current, target) * cfg.gain,
            -cfg.correctionLimit, cfg.correctionLimit) : 0
        let power = direction == 0 ? cfg.power : -cfg.power
        // Positive heading error needs a left turn, also when reversing.
        // Never reverse a wheel merely to correct the straight trajectory.
        let low = direction == 0 ? 0 : -100
        let high = direction == 0 ? 100 : 0
        output(copilliLogic.limit(power - correction, low, high),
            copilliLogic.limit(power + correction, low, high), cfg)
    }
    function straightLoop(id: number, direction: number, cfg: Settings, target: number, duration: number): void {
        let started = control.millis()
        let previous = target
        while (id == operation) {
            let elapsed = control.millis() - started
            if (duration >= 0 && elapsed >= duration) { stop(id, ""); return }
            let current = cfg.heading ? heading() : 0
            if (id != operation) return
            if (cfg.heading && (current < 0 || Math.abs(delta(current, previous)) > 45)) {
                stop(id, "Lectura de brújula inválida o salto mayor a 45°; robot detenido."); return
            }
            previous = current
            straight(id, direction, cfg, target, current)
            basic.pause(duration >= 0 ? Math.min(20, Math.max(1, duration - elapsed)) : 20)
        }
    }
    //% blockHidden=true
    export function setPower(value: number, turn: boolean): void {
        if (!valid(value, 0, 100)) { copilliDiagnostics.setRobot("Potencia no válida: usa 0–100%."); return }
        if (turn) settings.turnPower = value
        else if (settings.power != value) { settings.power = value; revision++ }
        copilliDiagnostics.setRobot("")
    }
    //% blockHidden=true
    export function setBalance(value: number): void {
        if (!valid(value, -30, 30)) { copilliDiagnostics.setRobot("Balance no válido: usa -30–30."); return }
        if (settings.balance != value) { settings.balance = value; revision++ }
        copilliDiagnostics.setRobot("")
    }
    //% blockHidden=true
    export function setMinimum(left: number, right: number): void {
        if (!valid(left, 0, 60) || !valid(right, 0, 60)) {
            copilliDiagnostics.setRobot("Mínimos no válidos: usa 0–60% por rueda."); return
        }
        if (left != settings.leftMinimum || right != settings.rightMinimum) revision++
        settings.leftMinimum = left; settings.rightMinimum = right
        copilliDiagnostics.setRobot("")
    }
    //% blockHidden=true
    export function setHeading(enabled: boolean): void {
        if (settings.heading != enabled) { settings.heading = enabled; revision++ }
        copilliDiagnostics.setRobot("")
    }
    //% blockHidden=true
    export function setCorrection(gain: number, limit: number): void {
        if (!valid(gain, 0, 5) || !valid(limit, 0, 50)) {
            copilliDiagnostics.setRobot("Corrección no válida: intensidad 0–5, límite 0–50%."); return
        }
        if (gain != settings.gain || limit != settings.correctionLimit) revision++
        settings.gain = gain; settings.correctionLimit = limit
        copilliDiagnostics.setRobot("")
    }
    //% blockHidden=true
    export function setTolerance(value: number): void {
        if (!valid(value, 2, 15)) { copilliDiagnostics.setRobot("Tolerancia no válida: usa 2–15°."); return }
        settings.tolerance = value
        copilliDiagnostics.setRobot("")
    }
    //% blockHidden=true
    export function calibrate(direction: number, cm: number, seconds: number): void {
        if ((direction != 0 && direction != 1) || !finite(cm) || cm <= 0 ||
            !valid(seconds, 0, 120) || seconds == 0 || settings.power == 0 || !finite(cm / seconds) || cm / seconds <= 0) {
            copilliDiagnostics.setRobot("Calibración rechazada: dirección válida, cm y segundos positivos, potencia mayor a cero."); return
        }
        calibrations[direction] = { cms: cm / seconds, revision: revision }
        copilliDiagnostics.setRobot("")
    }
    //% blockHidden=true
    export function calibrated(direction: number): boolean {
        return (direction == 0 || direction == 1) && calibrations[direction] != null &&
            calibrations[direction].revision == revision
    }
    //% blockHidden=true
    export function prepareCompass(): void {
        let id = cancel()
        compassReady = false
        if (!ready()) return
        stop(id, "")
        input.calibrateCompass()
        basic.pause(500)
        if (id != operation) return
        let validHeading = heading() >= 0
        if (id != operation) return
        compassReady = validHeading
        copilliDiagnostics.setRobot(compassReady ? "" : "Brújula no preparada: lectura inválida.")
    }
    //% blockHidden=true
    export function compassPrepared(): boolean { return compassReady }
    //% blockHidden=true
    export function move(direction: number, quantity: number, unit: number, continuous: boolean): void {
        if ((direction != 0 && direction != 1) || !finite(quantity) || quantity < 0 ||
            (unit != 0 && unit != 1)) { fault("Movimiento rechazado: dirección, unidad o cantidad no válida."); return }
        let id = cancel()
        if (!ready()) return
        stop(id, "")
        if (!continuous && quantity == 0) return
        let cfg = snapshot()
        if (cfg.power == 0) return
        let duration = continuous ? -1 : quantity * 1000
        if (!continuous && unit == 1) {
            if (!calibrated(direction)) { stop(id, "Falta calibración vigente de cm para esta dirección y ajustes."); return }
            duration = quantity / calibrations[direction].cms * 1000
        }
        if (!continuous && (!finite(duration) || duration > 120000)) {
            stop(id, "Movimiento rechazado: máximo 120 segundos por maniobra."); return
        }
        let target = initialHeading(id, cfg)
        if (id != operation || target < 0) return
        straight(id, direction, cfg, target, target)
        if (continuous) {
            if (cfg.heading) control.inBackground(() => straightLoop(id, direction, cfg, target, -1))
        } else straightLoop(id, direction, cfg, target, duration)
    }
    function turnOutput(id: number, direction: number, power: number, cfg: Settings): void {
        if (id != operation) return
        output(direction == 0 ? -power : power, direction == 0 ? power : -power, cfg)
    }
    //% blockHidden=true
    export function turn(direction: number, quantity: number, unit: number): void {
        if ((direction != 0 && direction != 1) || !finite(quantity) || quantity < 0 ||
            (unit != 0 && unit != 1) || (unit == 0 && quantity > 360) || (unit == 1 && quantity > 120)) {
            fault("Giro rechazado: usa dirección/unidad válida, 0–360 grados o 0–120 segundos."); return
        }
        let id = cancel()
        if (!ready()) return
        stop(id, "")
        if (quantity == 0) return
        let cfg = snapshot()
        if (cfg.turnPower == 0) return
        if (unit == 1) {
            let start = control.millis()
            turnOutput(id, direction, cfg.turnPower, cfg)
            while (id == operation && control.millis() - start < quantity * 1000)
                basic.pause(Math.min(20, Math.max(1, quantity * 1000 - (control.millis() - start))))
            stop(id, ""); return
        }
        cfg.heading = true
        let previous = initialHeading(id, cfg)
        if (id != operation || previous < 0) return
        let progress = 0
        let best = 0
        let start = control.millis()
        let lastProgress = start
        while (id == operation) {
            if (progress >= Math.max(0, quantity - cfg.tolerance)) { stop(id, ""); return }
            let now = control.millis()
            if (now - start >= 30000 || now - lastProgress >= 2000) {
                stop(id, "Giro detenido: tiempo máximo o ausencia de progreso de brújula."); return
            }
            turnOutput(id, direction, cfg.turnPower * (quantity - progress <= 20 ? 0.5 : 1), cfg)
            basic.pause(20)
            if (id != operation) return
            let current = heading()
            if (id != operation) return
            let difference = delta(current, previous)
            if (current < 0 || Math.abs(difference) > 45) {
                stop(id, "Giro detenido: lectura inválida o salto de brújula mayor a 45°."); return
            }
            progress += difference * (direction == 0 ? -1 : 1)
            previous = current
            if (progress >= best + 1) { best = progress; lastProgress = control.millis() }
        }
    }
}

namespace copilli {
    /** Potencia ordenada, no velocidad física medida. Se aplica a las siguientes órdenes. */
    //% blockId=copilli_potencia_movimiento block="fijar potencia de movimiento a %potencia \\%"
    //% potencia.min=0 potencia.max=100 potencia.defl=40
    //% group="Preparación" weight=99
    export function fijarPotenciaMovimiento(potencia: number): void { copilliMotion.setPower(potencia, false) }
    //% blockId=copilli_potencia_giro block="fijar potencia de giro a %potencia \\%"
    //% potencia.min=0 potencia.max=100 potencia.defl=30
    //% group="Preparación" weight=98
    export function fijarPotenciaGiro(potencia: number): void { copilliMotion.setPower(potencia, true) }
    /** Negativo reduce izquierda; positivo reduce derecha. No mueve el robot. */
    //% blockId=copilli_balance_ruedas block="ajustar balance de ruedas a %balance"
    //% balance.min=-30 balance.max=30 balance.defl=0
    //% group="Preparación" weight=97
    export function ajustarBalanceRuedas(balance: number): void { copilliMotion.setBalance(balance) }
    /** Detiene las ruedas, calibra la brújula nativa y espera 500 ms. */
    //% blockId=copilli_preparar_brujula block="preparar brújula"
    //% group="Preparación" weight=96
    export function prepararBrujula(): void { copilliMotion.prepareCompass() }
    /** Corrección opcional para las nuevas órdenes rectas, incluso en reversa. */
    //% blockId=copilli_mantener_rumbo block="mantener rumbo con brújula %activado"
    //% group="Preparación" weight=95
    export function mantenerRumboConBrujula(activado: boolean): void { copilliMotion.setHeading(activado) }
    //% blockId=copilli_mover_continuamente block="mover %direccion continuamente"
    //% group="Robot" weight=110
    export function moverContinuamente(direccion: DireccionMovimiento): void { copilliMotion.move(direccion, 0, 0, true) }
    /** Espera hasta terminar y detiene. Los cm son una estimación calibrada por tiempo. */
    //% blockId=copilli_mover_por block="mover %direccion por %cantidad %unidad"
    //% cantidad.min=0 cantidad.defl=1
    //% group="Robot" weight=109
    export function moverPor(direccion: DireccionMovimiento, cantidad: number, unidad: UnidadMovimiento): void {
        copilliMotion.move(direccion, cantidad, unidad, false)
    }
    /** Giro relativo con brújula (máximo 360°) o tiempo. Espera y detiene al terminar. */
    //% blockId=copilli_girar_por block="girar %direccion por %cantidad %unidad"
    //% cantidad.min=0 cantidad.defl=90
    //% group="Robot" weight=108
    export function girarPor(direccion: DireccionGiro, cantidad: number, unidad: UnidadGiro): void {
        copilliMotion.turn(direccion, cantidad, unidad)
    }
    //% blockId=copilli_minimos_ruedas block="mínimo de arranque izquierda %izquierda \\% derecha %derecha \\%"
    //% izquierda.min=0 izquierda.max=60 derecha.min=0 derecha.max=60
    //% group="Avanzado" advanced=true
    export function configurarMinimosRuedas(izquierda: number, derecha: number): void { copilliMotion.setMinimum(izquierda, derecha) }
    /** Registra lo medido a la potencia y ajustes actuales. Configurar no mueve. */
    //% blockId=copilli_calibrar_recorrido block="calibrar recorrido %direccion midió %cm cm en %segundos segundos"
    //% cm.min=0 cm.defl=20 segundos.min=0 segundos.max=120 segundos.defl=2
    //% group="Avanzado" advanced=true
    export function calibrarRecorrido(direccion: DireccionMovimiento, cm: number, segundos: number): void {
        copilliMotion.calibrate(direccion, cm, segundos)
    }
    //% blockId=copilli_recorrido_calibrado block="recorrido %direccion con calibración vigente"
    //% group="Avanzado" advanced=true
    export function recorridoCalibrado(direccion: DireccionMovimiento): boolean { return copilliMotion.calibrated(direccion) }
    //% blockId=copilli_correccion_rumbo block="corrección de rumbo intensidad %intensidad límite %limite \\%"
    //% intensidad.min=0 intensidad.max=5 intensidad.defl=0.5 limite.min=0 limite.max=50 limite.defl=15
    //% group="Avanzado" advanced=true
    export function configurarCorreccionRumbo(intensidad: number, limite: number): void { copilliMotion.setCorrection(intensidad, limite) }
    //% blockId=copilli_tolerancia_giro block="tolerancia de giro %grados grados"
    //% grados.min=2 grados.max=15 grados.defl=5
    //% group="Avanzado" advanced=true
    export function configurarToleranciaGiro(grados: number): void { copilliMotion.setTolerance(grados) }
    //% blockId=copilli_brujula_preparada block="brújula preparada"
    //% group="Avanzado" advanced=true
    export function brujulaPreparada(): boolean { return copilliMotion.compassPrepared() }
}
