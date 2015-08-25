#!/usr/bin/env python3

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
import webbrowser

from autobahn.asyncio.websocket import WebSocketServerProtocol, \
    WebSocketServerFactory

from pymata_aio.pymata_core import PymataCore
from redbot_controller import RedBotController


# noinspection PyPep8Naming
class RB4S(WebSocketServerProtocol):
    rb_control = None
    my_core = None

    def onConnect(self, request):
        print("Client connecting: {0}".format(request.peer))

    def onOpen(self):
        print("WebSocket connection open.")
        # send out instance to the redbot controller
        self.rb_control.establish_socket(self)

    def onMessage(self, payload, isBinary):

        cmd_dict = json.loads(payload.decode('utf8'))
        # print(cmd_dict)

        client_cmd = cmd_dict.get("command")

        # motor control command for forward and reverse
        if client_cmd == "motors":
            # control left motor
            operation = cmd_dict.get("operation")
            if operation == 'Forward':
                operation = self.rb_control.FORWARD
            elif operation == 'Reverse':
                operation = self.rb_control.REVERSE
            else:
                # should never get here, but the default is for safety sake
                operation = self.rb_control.COAST

            speed = int(cmd_dict.get("speed"))
            # allows user to specify a value between 1 and 10
            speed = 40 + (20 * speed)

            motor = cmd_dict.get('motor')
            if motor == 'Left':
                motor = self.rb_control.LEFT_MOTOR
            else:
                motor = self.rb_control.RIGHT_MOTOR

            yield from self.rb_control.motor_control(motor, operation, speed)

        # motor coast command
        elif client_cmd == "coast":
            motor = cmd_dict.get('motor')
            if motor == 'Left':
                motor = self.rb_control.LEFT_MOTOR
            else:
                motor = self.rb_control.RIGHT_MOTOR
            yield from self.rb_control.motor_control(motor, self.rb_control.COAST, 0)

        # motor brake command
        elif client_cmd == "brake":
            motor = cmd_dict.get('motor')
            if motor == 'Left':
                motor = self.rb_control.LEFT_MOTOR
            else:
                motor = self.rb_control.RIGHT_MOTOR
            yield from self.rb_control.motor_control(motor, self.rb_control.BRAKE, 0)

        # tone generator
        elif client_cmd == "tone":
            frequency = int(cmd_dict.get('frequency'))
            duration = int(cmd_dict.get('duration'))
            yield from self.rb_control.play_tone(frequency, duration)

        # led control
        elif client_cmd == "led":
            if cmd_dict.get('state') == 'On':
                yield from self.rb_control.set_led(1)
            else:
                yield from self.rb_control.set_led(0)

        elif client_cmd == 'shutdown':
            yield from self.rb_control.motor_control(self.rb_control.LEFT_MOTOR, self.rb_control.COAST, 0)
            yield from self.rb_control.motor_control(self.rb_control.RIGHT_MOTOR, self.rb_control.COAST, 0)
            yield from self.my_core.shutdown()

        elif client_cmd == 'ready':
            print('connected to Scratch_X page')

        else:
            print("unknown command from scratch: " + client_cmd)

    def onClose(self, wasClean, code, reason):
        print("WebSocket connection closed: {0}".format(reason))
        yield from self.rb_control.motor_control(self.rb_control.LEFT_MOTOR, self.rb_control.COAST, 0)

        yield from self.rb_control.motor_control(self.rb_control.RIGHT_MOTOR, self.rb_control.COAST, 0)
        yield from self.my_core.shutdown()


if __name__ == '__main__':

    new = 2

    url = "http://scratchx.org/?url=http://MrYsLab.github.io/rb4s/rb4s.js"
    webbrowser.open(url, new=new)

    factory = WebSocketServerFactory("ws://127.0.0.1:9000", debug=False)
    factory.protocol = RB4S

    loop = asyncio.get_event_loop()
    coro = loop.create_server(factory, '0.0.0.0', 9000)
    server = loop.run_until_complete(coro)

    loop = asyncio.get_event_loop()
    my_core = PymataCore()

    rbc = RedBotController(my_core)

    factory.protocol.rb_control = rbc
    factory.protocol.my_core = my_core
    loop.run_until_complete(rbc.init_red_board())

    try:
        while True:
            loop.run_until_complete(rbc.get_accel_data())
            loop.run_until_complete(asyncio.sleep(.1))
        loop.run_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.close()
        loop.close()
