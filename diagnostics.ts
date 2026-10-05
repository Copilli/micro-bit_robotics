namespace copilliDiagnostics {
    let message = ""
    let robotMessage = ""
    let gamepadMessage = ""
    let mechanicMessages: string[] = ["", "", "", "", ""]
    //% blockHidden=true
    export function set(nextMessage: string): void { message = nextMessage }
    //% blockHidden=true
    export function setRobot(nextMessage: string): void { robotMessage = nextMessage; set(nextMessage) }
    //% blockHidden=true
    export function setGamepad(nextMessage: string): void { gamepadMessage = nextMessage; set(nextMessage) }
    //% blockHidden=true
    export function setMechanic(axis: number, nextMessage: string): void {
        if (axis >= 0 && axis <= 4) mechanicMessages[axis] = nextMessage
        set(nextMessage)
    }
    //% blockHidden=true
    export function robot(): string { return robotMessage }
    //% blockHidden=true
    export function gamepad(): string { return gamepadMessage }
    //% blockHidden=true
    export function mechanic(axis: number): string { return axis >= 0 && axis <= 4 ? mechanicMessages[axis] : "Eje no válido" }
    //% blockHidden=true
    export function lastMessage(): string { return message }
}

namespace copilliRuntime {
    let role = 0
    //% blockHidden=true
    export function claim(requested: number): boolean {
        if (role != 0 && role != requested) {
            let notice = "Rol rechazado: robot y GamePad usan pines compartidos. Reinicia con un solo rol."
            if (requested == 1) copilliDiagnostics.setRobot(notice)
            else copilliDiagnostics.setGamepad(notice)
            return false
        }
        role = requested
        return true
    }
}

namespace copilli {
    /** último aviso de una operación; no representa todo el estado del sistema. */
    //% blockId=copilli_diagnostico block="último diagnóstico Copilli"
    //% group="Avanzado" weight=10 advanced=true
    export function diagnostico(): string { return copilliDiagnostics.lastMessage() }
    //% blockId=copilli_diagnostico_robot block="diagnóstico del robot"
    //% group="Avanzado" advanced=true
    export function diagnosticoRobot(): string { return copilliDiagnostics.robot() }
    //% blockId=copilli_diagnostico_gamepad block="diagnóstico del GamePad"
    //% group="Avanzado" advanced=true
    export function diagnosticoGamepad(): string { return copilliDiagnostics.gamepad() }
    //% blockId=copilli_diagnostico_mechanic block="diagnóstico de %eje"
    //% group="Avanzado" advanced=true
    export function diagnosticoMechanic(eje: EjeMechanic): string { return copilliDiagnostics.mechanic(eje) }
}
