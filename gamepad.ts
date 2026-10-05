namespace copilli {
    const BUTTON_COUNT = 11
    const BUTTON_SCAN_MS = 10
    const VIBRATION_MAX_MS = 5000
    const BUTTON_PINS: DigitalPin[] = [
        DigitalPin.P13, DigitalPin.P14, DigitalPin.P15, DigitalPin.P16, DigitalPin.P8,
        DigitalPin.P1, DigitalPin.P2, DigitalPin.P8, DigitalPin.P13, DigitalPin.P14, DigitalPin.P15
    ]

    interface ButtonListener {
        button: BotonGamepad
        pressed: boolean
        action: Action
        active: boolean
    }

    const MAX_LISTENERS = 32
    let vibrationActive = false
    let gamepadReady = false
    let gamepadProfile = 0
    let pollerStarted = false
    let centerX = 512
    let centerY = 512
    let deadZone = 15
    let stableButtons: boolean[] = [false, false, false, false, false, false, false, false, false, false, false]
    let candidateButtons: boolean[] = [false, false, false, false, false, false, false, false, false, false, false]
    let sampleCounts: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    let listeners: ButtonListener[] = []

    /**
     * Prepara únicamente el GamePad DFR0536 V4. A/B siguen siendo botones nativos.
     */
    //% blockId=copilli_iniciar_gamepad block="iniciar GamePad con joystick (V4)"
    //% group="Preparación" weight=95
    export function iniciarGamepad(): void {
        prepareGamepad(1)
    }

    /** Perfil DFR0536 V2: cuatro direcciones digitales y botones X/Y; A/B siguen nativos. */
    //% blockId=robotics_iniciar_gamepad_botones block="iniciar GamePad de botones (V2)"
    //% group="Preparación" weight=96
    export function iniciarGamepadBotones(): void { prepareGamepad(2) }

    function availableButton(button: number): boolean {
        return gamepadProfile == 1 ? button >= 0 && button <= 4 : button >= 5 && button <= 10
    }

    function prepareGamepad(profile: number): void {
        if (!copilliRuntime.claim(2)) return
        if (gamepadReady) {
            if (gamepadProfile != profile) {
                copilliDiagnostics.setGamepad("Perfil rechazado: reinicia el programa para cambiar entre mando de botones V2 y joystick V4.")
                return
            }
            copilliDiagnostics.setGamepad("")
            return
        }
        gamepadProfile = profile
        pins.setPull(DigitalPin.P1, profile == 1 ? PinPullMode.PullNone : PinPullMode.PullUp)
        pins.setPull(DigitalPin.P2, profile == 1 ? PinPullMode.PullNone : PinPullMode.PullUp)
        pins.setPull(DigitalPin.P13, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P14, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P15, PinPullMode.PullUp)
        if (profile == 1) pins.setPull(DigitalPin.P16, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P8, PinPullMode.PullUp)
        gamepadReady = true
        copilliDiagnostics.setGamepad("")
        for (let i = 0; i < listeners.length; i++) {
            if (!availableButton(listeners[i].button)) copilliDiagnostics.setGamepad("Hay un evento para un botón que no existe en el perfil seleccionado; no se ejecutará.")
        }
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
        if (!gamepadReady || gamepadProfile != 1) {
            copilliDiagnostics.setGamepad("Prepara GamePad con iniciar GamePad antes de leer el joystick.")
            return false
        }
        let x = joystickX()
        let y = joystickY()
        return copilliLogic.dominantDirection(x, y) == direccion
    }

    /**
     * Consulta un botón del perfil seleccionado tras tres muestras estables.
     */
    //% blockId=copilli_boton_presionado block="botón %boton presionado"
    //% group="GamePad" weight=90
    export function botonPresionado(boton: BotonGamepad): boolean {
        if (!gamepadReady) {
            copilliDiagnostics.setGamepad("Prepara GamePad con iniciar GamePad antes de consultar botones.")
            return false
        }
        if (!availableButton(boton)) {
            copilliDiagnostics.setGamepad("Ese botón no existe en el perfil seleccionado.")
            return false
        }
        return boton >= 0 && boton < BUTTON_COUNT ? stableButtons[boton] : false
    }

    /**
     * Ejecuta la acción una vez al detectar la transición a pulsado.
     */
    //% blockId=copilli_al_pulsar_boton block="al pulsar botón %boton"
    //% group="GamePad" weight=80 blockAllowMultiple=1
    export function alPulsarBoton(boton: BotonGamepad, accion: Action): void {
        addButtonListener(boton, true, accion)
    }

    /**
     * Ejecuta la acción una vez al detectar la transición a soltado.
     */
    //% blockId=copilli_al_soltar_boton block="al soltar botón %boton"
    //% group="GamePad" weight=75 blockAllowMultiple=1
    export function alSoltarBoton(boton: BotonGamepad, accion: Action): void {
        addButtonListener(boton, false, accion)
    }

    function addButtonListener(boton: BotonGamepad, pressed: boolean, accion: Action): void {
        if (boton < 0 || boton >= BUTTON_COUNT || boton != Math.round(boton) || listeners.length >= MAX_LISTENERS ||
            (gamepadReady && !availableButton(boton))) {
            copilliDiagnostics.setGamepad("Registro rechazado: botón inválido o límite de 32 manejadores alcanzado.")
            return
        }
        listeners.push({ button: boton, pressed: pressed, action: accion, active: false })
    }

    /**
     * Activa P12 por hasta cinco segundos; en V4 comparte salida con LED, en V2 el LED usa P16.
     */
    //% blockId=copilli_vibrar block="vibrar por %milisegundos ms"
    //% milisegundos.min=0 milisegundos.max=5000 milisegundos.defl=200
    //% group="GamePad" weight=70
    export function vibrar(milisegundos: number): void {
        if (!gamepadReady) {
            copilliDiagnostics.setGamepad("Prepara GamePad con iniciar GamePad antes de vibrar.")
            return
        }
        if (milisegundos != milisegundos) {
            copilliDiagnostics.setGamepad("Duracion de vibracion no valida.")
            return
        }
        if (milisegundos <= 0) return
        if (milisegundos > VIBRATION_MAX_MS) {
            copilliDiagnostics.setGamepad("La vibracion se limita a 5000 ms.")
            milisegundos = VIBRATION_MAX_MS
        }
        if (vibrationActive) {
            copilliDiagnostics.setGamepad("Vibración ocupada: se descarta la solicitud simultánea.")
            return
        }
        vibrationActive = true
        pins.digitalWritePin(DigitalPin.P12, 1)
        basic.pause(milisegundos)
        pins.digitalWritePin(DigitalPin.P12, 0)
        vibrationActive = false
    }

    /**
     * Lee el eje X normalizado: izquierda -100, derecha 100.
     */
    //% blockId=copilli_joystick_x block="joystick X"
    //% group="Avanzado" weight=80 advanced=true
    export function joystickX(): number {
        if (!gamepadReady || gamepadProfile != 1) {
            copilliDiagnostics.setGamepad("Prepara GamePad con iniciar GamePad antes de leer el joystick.")
            return 0
        }
        return copilliLogic.normalizeAxis(pins.analogReadPin(AnalogPin.P1), centerX, deadZone, false)
    }

    /**
     * Lee el eje Y normalizado: arriba 100, abajo -100.
     */
    //% blockId=copilli_joystick_y block="joystick Y"
    //% group="Avanzado" weight=75 advanced=true
    export function joystickY(): number {
        if (!gamepadReady || gamepadProfile != 1) {
            copilliDiagnostics.setGamepad("Prepara GamePad con iniciar GamePad antes de leer el joystick.")
            return 0
        }
        return copilliLogic.normalizeAxis(pins.analogReadPin(AnalogPin.P2), centerY, deadZone, true)
    }

    /**
     * Registra manualmente el centro mientras el joystick está quieto.
     */
    //% blockId=copilli_calibrar_gamepad block="calibrar centro GamePad"
    //% group="Avanzado" weight=70 advanced=true
    export function calibrarCentroGamepad(): void {
        if (!gamepadReady || gamepadProfile != 1) {
            copilliDiagnostics.setGamepad("Prepara GamePad antes de calibrar; deja el joystick en el centro.")
            return
        }
        let proposedX = pins.analogReadPin(AnalogPin.P1)
        let proposedY = pins.analogReadPin(AnalogPin.P2)
        if (proposedX != proposedX || proposedY != proposedY ||
            proposedX < 100 || proposedX > 923 || proposedY < 100 || proposedY > 923) {
            copilliDiagnostics.setGamepad("Calibracion rechazada: centra el joystick y vuelve a intentarlo sin moverlo.")
            return
        }
        centerX = proposedX
        centerY = proposedY
        copilliDiagnostics.setGamepad("")
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
            let transitions: number[] = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
            for (let i = 0; i < BUTTON_COUNT; i++) {
                if (!availableButton(i)) continue
                let raw = pressedOnPin(BUTTON_PINS[i])
                let debounce = copilliLogic.debounceSample(raw, candidateButtons[i], sampleCounts[i], stableButtons[i])
                sampleCounts[i] = Math.idiv(debounce, 8)
                candidateButtons[i] = debounce % 8 >= 4
                let nextStable = debounce % 4 >= 2
                if (debounce % 2 == 1) {
                    stableButtons[i] = nextStable
                    transitions[i] = nextStable ? 1 : 0
                }
            }
            for (let i = 0; i < BUTTON_COUNT; i++) {
                if (availableButton(i) && transitions[i] >= 0) dispatchButton(i, transitions[i] == 1)
            }
        }
        basic.pause(BUTTON_SCAN_MS)
    }

    function startButtonAction(listener: ButtonListener): void {
        control.inBackground(function () {
            listener.action()
            listener.active = false
        })
    }

    //% blockId=copilli_gamepad_preparado block="GamePad preparado"
    //% group="Avanzado" advanced=true
    export function gamepadPreparado(): boolean { return gamepadReady }

    /** Dirección común para mando de cuatro botones V2 o joystick V4. Empates diagonales favorecen X. */
    //% blockId=robotics_mando_hacia block="mando hacia %direccion"
    //% group="GamePad" weight=101
    export function mandoHacia(direccion: DireccionJoystick): boolean {
        if (!gamepadReady) {
            copilliDiagnostics.setGamepad("Prepara el perfil del mando antes de leer su dirección.")
            return false
        }
        return copilliLogic.dominantDirection(mandoX(), mandoY()) == direccion
    }
    //% blockId=robotics_mando_x block="mando X"
    //% group="Avanzado" advanced=true
    export function mandoX(): number {
        if (!gamepadReady) { copilliDiagnostics.setGamepad("Prepara el mando antes de leerlo."); return 0 }
        if (gamepadProfile == 1) return joystickX()
        return (pressedOnPin(DigitalPin.P15) ? 100 : 0) - (pressedOnPin(DigitalPin.P14) ? 100 : 0)
    }
    //% blockId=robotics_mando_y block="mando Y"
    //% group="Avanzado" advanced=true
    export function mandoY(): number {
        if (!gamepadReady) { copilliDiagnostics.setGamepad("Prepara el mando antes de leerlo."); return 0 }
        if (gamepadProfile == 1) return joystickY()
        return (pressedOnPin(DigitalPin.P8) ? 100 : 0) - (pressedOnPin(DigitalPin.P13) ? 100 : 0)
    }

    function dispatchButton(button: number, pressed: boolean): void {
        for (let i = 0; i < listeners.length; i++) {
            let listener = listeners[i]
            if (listener.button == button && listener.pressed == pressed && !listener.active) {
                listener.active = true
                startButtonAction(listener)
            }
        }
    }
}
