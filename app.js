//////////////////////////////////////////////
//////////// CONFIG VARIABLES ////////////////
//////////////////////////////////////////////

var inputDir = "D:/Videos/";                // inputDir -> PATH to start searching videos
//var inputDir = "G:/Fotos y videos mios (YI)/";

var outputDir = "D:/Comprimido/";           // outputDir -> PATH to save compressed videos keeping folders' tree

// ------------
// DEPENDENCIES
// ------------
// fs-extra                                 // File reader and writer
var fse = require('fs-extra');

// Glob                                     // Reading video metadata tool
var Glob = require("glob").Glob;

// ffprobe and static ffprobe               // Compression stuff
var ffprobe = require('ffprobe');
var ffprobeStatic = require('ffprobe-static');

// HandBrake-js                             // Compression tool
const hbjs = require('handbrake-js');

var videos = [];
  
// -- Progress variables
var percent         = 0,
    eta             = 0,
    total           = 0,
    flag            = true,
    finished        = false,
    compressed      = 0;


// -- Custom presets variables // not working yet
var savedFps = [],
    savedRes = [];

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

// ----------------------------------------------
// Problems with:
var problempath = "G:/Fotos y videos mios (YI)/2018/2018-03-1 Kite SP/Mi película.mp4"
// ------------------
// Waiting to check github issues
// HandBrakeCLI --preset-import-file /path/to/preset.plist -Z "my preset"
// ------------------

var preset_import_file = './sameWidthSameFps.json'
var preset = 'sameWidthSameFps'

console.log()
console.log(`=================================`);
console.log(` outputDir set to: ${outputDir}`);
console.log(`=================================\n`);
console.log()

/* Listing files */

console.log(`Searching for .mp4 and .MP4 files on ${inputDir} ... \n`)
var found = new Glob(
    "**/*.{mp4,MP4}",
    {
        cwd: inputDir,
        matchBase:true
    },
    async function (err, files) {
        
        // ------------------        
        // Try loading preset but not working
        await hbjs.spawn({ 
            "preset-import-file": "D:/media-dwarfer/sameWidthSameFps.json",
            preset: 'sameWidthSameFps'
        })
        .on('start', start => {
            //console.log('-- HANDBRAKE CLI STARTED --'); 
        })
        .on('error', err => {
            //console.log('error');               
            //console.log(err);
        })
        .on('complete', output => {
            //console.log('complete')
            //console.log(` -- HANDBRAKE CLI CLOSED -- `)
        })
        
        for (const element of files) {
            /* For each file found: */
            videos[total] = new Object();

            /* 1- Get paths */
            var routes = await getPaths(element);
            videos[total].element      = routes.filepath;
            videos[total].output       = routes.output;
            videos[total].outputFolder = routes.outputFolder

            /* 2- Create folders */
            createDir( videos[total].outputFolder );
        
            /* 3- Get video quality and set preset for each file*/
            //console.log( (await getQuality()) );
            
            /* 4- Compressing by its quality */
            //await compress();
            
            console.log(`
             Video ${ total }: ${ videos[total].element }
             Output path: ${ videos[total].output }
            `);
            
            total++;

        }
        
        console.log(`Found ${total} videos to compress.`);
        //console.log(`FPS found in videos: ${savedFps}`);
        console.log();
        console.log();

        await compress();
        
    })

function getPaths(element){
    // -- Folders' tree variables
    var filepath        = "", // Absolute file path
        filefolder      = "",
        filename        = "",
        outputFolder    = "", // Folder to save video
        outputEnd       = ""; // Folder/filename to save the video

    filepath = inputDir + element;
    //console.log('inputDir filepath: ' + filepath);
    
    /* Set output path in each file */
    if(outputDir) outputEnd = outputDir + element;
    var tmp = outputEnd.split('/');
    filename = tmp.pop();
    outputFolder = tmp.join('/');
    //console.log(`outputFolder: ${outputFolder}`);
    
    return {outputFolder, output: outputEnd, filepath};

}
function createDir(outputFolder){
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


async function compress(){
    
    await hbjs.spawn({

        // ------------------ 
        // Waiting to check       
        //"preset-import-file": "D:/media-dwarfer/sameWidthSameFps.json",
        //preset: 'sameWidthSameFps',
        input: videos[0].element,
        output: videos[0].output
    })
    .on('start', start => {
        //console.log('== HANDBRAKE STARTED == ');
        //process.stdout.write(`Compressing ${ compressed } / ${ total } videos...`);

    })
    .on('error', err => {
        console.log('error');               
        console.log(err);
    })
    .on('begin', beg => {
        console.log()
        
        //console.log('begin');   
        //finished = false;
    })
    .on('progress', progress => {
        percent = progress.percentComplete;
        eta = progress.eta;
        
        if(flag) writeData();
        
    })
    .on('end', beg => {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write("\n"); // end the line
        process.stdout.write(`Compressing video ${ compressed+1 }/${ total } ...  100%`);
        process.stdout.write("\n"); // end the line
        console.log(`Video ${compressed+1} compressed OK.`);
        
    })
    .on('complete', output => {
        compressed++;
        if(compressed==total){
            // Queue finished
            console.log('----------------')
            console.log(`All videos compressed successfully`)
            console.log('----------------')
        }
        else{
            videos.shift()
            compress();
        }
    })
}

async function writeData(){
    flag = false;
    process.stdout.write(`Compressing video ${ compressed+1 }/${ total } ... ${ percent }%`);
        
    await setTimeout(() => {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        flag = true;
    }, 1000);
    
}



// Future ideas
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
                //console.log(info);
                //console.log(filepath);
                //console.log(videodata);
                break;
        }
        //console.log(info.streams[0].r_frame_rate);
    })
    .catch(function(error){
        console.log(error);
    })
    return fps;
}

function saveData(fps){
    var flag = false;
    var count = 0;
    for(var i=0;i<savedFps.length;i++){
        if(savedFps[i] != fps) count++;
    }
    if(count == savedFps.length) savedFps.push(fps);
}
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




