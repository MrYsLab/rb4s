/**
 * Created by afy on 8/17/15.
 */
(function(ext) {
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    ext.motorControl = function() {
        // Code that gets executed when the block is run
    };

    ext.ledControl= function() {

    };


    ext.lineFollower= function() {

    };

    ext.bumpers = function() {

    };

    ext.axis = function() {

    };

    ext.encoder = function() {

    };

    ext.coast = function() {

    };

    ext.brake = function() {

    };

    ext.hatPushButton = function() {

    };

    ext.tap = function() {

    };



    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            // Block type, block name, function name
            [' ', 'Move %m.motor wheel %m.operation. Speed = %m.speeds ', 'motorControl', 'Left', 'Forward', '1'],
            [' ', 'Set coast for %m.motor motor', "coast", "Left"],
            [' ', 'Set brake for %m.motor motor', "brake", "Left"],
            [' ', 'LED 13 %m.ledState', 'ledCcontrol' ,'On'],
            [' ', 'Play Tone  %n Hz  %n ms', 'playTone', '1000', '500'],
            [' ', 'Clear Encoder Count'],
            ['h', "When User Button Is Pushed", 'hatPushButton'],
            ['h', 'When %m.bumper bumper activates', 'bumpers', 'Left'],
            ['h', 'When tap sensor activates', 'tap'],
            ['h', 'When encoder count > %n,', 'encoder'],
            ['r', 'Line Sensor %m.lineFollower', 'lineFollower', '1'],
            ['r', 'Accelerometer %m.axis axis:' , 'accel', 'X'],
            [' ', 'Pin Mode Override: Pin %m.pin Mode: %m.mode', 'override', '3', 'Output']
        ],
        menus: {
            motor: ['Left', 'Right'],
            operation: ['Forward', 'Reverse'],
            ledState: ['On', 'Off'],
            lineFollower: ['1', '2', '3'],
            bumper: ['Left', 'Right'],
            axis: ['X', 'Y', 'Z'],
            speeds: ['1','2','3','4','5','6','7','8','9','10'],
            pin: ['2','3','4','5','6','7', '8', '9', '10','11', '12', '16' ],
            mode: ['Output','PWM', 'Servo', 'SONAR']
        },
        url: 'http://MrYsLab.github.io/rb4s'
    };

    // Register the extension
    ScratchExtensions.register('RedBot For Scratch', descriptor, ext);
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