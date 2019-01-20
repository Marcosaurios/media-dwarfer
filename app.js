
// basename -> PATH to start searching videos
var basename = "D:/Videos/";
//var basename = "G:/Fotos y videos mios (YI)/";

// outputDir -> PATH to save compressed videos keeping folders' tree
var outputDir = "D:/Comprimido/"; 

// ----------------------------------------------
// Problems with:
var problempath = "G:/Fotos y videos mios (YI)/2018/2018-03-1 Kite SP/Mi película.mp4"

/* Reading settings */
// @ todo
/*
Presets:

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

var savedFps = [];
var savedRes = [];

// ------------------
// Waiting to check
// HandBrakeCLI --preset-import-file /path/to/preset.plist -Z "my preset"
// ------------------

var preset_import_file = './sameWidthSameFps.json'
var preset = 'sameWidthSameFps'

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
    async function (err, files) {
        
        var total = 0;

        // ------------------        
        // Try loading preset but not working
        await hbjs.spawn({ 
            "preset-import-file": "D:/media-dwarfer/sameWidthSameFps.json",
            preset: 'sameWidthSameFps'
        })
        .on('start', start => {
            console.log('-- HANDBRAKE CLI STARTED --');       
            console.log(start);
        })
        .on('error', err => {
            console.log('error');               
            console.log(err);
        })
        .on('complete', output => {
            console.log('complete')
            console.log(` -- HANDBRAKE CLI CLOSED -- `)
        })
        
        for (const element of files) {
            /* For each file found: */
            console.log(element)
    
            /* 1- Get paths */
            await getPaths(element);
    
            /* 2- Create folders */
            createDir();
        
            /* 3- Get video quality and set preset for each file*/
            console.log( (await getQuality()) );
            
            /* 4- Compressing by its quality */
            await compress();
            
            total++;
        }
        
        console.log(`Found ${total} videos to compress.`);
        console.log(`FPS found in videos: ${savedFps}`);
        
    })

function getPaths(element){
    filepath = basename + element;
    //console.log('ORIGIN filepath: ' + filepath);
    
    /* Set output path in each file */
    if(outputDir) outputEnd = outputDir + element;
    var tmp = outputEnd.split('/');
    filename = tmp.pop();
    outputFolder = tmp.join('/');
    console.log(`outputFolder: ${outputFolder}`);

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

async function getQuality(){
    var fps;
    var res;
    await ffprobe( filepath , { path: ffprobeStatic.path })
    .then(function (info) {
        //console.log(info.streams[0]);
        var videodata = info.streams[0].r_frame_rate;

        saveData(videodata);
        
        switch( videodata ){
            case '120000/1001':
                fps = 120;
                //save()
                break;
            case '60000/1000':
            case '60/1':
                fps = 60;
                break;
            case '60000/1001':
                fps = 59.94;
                break;
            case '30/1':
                fps = 30;
                break;
            case '30000/1001':
                fps = 29.97;
                break;
            case '24000/1001':
                fps = 23.97;
                break;
            default:
                console.log(info);
                console.log(filepath);
                break;
        }
        //console.log(info.streams[0].r_frame_rate);
    })
    .catch(function(error){
        console.log(error);
    })
    
    return fps;
}

async function compress(){
    
    await hbjs.spawn({

        // ------------------ 
        // Waiting to check       
        //"preset-import-file": "D:/media-dwarfer/sameWidthSameFps.json",
        //preset: 'sameWidthSameFps',
        input: filepath,
        output: outputEnd
    })
    .on('start', start => {
        console.log('HANDBRAKE STARTED');
        console.log(start);
    })
    .on('error', err => {
        console.log('error');               
        console.log(err);
    })
    .on('begin', beg => {
        console.log('begin');               
        console.log(beg);
    })
    .on('progress', progress => {
        // process.stdout.write('Percent complete: %s, ETA %s',
        // progress.percentComplete,
        // progress.eta);

        console.log(
            'Percent complete: %s, ETA %s',
            progress.percentComplete,
            progress.eta
        )
    })
    .on('complete', output => {
        console.log('complete')
        console.log(`Video compressed`)
    })
}

function saveData(fps){
    var flag = false;
    var count = 0;
    for(var i=0;i<savedFps.length;i++){
        if(savedFps[i] != fps) count++;
    }
    if(count == savedFps.length) savedFps.push(fps);
}

// Future ideas
// function save(res){
//     var flag = false;
//     var count = 0;
//     for(var i=0;i<savedRes.length;i++){
//         if(savedRes[i] != res) count++;
//     }
//     if(count == savedRes.length) savedRes.push(res);
// }

// function setPreset(fps){
//     // switch(fps){
//     //     case 
//     // }
// }




