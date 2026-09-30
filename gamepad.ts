namespace copilli {
    const BUTTON_COUNT = 5
    const BUTTON_SCAN_MS = 10
    const VIBRATION_MAX_MS = 5000
    const BUTTON_PINS: DigitalPin[] = [
        DigitalPin.P13, DigitalPin.P14, DigitalPin.P15, DigitalPin.P16, DigitalPin.P8
    ]

    interface ButtonListener {
        button: BotonGamepad
        pressed: boolean
        action: Action
    }

    let gamepadReady = false
    let pollerStarted = false
    let centerX = 512
    let centerY = 512
    let deadZone = 15
    let stableButtons: boolean[] = [false, false, false, false, false]
    let candidateButtons: boolean[] = [false, false, false, false, false]
    let sampleCounts: number[] = [0, 0, 0, 0, 0]
    let listeners: ButtonListener[] = []

    /**
     * Prepara únicamente el GamePad DFR0536 V4. A/B siguen siendo botones nativos.
     */
    //% blockId=copilli_iniciar_gamepad block="iniciar GamePad"
    //% group="Avanzado" weight=95
    export function iniciarGamepad(): void {
        if (gamepadReady) return
        pins.setPull(DigitalPin.P1, PinPullMode.PullNone)
        pins.setPull(DigitalPin.P2, PinPullMode.PullNone)
        pins.setPull(DigitalPin.P13, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P14, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P15, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P16, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P8, PinPullMode.PullUp)
        gamepadReady = true
        if (!pollerStarted) {
            pollerStarted = true
            basic.forever(pollButtons)
        }
    }

    /**
     * Devuelve verdadero para la dirección dominante; los empates diagonales favorecen izquierda/derecha.
     */
    //% blockId=copilli_joystick_hacia block="joystick hacia %direccion"
    //% group="GamePad" weight=100
    export function joystickHacia(direccion: DireccionJoystick): boolean {
        if (!gamepadReady) {
            copilliDiagnostics.set("Prepara GamePad con iniciar GamePad antes de leer el joystick.")
            return false
        }
        let x = joystickX()
        let y = joystickY()
        return copilliLogic.dominantDirection(x, y) == direccion
    }

    /**
     * Consulta el estado estable de C, D, E, F o Z (antirrebote de 30 ms).
     */
    //% blockId=copilli_boton_presionado block="botón %boton presionado"
    //% group="GamePad" weight=90
    export function botonPresionado(boton: BotonGamepad): boolean {
        if (!gamepadReady) {
            copilliDiagnostics.set("Prepara GamePad con iniciar GamePad antes de consultar botones.")
            return false
        }
        return stableButtons[boton]
    }

    /**
     * Ejecuta la acción una vez al detectar la transición a pulsado.
     */
    //% blockId=copilli_al_pulsar_boton block="al pulsar botón %boton"
    //% group="GamePad" weight=80
    export function alPulsarBoton(boton: BotonGamepad, accion: Action): void {
        addButtonListener(boton, true, accion)
    }

    /**
     * Ejecuta la acción una vez al detectar la transición a soltado.
     */
    //% blockId=copilli_al_soltar_boton block="al soltar botón %boton"
    //% group="GamePad" weight=75
    export function alSoltarBoton(boton: BotonGamepad, accion: Action): void {
        addButtonListener(boton, false, accion)
    }

    function addButtonListener(boton: BotonGamepad, pressed: boolean, accion: Action): void {
        for (let i = 0; i < listeners.length; i++) {
            if (listeners[i].button == boton && listeners[i].pressed == pressed) {
                listeners[i].action = accion
                return
            }
        }
        listeners.push({ button: boton, pressed: pressed, action: accion })
    }

    /**
     * Activa el vibrador por un máximo de cinco segundos; comparte P12 con el LED del mando.
     */
    //% blockId=copilli_vibrar block="vibrar por %milisegundos ms"
    //% milisegundos.min=0 milisegundos.max=5000 milisegundos.defl=200
    //% group="GamePad" weight=70
    export function vibrar(milisegundos: number): void {
        if (!gamepadReady) {
            copilliDiagnostics.set("Prepara GamePad con iniciar GamePad antes de vibrar.")
            return
        }
        if (milisegundos != milisegundos) {
            copilliDiagnostics.set("Duracion de vibracion no valida.")
            return
        }
        if (milisegundos <= 0) return
        if (milisegundos > VIBRATION_MAX_MS) {
            copilliDiagnostics.set("La vibracion se limita a 5000 ms.")
            milisegundos = VIBRATION_MAX_MS
        }
        pins.digitalWritePin(DigitalPin.P12, 1)
        basic.pause(milisegundos)
        pins.digitalWritePin(DigitalPin.P12, 0)
    }

    /**
     * Lee el eje X normalizado: izquierda -100, derecha 100.
     */
    //% blockId=copilli_joystick_x block="joystick X"
    //% group="Avanzado" weight=80 advanced=true
    export function joystickX(): number {
        if (!gamepadReady) {
            copilliDiagnostics.set("Prepara GamePad con iniciar GamePad antes de leer el joystick.")
            return 0
        }
        return copilliLogic.normalizeAxis(pins.analogReadPin(AnalogPin.P1), centerX, Math.round(deadZone * 1023 / 200), false)
    }

    /**
     * Lee el eje Y normalizado: arriba 100, abajo -100.
     */
    //% blockId=copilli_joystick_y block="joystick Y"
    //% group="Avanzado" weight=75 advanced=true
    export function joystickY(): number {
        if (!gamepadReady) {
            copilliDiagnostics.set("Prepara GamePad con iniciar GamePad antes de leer el joystick.")
            return 0
        }
        return copilliLogic.normalizeAxis(pins.analogReadPin(AnalogPin.P2), centerY, Math.round(deadZone * 1023 / 200), true)
    }

    /**
     * Registra manualmente el centro mientras el joystick está quieto.
     */
    //% blockId=copilli_calibrar_gamepad block="calibrar centro GamePad"
    //% group="Avanzado" weight=70 advanced=true
    export function calibrarCentroGamepad(): void {
        if (!gamepadReady) {
            copilliDiagnostics.set("Prepara GamePad antes de calibrar; deja el joystick en el centro.")
            return
        }
        let proposedX = pins.analogReadPin(AnalogPin.P1)
        let proposedY = pins.analogReadPin(AnalogPin.P2)
        if (proposedX < 100 || proposedX > 923 || proposedY < 100 || proposedY > 923) {
            copilliDiagnostics.set("Calibracion rechazada: centra el joystick y vuelve a intentarlo sin moverlo.")
            return
        }
        centerX = proposedX
        centerY = proposedY
        copilliDiagnostics.set("")
    }

    /**
     * Configura la zona muerta como porcentaje de cada semieje (0 a 30).
     */
    //% blockId=copilli_zona_muerta block="zona muerta del joystick %porcentaje \\%"
    //% porcentaje.min=0 porcentaje.max=30 porcentaje.defl=15
    //% group="Avanzado" weight=65 advanced=true
    export function configurarZonaMuerta(porcentaje: number): void {
        deadZone = copilliLogic.limit(porcentaje, 0, 30)
    }

    function pressedOnPin(pin: DigitalPin): boolean {
        return pins.digitalReadPin(pin) == 0
    }

    function pollButtons(): void {
        if (gamepadReady) {
            for (let i = 0; i < BUTTON_COUNT; i++) {
                let raw = pressedOnPin(BUTTON_PINS[i])
                let debounce = copilliLogic.debounceSample(raw, candidateButtons[i], sampleCounts[i], stableButtons[i])
                sampleCounts[i] = Math.idiv(debounce, 8)
                candidateButtons[i] = debounce % 8 >= 4
                let nextStable = debounce % 4 >= 2
                if (debounce % 2 == 1) {
                    stableButtons[i] = nextStable
                    dispatchButton(i, nextStable)
                }
            }
        }
        basic.pause(BUTTON_SCAN_MS)
    }

    function dispatchButton(button: number, pressed: boolean): void {
        for (let i = 0; i < listeners.length; i++) {
            let listener = listeners[i]
            if (listener.button == button && listener.pressed == pressed)
                listener.action()
        }
    }
}
