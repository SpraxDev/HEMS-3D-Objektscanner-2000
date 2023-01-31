from time import sleep
import RPi.GPIO as GPIO
from RpiMotorLib import RpiMotorLib
import signal
import board
import adafruit_vl53l1x
import postgres
import webserver
import scanner_state

FORWARD = True
REVERSE = False

DISTANCE_BETWEEN_SENSOR_AND_TURN_TABLE_CENTER_MM=100

def handler(signum, frame):
    res = input("Interrupt? y/n: ")
    if res == 'y':
        GPIO.output(GPIO_motorTeller.GPIO_driver_enable_pin, GPIO.HIGH)
        GPIO.output(GPIO_motorVert.GPIO_driver_enable_pin, GPIO.HIGH)
        sensor.stop_ranging()
        exit(1)

def sensor_scan():
    sleep(.1)
    if sensor.data_ready:
        measuredDistance = sensor.distance * 10
        normalizedDistance = measuredDistance / DISTANCE_BETWEEN_SENSOR_AND_TURN_TABLE_CENTER_MM
        normalizedDistance = max(0, min(1, normalizedDistance))
        print("Distance: {} cm (Normalized: {})".format(measuredDistance, normalizedDistance))
        sensor.clear_interrupt()
        return normalizedDistance
    # else:
    #     print("Sensor not ready!")
    #     sensor.clear_interrupt()
    #     #sensor.start_ranging
    #     sleep(3)
    #     sensor_scan()

class motor():
    def __init__(self, GPIO_direction_pin, GPIO_step_pin, GPIO_pins, motorType, GPIO_driver_enable_pin):
        GPIO.setup(GPIO_driver_enable_pin, GPIO.OUT)
        GPIO.output(GPIO_driver_enable_pin, GPIO.HIGH)
        self.GPIO_direction_pin = GPIO_direction_pin
        self.GPIO_step_pin = GPIO_step_pin
        self.GPIO_pins = GPIO_pins
        self.GPIO_driver_enable_pin = GPIO_driver_enable_pin
        self.motorType = "A4988"

    def setup(self):
        return RpiMotorLib.A4988Nema(self.GPIO_direction_pin, self.GPIO_step_pin, self.GPIO_pins, self.motorType)

def teller_next_step(direction, steps, speed):
    GPIO.output(GPIO_motorTeller.GPIO_driver_enable_pin, GPIO.LOW)
    motorTeller.motor_go(direction, "Full", steps, speed, False, 0.05)
    GPIO.output(GPIO_motorTeller.GPIO_driver_enable_pin, GPIO.HIGH)

def vertical_next_step(direction, steps, speed):
    GPIO.output(GPIO_motorVert.GPIO_driver_enable_pin, GPIO.LOW)
    motorVert.motor_go(direction, "Full", steps, speed, False, 0.05)
    GPIO.output(GPIO_motorVert.GPIO_driver_enable_pin, GPIO.HIGH)


def start_scan():
    scanner_state.state = scanner_state.STATE_RUNNING
    scan_id = postgres.psql_create_object()
    current_scan(scan_id)
    scan_id = -1

def current_scan(scan_id):
    verticalSteps = 0
    while verticalSteps < 3000:
        if scanner_state.state == scanner_state.STATE_SHOULD_STOP:
            break
        tellerSteps = 0
        while tellerSteps < 100:
            if scanner_state.state == scanner_state.STATE_SHOULD_STOP:
                break
            postgres.psql_add_object_measurement(object_id= scan_id, height_index= verticalSteps/60, rotary_table_index= tellerSteps/2, normalized_measured_distance= sensor_scan())
            sensor_scan()
            tellerSteps+=1
            print("[HORIZONTAL] Motor Stepped now at Step ",tellerSteps)
            teller_next_step(FORWARD, 2, 0.05)
        verticalSteps +=60
        print("[VERTICAL] Motor Stepped now at Step ",verticalSteps)
        vertical_next_step(FORWARD, 60, 0.0005)
    scanner_state.state = scanner_state.STATE_STOPPING
    vertical_next_step(REVERSE, verticalSteps, 0.0005)

def loop():
    while True:
        sleep(1)
        if scanner_state.state == scanner_state.STATE_SHOULD_START:
            sensor.start_ranging()
            start_scan()
        elif scanner_state.state == scanner_state.STATE_STOPPING:
            sensor.stop_ranging()
            scanner_state.state = scanner_state.STATE_READY


#Setup GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

#Setup Interrupt
signal.signal(signal.SIGINT, handler)

# Define Motors and Sensor
GPIO_motorTeller = motor(GPIO_direction_pin=20, GPIO_step_pin=21, GPIO_pins=(14, 15, 18), GPIO_driver_enable_pin=26,motorType="A4988")
GPIO_motorVert = motor(GPIO_direction_pin=10, GPIO_step_pin=9, GPIO_pins=(2, 3, 4), GPIO_driver_enable_pin=25, motorType="A4988")
i2c = board.I2C()
sensor = adafruit_vl53l1x.VL53L1X(i2c)

#Setup Motors and Sensor
motorTeller = GPIO_motorTeller.setup()
motorVert = GPIO_motorVert.setup()
sensor.distance_mode = 1
sensor.timing_budget = 20



#main
webserver.startWebServerInOwnThread()

loop()
