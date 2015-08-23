/**
 * Created by afy on 8/17/15.
 */
(function (ext) {

    console.log('rb4sx.js alpha_011');
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

    ext.cnct = function () {
        //window.onload = function () {
            console.log('loaded');
            window.socket = new WebSocket("ws://127.0.0.1:9000");


            window.socket.onopen = function () {

                var msg = JSON.stringify({
                    "command": "ready"
                });

                window.socket.send(msg);

                console.log("Connected!");
                isopen = true;


            };

            window.socket.onmessage = function (message) {

                var msg = JSON.parse(message.data);
                // console.log(message.data);
                switch (msg['info']) {
                    case 'axis':
                        var val = msg['data'];

                        break;
                    case 'encoders':
                        var left = msg['left'];
                        var right = msg['right'];
                        // console.log('left = ' + left + 'right = ' + right);


                        break;
                    case 'ir1':

                        break;
                    case 'ir2':

                        break;
                    case 'ir3':

                        break;
                    case 'pl':
                        // val = msg['data'];
                        // $('#orientation').val(val);
                        break;
                    case 'tap':

                        break;
                    case 'l_bump':
                        val = msg['data'];

                        break;
                    case 'r_bump':

                        break;
                }
            };


            //noinspection JSUnusedLocalSymbols
            window.socket.onclose = function (e) {
                console.log("Connection closed.");
                socket = null;
                isopen = false;
            };

        //};
    };

    // Cleanup function when the extension is unloaded
    ext._shutdown = function () {
        var msg = JSON.stringify({
            "command": "shutdown"
        });

        window.socket.send(msg);
    };

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function (status, msg) {
        return {status: 2, msg: 'Ready'};
    };

    ext.motorControl = function (wheel, operation, speed) {
        console.log('motor_control: ' + wheel + ' ' + operation + ' ' + speed);

        var msg = JSON.stringify({
            "command": "motors", "motor": wheel, "operation": operation, "speed": speed
        });

        window.socket.send(msg);
    };

    ext.ledControl = function () {
        ucon();

    };


    ext.lineFollower = function () {
        ucon();

    };


    ext.accel = function () {
        ucon();

    };

    ext.encoder = function () {
        ucon();

    };

    ext.coast = function (motor) {
        var msg = JSON.stringify({
            "command": 'coast', 'motor': motor
        });
        window.socket.send(msg);
    };

    ext.brake = function (motor) {
        var msg = JSON.stringify({
            "command": 'brake', 'motor': motor
        });
        window.socket.send(msg);
    };


    ext.hatPushButton = function () {
        ucon();

    };

    ext.tap = function () {
        ucon();

    };

    ext.override = function () {
        ucon();

    };

    ext.resetCount = function () {
        ucon();

    };

    ext.writePin = function () {
        ucon();

    };

    ext.readPin = function () {
        ucon();

    };

    function ucon() {
        alert("Under Construction");
    }


    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            // Block type, block name, function name
            [' ', 'Connect', 'cnct'],
            [' ', 'Move %m.motor wheel %m.operation Speed = %m.speeds ', 'motorControl', 'Left', 'Forward', '1'],
            [' ', 'Set coast for %m.motor motor', 'coast', 'Left'],
            [' ', 'Set brake for %m.motor motor', 'brake', 'Left'],
            [' ', 'LED 13 %m.ledState', 'ledControl', 'On'],
            [' ', 'Play Tone  %n Hz  %n ms', 'playTone', '1000', '500'],
            [' ', 'Reset Encoder Count', 'resetCount'],
            ['h', 'When User Button Is Pushed', 'hatPushButton'],
            ['h', 'When %m.bumper bumper activates', 'bumpers', 'Left'],
            ['h', 'When tap sensor activates', 'tap'],
            ['h', 'When encoder count > %n', 'encoder'],
            ['r', 'Encoder Count', 'encCount'],
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