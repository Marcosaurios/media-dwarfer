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

// DEPENDENCIES

// fs-extra
var fse = require('fs-extra');

//      Glob
var Glob = require("glob").Glob;

//      ffprobe and static ffprobe
var ffprobe = require('ffprobe');
var ffprobeStatic = require('ffprobe-static');

//      HandBrake-js
const hbjs = require('handbrake-js');



var basename = "D:/Videos/";
//var basename = "G:/Fotos y videos mios (YI)/";
 var outputDir = "D:/Comprimido/"; 
// If outputDir is defined, it will compress videos on desired path
// If is not defined, it will delete old videos



/* Listing files */

console.log(`Finding .mp4 and .MP4 files on ${basename} ...`)
var found = new Glob(
    "**/*.{mp4,MP4}",
    {
        cwd: basename,
        matchBase:true
    },
    function (err, files) {
        var filepath = "";
        var filefolder = "";
        var filename = "";
        var outputFolder = ""
        var outputEnd = "";
        var total = 0;

        console.log("... found: ");
        
        if(outputDir){
            console.log('outputDir setted')
        }
        if(!outputDir){
            console.log('outputDir not setted')
        }
        files.forEach(element => {
            /* For each file found: */

            /* 1- Get paths */
            filepath = basename + element;
            console.log('filepath: ' + filepath);
            

            /* Set output path in each file */
            if(outputDir) outputEnd = outputDir + element;
            var tmp = outputEnd.split('/');
            filename = tmp.pop();
            outputFolder = tmp.join('/');
            console.log(`outputFolder: ${outputFolder}`);


            /* mkdir folders -if outputDir setted- */
            if(outputDir){
                fse.ensureDir(outputFolder)
                .then(() => {
                  console.log('success!')
                })
                .catch(err => {
                  console.error(err)
                })
            }
            
            console.log('outputEnd: ' + outputEnd);
            
            /* Get video quality and set preset for each file*/
            ffprobe( filepath , { path: ffprobeStatic.path }, function (err, info) {
                if (err) console.log(err);
                console.log(info.streams[0].r_frame_rate);
            })
            
            /* Compressing by its quality */
            hbjs.spawn({ input: filepath, output: outputEnd})
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
            console.log('----')
        })

        console.log(`Total: ${total} elements.`);

})

// function compress(){

// }

// function getQuality(){

// }



