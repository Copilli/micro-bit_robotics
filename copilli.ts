//% color=#7B3F98 icon="\uf1b9" block="Robotics" groups='["Preparación","Robot","Sensores","Luces","GamePad","Mechanic","Avanzado"]'
namespace copilli {
    export enum Lado {
        //% block="izquierda"
        Izquierda = 0,
        //% block="derecha"
        Derecha = 1,
        //% block="ambos"
        Ambos = 2
    }

    export enum DireccionGiro {
        //% block="izquierda"
        Izquierda = 0,
        //% block="derecha"
        Derecha = 1
    }

    export enum EjeMechanic {
        //% block="apertura de pinza"
        AperturaPinza = 0,
        //% block="pala"
        Pala = 1,
        //% block="horquillas"
        Horquillas = 2,
        //% block="sensor Push"
        SensorPush = 3,
        //% block="elevación de pinza"
        ElevacionPinza = 4
    }

    export enum SensorLinea {
        //% block="izquierdo"
        Izquierdo = 0,
        //% block="derecho"
        Derecho = 1
    }

    export enum DireccionJoystick {
        //% block="arriba"
        Arriba = 0,
        //% block="abajo"
        Abajo = 1,
        //% block="izquierda"
        Izquierda = 2,
        //% block="derecha"
        Derecha = 3,
        //% block="centro"
        Centro = 4
    }

    export enum BotonGamepad {
        //% block="C"
        C = 0,
        //% block="D"
        D = 1,
        //% block="E"
        E = 2,
        //% block="F"
        F = 3,
        //% block="Z"
        Z = 4,
        //% block="X (mando de botones)"
        X = 5,
        //% block="Y (mando de botones)"
        Y = 6,
        //% block="arriba (mando de botones)"
        Arriba = 7,
        //% block="abajo (mando de botones)"
        Abajo = 8,
        //% block="izquierda (mando de botones)"
        Izquierda = 9,
        //% block="derecha (mando de botones)"
        Derecha = 10
    }

    export enum PuertoServo {
        //% block="S1"
        S1 = 0,
        //% block="S2"
        S2 = 1
    }

    export enum Mecanismo {
        //% block="pinza Beetle"
        Pinza = 0,
        //% block="pala Loader"
        Pala = 1,
        //% block="horquillas Forklift"
        Horquillas = 2
    }

    export enum DireccionSensor {
        //% block="izquierda"
        Izquierda = 0,
        //% block="frente"
        Frente = 1,
        //% block="derecha"
        Derecha = 2
    }

    export enum Color {
        //% block="rojo"
        Rojo = 0xFF0000,
        //% block="verde"
        Verde = 0x00FF00,
        //% block="azul"
        Azul = 0x0000FF,
        //% block="amarillo"
        Amarillo = 0xFFFF00,
        //% block="blanco"
        Blanco = 0xFFFFFF,
        //% block="apagado"
        Apagado = 0
    }
}

namespace copilliLogic {
    //% blockHidden=true
    export function limit(value: number, minimum: number, maximum: number): number {
        if (value != value) return 0
        if (value < minimum) return minimum
        if (value > maximum) return maximum
        return value
    }

    //% blockHidden=true
    export function angleBetween(low: number, high: number, percentage: number): number {
        let percent = limit(percentage, 0, 100)
        return Math.round(low + (high - low) * percent / 100)
    }

    //% blockHidden=true
    export function normalizeAxis(raw: number, center: number, deadZone: number, invert: boolean): number {
        if (raw != raw || center < 100 || center > 923 || deadZone != deadZone) return 0
        let delta = limit(raw, 0, 1023) - center
        let span = delta < 0 ? center : 1023 - center
        let normalized = Math.abs(delta) * 100 / span
        let zone = limit(deadZone, 0, 30)
        if (normalized <= zone) return 0
        let scaled = Math.round((normalized - zone) * 100 / (100 - zone))
        let sign = delta < 0 ? -1 : 1
        return (invert ? -sign : sign) * limit(scaled, 0, 100)
    }

    //% blockHidden=true
    export function dominantDirection(x: number, y: number): copilli.DireccionJoystick {
        if (Math.abs(x) >= Math.abs(y) && x != 0)
            return x < 0 ? copilli.DireccionJoystick.Izquierda : copilli.DireccionJoystick.Derecha
        if (y != 0)
            return y > 0 ? copilli.DireccionJoystick.Arriba : copilli.DireccionJoystick.Abajo
        return copilli.DireccionJoystick.Centro
    }

    //% blockHidden=true
    export function debounceSample(raw: boolean, candidate: boolean, count: number, stable: boolean): number {
        let nextCount = count
        if (raw != candidate) nextCount = 1
        else if (nextCount < 3) nextCount++
        let nextStable = nextCount >= 3 ? raw : stable
        return nextCount * 8 + (raw ? 4 : 0) + (nextStable ? 2 : 0) + (nextStable != stable ? 1 : 0)
    }
}
