namespace copilliDiagnostics {
    let message = ""

    //% blockHidden=true
    export function set(nextMessage: string): void {
        message = nextMessage
    }

    //% blockHidden=true
    export function lastMessage(): string {
        return message
    }
}

namespace copilli {
    /**
     * Consulta el último aviso de Copilli sin interrumpir el programa.
     */
    //% blockId=copilli_diagnostico block="último diagnóstico Copilli"
    //% group="Avanzado" weight=10 advanced=true
    export function diagnostico(): string {
        return copilliDiagnostics.lastMessage()
    }
}
