/**
 * Created by afy on 8/17/15.
 */
(function (ext) {

    console.log('rb4sx.js v.001');
    // 0 = no debug
    // 1 = low level debug
    // 2 = high - open the floodgates
    // Variable is set by user through a Scratch command block
    var debugLevel = 2;

    var device = null;
    var socket = null;
    var isopen = false;

    var t, z;

    var d = new Date();
    var start_time = d.getTime();
    // console.log('start_time = ' + start_time);
    var time_sample;
    var diff_time;

    window.onload = function () {
        window.socket = new WebSocket("ws://127.0.0.1:9000");


        socket.onopen = function () {

            var msg = JSON.stringify({
                "command": "ready"
            });

            window.socket.send(msg);

            console.log("Connected!");
            isopen = true;


        };

        socket.onmessage = function (message) {

            var msg = JSON.parse(message.data);
            // console.log(message.data);
            switch (msg['info']) {
                case 'axis':
                    var xx = msg['x'];
                    var yy = msg['y'];
                    var zz = msg['z'];

                    Window.vprogressx.value = xx;
                    Window.vprogressy.value = yy;
                    Window.vprogressz.value = zz;

                    Window.vprogressx.draw();
                    Window.vprogressy.draw();
                    Window.vprogressz.draw();
                    break;
                case 'encoders':
                    var left = msg['left'];
                    var right = msg['right'];
                    // console.log('left = ' + left + 'right = ' + right);
                    Window.gauge4.value = right;
                    Window.gauge4.draw();
                    Window.gauge2.value = left;
                    Window.gauge2.draw();

                    break;
                case 'ir1':
                    val = msg['data'];
                    $('#ir1').val(val);
                    break;
                case 'ir2':
                    val = msg['data'];
                    $('#ir2').val(val);
                    break;
                case 'ir3':
                    var val = msg['data'];
                    $('#ir3').val(val);
                    break;
                case 'pl':
                    // val = msg['data'];
                    // $('#orientation').val(val);
                    break;
                case 'tap':
                    val = msg['data'];
                    if (val) {
                        var vstring = "Bumped";
                    }
                    else
                        vstring = "Accelerometer";

                    $('#abump').val(vstring);
                    break;
                case 'l_bump':
                    val = msg['data'];
                    if (val) {
                        vstring = "Bumped";
                    }
                    else
                        vstring = "Left Bumper";

                    $('#lbump').val(vstring);
                    break;
                case 'r_bump':
                    val = msg['data'];
                    if (val) {
                        vstring = "Bumped";
                    }
                    else
                        vstring = "Right Bumper";

                    $('#rbump').val(vstring);
                    break;
            }
        };


        //noinspection JSUnusedLocalSymbols
        socket.onclose = function (e) {
            console.log("Connection closed.");
            socket = null;
            isopen = false;
        }

    };


    // Cleanup function when the extension is unloaded
    ext._shutdown = function () {
    };

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function () {
        return {status: 2, msg: 'Ready'};
    };

    ext.motorControl = function (wheel, operation, speed) {
        console.log('motor_control: ' + wheel + ' ' + operation + ' ' + speed)

        var msg = JSON.stringify({
            "command": "motors", "left_command": wheel, "operation": operation, "speed": speed
        });

        window.socket.send(msg);
    };

    ext.ledControl = function () {

    };


    ext.lineFollower = function () {

    };


    ext.accel = function () {

    };

    ext.encoder = function () {

    };

    ext.coast = function () {

    };

    ext.brake = function () {

    };

    ext.hatPushButton = function () {

    };

    ext.tap = function () {

    };

    ext.override = function () {

    };

    ext.resetCount = function () {

    };

    ext.writePin = function () {

    };

    ext.readPin = function () {

    };


    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            // Block type, block name, function name
            [' ', 'Move %m.motor wheel %m.operation. Speed = %m.speeds ', 'motorControl', 'Left', 'Forward', '1'],
            [' ', 'Set coast for %m.motor motor', 'coast', 'Left'],
            [' ', 'Set brake for %m.motor motor', 'brake', 'Left'],
            [' ', 'LED 13 %m.ledState', 'ledCcontrol', 'On'],
            [' ', 'Play Tone  %n Hz  %n ms', 'playTone', '1000', '500'],
            [' ', 'Reset Encoder Count', 'resetCount'],
            ['h', 'When User Button Is Pushed', 'hatPushButton'],
            ['h', 'When %m.bumper bumper activates', 'bumpers', 'Left'],
            ['h', 'When tap sensor activates', 'tap'],
            ['h', 'When encoder count > %n,', 'encoder'],
            ['r', 'Line Sensor %m.lineFollower', 'lineFollower', '1'],
            ['r', 'Accelerometer %m.axis axis:', 'accel', 'X'],
            [' ', 'Pin Mode Override: Pin %m.pin Mode: %m.mode', 'override', '3', 'Output'],
            ['r', 'Read Pin %m.pin', 'readPin', '3'],
            ['r', 'Write Pin %m.pin: Value = %n', 'writePin', '3', '0']
        ],
        menus: {
            motor: ['Left', 'Right'],
            operation: ['Forward', 'Reverse'],
            ledState: ['On', 'Off'],
            lineFollower: ['1', '2', '3'],
            bumper: ['Left', 'Right'],
            axis: ['X', 'Y', 'Z'],
            speeds: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            pin: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '16'],
            mode: ['Output', 'PWM', 'Servo', 'SONAR']
        },
        url: 'http://MrYsLab.github.io/rb4s'
    };

    // Register the extension
    ScratchExtensions.register('RedBot For ScratchX', descriptor, ext);
})({});


/*
 var descriptor = {
 blocks: [
 ['w', 'turn motor on for %n secs',             'motorOnFor', 1],
 [' ', 'turn motor on',                         'allMotorsOn'],
 [' ', 'turn motor off',                        'allMotorsOff'],
 [' ', 'set motor power %n',                    'startMotorPower', 100],
 [' ', 'set motor direction %m.motorDirection', 'setMotorDirection', 'this way'],
 ['h', 'when distance %m.lessMore %n',          'whenDistance', '<', 20],
 ['h', 'when tilt %m.eNe %n',                   'whenTilt', '=', 1],
 ['r', 'distance',                              'getDistance'],
 ['r', 'tilt',                                  'getTilt']
 ],
 menus: {
 motorDirection: ['this way', 'that way', 'reverse'],
 lessMore: ['<', '>'],
 eNe: ['=','not =']
 },
 url: 'http://info.scratch.mit.edu/WeDo'
 };
 */