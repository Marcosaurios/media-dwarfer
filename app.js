

var Glob = require("glob").Glob;

var ffprobe = require('ffprobe');
var ffprobeStatic = require('ffprobe-static');

const hbjs = require('handbrake-js');

//var basename = "D:/";
var basename = "D:/Videos/";
//var basename = "G:/Fotos y videos mios (YI)/";
// var file_list = [];
var outputDir = "D:/Videos/"; //Comprimido/";


/* Reading settings */
// @ todo
/*
Presets:

------
SIZE
------
1920 * 1080

======

------
FPS
------
120000/1001

60/1 = 60 fps
60000/1000 = 60 fps
60000/1001 = 59.94fps

30/1 = 30 fps
30000/1001 = 29.97 fps 

24000/1001
*/

/* Listing files */

console.log(`Finding .mp4 and .MP4 files on ${basename} ...`)
var found = new Glob(
    "**/*.{mp4,MP4}",
    {
        cwd: basename,
        matchBase:true
    },
    function (err, files) {
        var filename = "";
        //var outputFile = "";
        var outputEnd = "";
        var total = 0;

        console.log("... found: ");
        
        files.forEach(element => {
            /* For each file found: */
            /* Get abs path */
            filename = basename + element;
            console.log('filename: ' + filename);

            /* Set output path in each file */
            outputEnd = outputDir + element + 'x';
            console.log('outputEnd: ' + outputEnd);
            
            /* Get video quality and set preset for each file*/
            ffprobe( filename , { path: ffprobeStatic.path }, function (err, info) {
                if (err) console.log(err);
                //console.log(info.streams[0].r_frame_rate);
            })

            /* Compressing by its quality */
            hbjs.spawn({ input: filename, output: outputEnd})
                .on('error', err => {
                    console.log(err);
                })
                .on('progress', progress => {
                    console.log(
                        'Percent complete: %s, ETA %s',
                        progress.percentComplete,
                        progress.eta
                    )
                })

            total++;
        })

        console.log(`Total: ${total} elements.`);

})



