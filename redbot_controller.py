"""
Copyright (c) 2015 Alan Yorinks All rights reserved.

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU  General Public
License as published by the Free Software Foundation; either
version 3 of the License, or (at your option) any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
General Public License for more details.

You should have received a copy of the GNU General Public
License along with this library; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
"""
import asyncio
import json
import math

from pymata_aio.constants import Constants
from pymata_aio.pymata_core import PymataCore


# from redbot_accel import RedBotAccel
# from . import redbot_accel
from redbot_accel import RedBotAccel


class RedBotController:
    pins = {"LEFT_BUMPER": 3, "RIGHT_BUMPER": 11, "BUTTON_SWITCH": 12, "BUZZER": 9, "IR_SENSOR_1": 3,
            "IR_SENSOR_2": 6, "IR_SENSOR_3": 7, "LEFT_ENCODER": 16, "RIGHT_ENCODER": 10,
            "LEFT_MOTOR_CONTROL_1": 2, "LEFT_MOTOR_CONTROL_2": 4, "LEFT_MOTOR_SPEED": 5,
            "RIGHT_MOTOR_CONTROL_1": 7, "RIGHT_MOTOR_CONTROL_2": 8, "RIGHT_MOTOR_SPEED": 6,
            "LED": 13}

    PORTRAIT_U = 0
    PORTRAIT_D = 1
    LANDSCAPE_R = 2
    LANDSCAPE_L = 3
    LOCKOUT = 0x40

    data_start = 2

    # motor control designator
    LEFT_MOTOR = 0
    RIGHT_MOTOR = 1

    # motor control command
    FORWARD = 0
    REVERSE = 1
    COAST = 2
    BRAKE = 3
    client_ready = False
    accel = None
    lbump_wait = False
    rbump_wait = False

    def __init__(self, board):
        self.socket = None
        self.board = board
        self.accel_read_enable = False

    @asyncio.coroutine
    def init_red_board(self):
        yield from self.board.start_aio()

        self.accel = RedBotAccel(self.board, 0x1d, 2, 0)

        #  ir sensors
        yield from self.board.set_pin_mode(self.pins["IR_SENSOR_1"], Constants.ANALOG, self.ir1_callback,
                                           Constants.CB_TYPE_ASYNCIO)
        yield from self.board.set_pin_mode(self.pins["IR_SENSOR_2"], Constants.ANALOG, self.ir2_callback,
                                           Constants.CB_TYPE_ASYNCIO)
        yield from self.board.set_pin_mode(self.pins["IR_SENSOR_3"], Constants.ANALOG, self.ir3_callback,
                                           Constants.CB_TYPE_ASYNCIO)

        yield from self.board.set_pin_mode(3, Constants.INPUT, self.left_bumper_callback, Constants.CB_TYPE_ASYNCIO)
        yield from self.board.digital_write(3, 1)

        yield from self.board.set_pin_mode(self.pins["LED"], Constants.OUTPUT)

        # motors
        yield from self.board.set_pin_mode(self.pins["LEFT_MOTOR_CONTROL_1"], Constants.OUTPUT)
        yield from self.board.set_pin_mode(self.pins["LEFT_MOTOR_CONTROL_2"], Constants.OUTPUT)
        yield from self.board.set_pin_mode(self.pins["RIGHT_MOTOR_CONTROL_1"], Constants.OUTPUT)
        yield from self.board.set_pin_mode(self.pins["RIGHT_MOTOR_CONTROL_2"], Constants.OUTPUT)

        yield from self.board.set_pin_mode(self.pins["LEFT_MOTOR_SPEED"], Constants.PWM)

        # set speed to zero
        yield from self.board.analog_write(self.pins["LEFT_MOTOR_SPEED"], 0)

        yield from self.board.set_pin_mode(self.pins["RIGHT_MOTOR_SPEED"], Constants.PWM)

        # set speed to zero
        yield from self.board.analog_write(self.pins["RIGHT_MOTOR_SPEED"], 0)

        # initialize digital inputs that require pull-ups enabled
        yield from self.board.set_pin_mode(self.pins["BUTTON_SWITCH"], Constants.INPUT, self.button_callback,
                                           Constants.CB_TYPE_ASYNCIO)
        yield from self.board.digital_write(self.pins["BUTTON_SWITCH"], 1)

        # initialize bumper pins
        yield from self.board.set_pin_mode(self.pins["LEFT_BUMPER"], Constants.INPUT,
                                           self.left_bumper_callback, Constants.CB_TYPE_ASYNCIO)
        yield from self.board.digital_write(self.pins["LEFT_BUMPER"], 1)

        yield from self.board.set_pin_mode(self.pins["RIGHT_BUMPER"], Constants.INPUT, self.right_bumper_callback,
                                           Constants.CB_TYPE_ASYNCIO)
        yield from self.board.digital_write(self.pins["RIGHT_BUMPER"], 1)
        yield from self.accel.start()

        # enable encoders
        yield from self.board.encoder_config(self.pins["LEFT_ENCODER"], self.pins["RIGHT_ENCODER"],
                                             self.left_encoder_callback, Constants.CB_TYPE_ASYNCIO, True)

        return True

    @asyncio.coroutine
    def motor_control(self, motor, command, speed=None):
        if motor == self.LEFT_MOTOR:
            if command == self.BRAKE:
                yield from self.board.digital_write(self.pins["LEFT_MOTOR_CONTROL_1"], 1)
                yield from self.board.digital_write(self.pins["LEFT_MOTOR_CONTROL_2"], 1)
                return
            elif command == self.FORWARD:
                yield from self.board.digital_write(self.pins["LEFT_MOTOR_CONTROL_1"], 1)
                yield from self.board.digital_write(self.pins["LEFT_MOTOR_CONTROL_2"], 0)
            elif command == self.REVERSE:  # must be
                yield from self.board.digital_write(self.pins["LEFT_MOTOR_CONTROL_1"], 0)
                yield from self.board.digital_write(self.pins["LEFT_MOTOR_CONTROL_2"], 1)
            else:  # default is coast
                yield from self.board.digital_write(self.pins["LEFT_MOTOR_CONTROL_1"], 0)
                yield from self.board.digital_write(self.pins["LEFT_MOTOR_CONTROL_2"], 0)
                return
            # set speed for forward and reverse if specified
            if speed:
                yield from self.board.analog_write(self.pins["LEFT_MOTOR_SPEED"], speed)
        else:
            if command == self.BRAKE:
                yield from self.board.digital_write(self.pins["RIGHT_MOTOR_CONTROL_1"], 1)
                yield from self.board.digital_write(self.pins["RIGHT_MOTOR_CONTROL_2"], 1)
                return
            elif command == self.FORWARD:
                yield from self.board.digital_write(self.pins["RIGHT_MOTOR_CONTROL_1"], 1)
                yield from self.board.digital_write(self.pins["RIGHT_MOTOR_CONTROL_2"], 0)
            elif command == self.REVERSE:  # must be
                yield from self.board.digital_write(self.pins["RIGHT_MOTOR_CONTROL_1"], 0)
                yield from self.board.digital_write(self.pins["RIGHT_MOTOR_CONTROL_2"], 1)
            else:  # default is coast
                yield from self.board.digital_write(self.pins["RIGHT_MOTOR_CONTROL_1"], 0)
                yield from self.board.digital_write(self.pins["RIGHT_MOTOR_CONTROL_2"], 0)
                return
            # set speed for forward and reverse if specified
            if speed:
                yield from self.board.analog_write(self.pins["RIGHT_MOTOR_SPEED"], speed)

    @asyncio.coroutine
    def send_msg(self, msg):
        self.socket.sendMessage(msg)
        yield from asyncio.sleep(1)

    @asyncio.coroutine
    def get_accel_data(self):
        while True:
            avail = yield from self.accel.available()
            if not avail:
                yield from asyncio.sleep(.001)
                continue
            yield from self.accel.read(self.accel_axis_callback)
            yield from self.accel.read_portrait_landscape(self.accel_pl_callback)
            yield from self.accel.read_tap(self.accel_tap_callback)
            yield from asyncio.sleep(.001)

    @asyncio.coroutine
    def left_bumper_callback(self, data):
        if not self.lbump_wait:
            if self.client_ready:
                if not data[1]:
                    msg = json.dumps({"info": "l_bump", "data": 1})
                    self.rbump_wait = True
                    if self.socket:
                        self.socket.sendMessage(msg.encode('utf8'))
                    yield from asyncio.sleep(.5)
                    msg = json.dumps({"info": "l_bump", "data": 0})
                    self.socket.sendMessage(msg.encode('utf8'))
                    self.rbump_wait = False
        yield from asyncio.sleep(.001)

    @asyncio.coroutine
    def right_bumper_callback(self, data):
        if not self.rbump_wait:
            if self.client_ready:
                if not data[1]:
                    msg = json.dumps({"info": "r_bump", "data": 1})
                    self.rbump_wait = True
                    if self.socket:
                        self.socket.sendMessage(msg.encode('utf8'))
                    yield from asyncio.sleep(.5)
                    msg = json.dumps({"info": "r_bump", "data": 0})
                    self.socket.sendMessage(msg.encode('utf8'))
                    self.rbump_wait = False
        yield from asyncio.sleep(.001)

    @asyncio.coroutine
    def ir1_callback(self, data):
        msg = json.dumps({"info": "ir1", "data": data[1]})
        if self.socket:
            self.socket.sendMessage(msg.encode('utf8'))
        yield from asyncio.sleep(.001)

    @asyncio.coroutine
    def ir2_callback(self, data):
        msg = json.dumps({"info": "ir2", "data": data[1]})
        if self.socket:
            self.socket.sendMessage(msg.encode('utf8'))
        yield from asyncio.sleep(.001)

    @asyncio.coroutine
    def ir3_callback(self, data):
        msg = json.dumps({"info": "ir3", "data": data[1]})
        if self.socket:
            self.socket.sendMessage(msg.encode('utf8'))
        yield from asyncio.sleep(.001)

    @asyncio.coroutine
    def button_callback(self, data):
        if self.client_ready:
            # switch is active low
            if not data[1]:
                yield from self.board.play_tone(self.pins["BUZZER"], Constants.TONE_TONE, 1000, 250)
                yield from self.board.digital_write(self.pins["LED"], 1)
                yield from asyncio.sleep(.3)
                yield from self.board.digital_write(self.pins["LED"], 0)
        yield from asyncio.sleep(.001)

    @asyncio.coroutine
    def play_tone(self, frequency, duration):
        yield from self.board.play_tone(self.pins["BUZZER"], Constants.TONE_TONE, frequency, duration)

    @asyncio.coroutine
    def set_led(self, state):
        yield from self.board.digital_write(self.pins["LED"], state)

    @asyncio.coroutine
    def accel_axis_callback(self, data):

        datax = float("{0:.2f}".format(data[3]))
        datay = float("{0:.2f}".format(data[4]))
        dataz = float("{0:.2f}".format(data[5]))

        x = data[0]
        y = data[1]
        z = data[2]

        angle_xz = 180 * math.atan2(x, z) / math.pi
        angle_xy = 180 * math.atan2(x, y) / math.pi
        angle_yz = 180 * math.atan2(y, z) / math.pi

        msg = json.dumps({"info": "axis", "xg": datax, "yg": datay, "zg": dataz,
                          "raw_x": x, "raw_y": y, "raw_z": z,
                          "angle_x": angle_xz, "angle_y": angle_xy, "angle_z": angle_yz})
        if self.socket:
            self.socket.sendMessage(msg.encode('utf8'))
        asyncio.sleep(.001)

    @asyncio.coroutine
    def accel_pl_callback(self, data):

        if data == 0x40:
            port_land = 'Flat   '
        elif data == 0:
            port_land = 'Tilt Left'
        elif data == 1:
            port_land = 'Tilt Right'
        elif data == 2:
            port_land = 'Tilt Up'
        else:
            port_land = 'Tilt Down'

        msg = json.dumps({"info": "pl", "data": port_land})
        if self.socket:
            self.socket.sendMessage(msg.encode('utf8'))
        asyncio.sleep(.001)

    @asyncio.coroutine
    def accel_tap_callback(self, data):
        if data:
            msg = json.dumps({"info": "tap", "data": data})
            if self.socket:
                self.socket.sendMessage(msg.encode('utf8'))
                yield from asyncio.sleep(1)
            msg = json.dumps({"info": "tap", "data": 0})
            if self.socket:
                self.socket.sendMessage(msg.encode('utf8'))
        asyncio.sleep(.001)

    @asyncio.coroutine
    def left_encoder_callback(self, data):
        msg = json.dumps({"info": "encoders", "left": data[0], "right": data[1]})
        if self.socket:
            self.socket.sendMessage(msg.encode('utf8'))
        asyncio.sleep(.1)

    def establish_socket(self, socket):
        self.socket = socket


if __name__ == "__main__":

    loop = asyncio.get_event_loop()
    my_core = PymataCore()

    rbc = RedBotController(my_core)
    loop.run_until_complete(rbc.init_red_board())
    asyncio.async(rbc.motor_control(0, 1, 60))
    asyncio.async(rbc.motor_control(1, 1, 60))

    while True:
        loop.run_until_complete(rbc.get_accel_data())
        loop.run_until_complete(asyncio.sleep(.1))

    loop.run_forever()

