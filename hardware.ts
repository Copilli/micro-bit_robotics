namespace copilliHardware {
    interface MotorCommand {
        left: boolean
        direction: number
        speed: number
    }

    const I2C_ADDRESS = 0x10
    const LEFT_MOTOR_REGISTER = 0x00
    const RIGHT_MOTOR_REGISTER = 0x02
    const SERVO_S1_REGISTER = 0x14
    const SERVO_S2_REGISTER = 0x15
    const PULSE_TIMEOUT_US = 29000
    let testDoubleEnabled = false
    let motorCommands: MotorCommand[] = []
    let servoCommandCount = 0
    let lastServoPort = copilli.PuertoServo.S1
    let lastServoAngle = 0
    let fakeDistance = -1
    let fakeLeftLine = 1
    let fakeRightLine = 1

    //% blockHidden=true
    export function driveMotor(left: boolean, direction: number, speed: number): void {
        if (testDoubleEnabled) {
            motorCommands.push({ left: left, direction: direction, speed: speed })
            return
        }
        let packet = pins.createBuffer(3)
        packet[0] = left ? LEFT_MOTOR_REGISTER : RIGHT_MOTOR_REGISTER
        packet[1] = direction
        packet[2] = speed
        pins.i2cWriteBuffer(I2C_ADDRESS, packet)
    }

    //% blockHidden=true
    export function stopMotors(): void {
        driveMotor(true, 0, 0)
        driveMotor(false, 0, 0)
    }

    //% blockHidden=true
    export function setHeadlight(side: copilli.Lado, on: boolean): void {
        if (testDoubleEnabled) return
        if (side == copilli.Lado.Izquierda || side == copilli.Lado.Ambos)
            pins.digitalWritePin(DigitalPin.P8, on ? 1 : 0)
        if (side == copilli.Lado.Derecha || side == copilli.Lado.Ambos)
            pins.digitalWritePin(DigitalPin.P12, on ? 1 : 0)
    }

    //% blockHidden=true
    export function lineSensor(sensor: copilli.SensorLinea): number {
        if (testDoubleEnabled)
            return sensor == copilli.SensorLinea.Izquierdo ? fakeLeftLine : fakeRightLine
        return pins.digitalReadPin(sensor == copilli.SensorLinea.Izquierdo ? DigitalPin.P13 : DigitalPin.P14)
    }

    //% blockHidden=true
    export function distanceCm(): number {
        if (testDoubleEnabled) return fakeDistance
        pins.digitalWritePin(DigitalPin.P1, 0)
        basic.pause(2)
        pins.digitalWritePin(DigitalPin.P1, 1)
        basic.pause(1)
        pins.digitalWritePin(DigitalPin.P1, 0)
        let pulse = pins.pulseIn(DigitalPin.P2, PulseValue.High, PULSE_TIMEOUT_US)
        if (pulse <= 0 || pulse >= PULSE_TIMEOUT_US) return -1
        return Math.round(pulse / 59)
    }

    //% blockHidden=true
    export function setServo(port: copilli.PuertoServo, angle: number): void {
        if (testDoubleEnabled) {
            servoCommandCount++
            lastServoPort = port
            lastServoAngle = angle
            return
        }
        let packet = pins.createBuffer(2)
        packet[0] = port == copilli.PuertoServo.S1 ? SERVO_S1_REGISTER : SERVO_S2_REGISTER
        packet[1] = angle
        pins.i2cWriteBuffer(I2C_ADDRESS, packet)
    }

    //% blockHidden=true
    export function enableTestDouble(): void {
        testDoubleEnabled = true
        motorCommands = []
        servoCommandCount = 0
    }

    //% blockHidden=true
    export function testMotorCommandCount(): number {
        return motorCommands.length
    }

    //% blockHidden=true
    export function testMotorWasLeft(index: number): boolean {
        return index >= 0 && index < motorCommands.length && motorCommands[index].left
    }

    //% blockHidden=true
    export function testMotorDirection(index: number): number {
        return index >= 0 && index < motorCommands.length ? motorCommands[index].direction : -1
    }

    //% blockHidden=true
    export function testMotorSpeed(index: number): number {
        return index >= 0 && index < motorCommands.length ? motorCommands[index].speed : -1
    }

    //% blockHidden=true
    export function testServoCommandCount(): number {
        return servoCommandCount
    }

    //% blockHidden=true
    export function testServoPort(): copilli.PuertoServo {
        return lastServoPort
    }

    //% blockHidden=true
    export function testServoAngle(): number {
        return lastServoAngle
    }

    //% blockHidden=true
    export function setFakeDistance(distance: number): void {
        fakeDistance = distance
    }

    //% blockHidden=true
    export function setFakeLine(sensor: copilli.SensorLinea, value: number): void {
        if (sensor == copilli.SensorLinea.Izquierdo) fakeLeftLine = value
        else fakeRightLine = value
    }
}
