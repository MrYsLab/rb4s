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

    ext.getPushButton= function() {

    };

    ext.lineFollower= function() {

    };

    ext.bump = function() {

    };

    ext.axis = function() {

    };

    ext.encoder = function() {

    };

    ext.coast = function() {
        ;
    }

    ext.brake = function() {

    };


    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            // Block type, block name, function name
            [' ', ' %m.motor wheel move %m.operation speed = %m.speeds ', 'motorControl', 'Left', 'Forward', '1'],
            [' ', 'Coast %m.motor motor', "coast", "Left"],
            [' ', 'Brake %m.motor motor', "brake", "Left"],
            [' ', 'LED %m.ledState', 'ledCcontrol' ,'On'],
            [' ', 'Play Tone  %n Hz  %n ms', 'playTone', '1000', '500'],
            ['r', 'Push Button', 'getPushButton'],
            ['r', 'Line Follower %m.lineFollower', 'lineFollower', '1'],
            ['r', 'Encoder Tick Count', 'encoder'],
            ['r', '%m.bumper Bumper', 'bump','Left'],
            ['r', 'Accelerometer %m.axis axis:' , 'accel', 'X']
        ],
        menus: {
            motor: ['Left', 'Right'],
            operation: ['Forward', 'Reverse'],
            ledState: ['On', 'Off'],
            lineFollower: ['1', '2', '3'],
            bumper: ['Left', 'Right', 'Accelerometer'],
            axis: ['X', 'Y', 'Z'],
            speeds: ['1','2','3','4','5','6','7','8','9','10']
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