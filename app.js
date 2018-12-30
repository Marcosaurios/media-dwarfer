
// basename -> PATH to start searching videos
//var basename = "D:/Videos/";
var basename = "G:/Fotos y videos mios (YI)/";

// outputDir -> PATH to save compressed videos keeping folders' tree
var outputDir = "D:/Comprimido/"; 


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

// Glob
var Glob = require("glob").Glob;

// ffprobe and static ffprobe
var ffprobe = require('ffprobe');
var ffprobeStatic = require('ffprobe-static');

// HandBrake-js
const hbjs = require('handbrake-js');


var filepath = "";
var filefolder = "";
var filename = "";
var outputFolder = ""
var outputEnd = "";

console.log(`=================================`);
console.log(` outputDir set to: ${outputDir}`);
console.log(`=================================\n`);

/* Listing files */

console.log(`Searching for .mp4 and .MP4 files on ${basename} ... \n`)
var found = new Glob(
    "**/*.{mp4,MP4}",
    {
        cwd: basename,
        matchBase:true
    },
    function (err, files) {
        
        var total = 0;
         
        files.forEach(element => {
            /* For each file found: */

            /* 1- Get paths */
            getPaths(element);

            /* 2- Create folders */
            createDir();
        
            /* 3- Get video quality and set preset for each file*/
            getQuality();
            
            /* 4- Compressing by its quality */
            compress();
            
            total++;
        })
        
        console.log(`Found ${total} videos to compress.`);
        
    })

function getPaths(element){
    filepath = basename + element;
    //console.log('ORIGIN filepath: ' + filepath);
    
    /* Set output path in each file */
    if(outputDir) outputEnd = outputDir + element;
    var tmp = outputEnd.split('/');
    filename = tmp.pop();
    outputFolder = tmp.join('/');
    //console.log(`outputFolder: ${outputFolder}`);

}
function createDir(){
    if(outputDir){
        fse.ensureDir(outputFolder)
        .then(() => {
          //console.log('success!')
        })
        .catch(err => {
          console.error(err)
        })
    }
}

function getQuality(){
    ffprobe( filepath , { path: ffprobeStatic.path }, function (err, info) {
        if (err) console.log(err);
        //console.log(info.streams[0].r_frame_rate);
    })
}
    
function compress(){
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
}




