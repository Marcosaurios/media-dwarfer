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
        //"preset-import-file": "__dirname/sameWidthSameFps.json",
        //preset: 'sameWidthSameFps',
        input: videos[0].element,
        output: videos[0].output
    })
    .on('start', start => {
        //console.log('== HANDBRAKE STARTED == ');
    })
    .on('error', err => {
        console.log('error');               
        console.log(err);
    })
    .on('begin', beg => {
        //console.log()
    })
    .on('progress', progress => {
        percent = progress.percentComplete;
        eta = progress.eta;
        
        if(flag) writeData();
        
    })
    .on('end', beg => {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write("\n");
        process.stdout.write(`Compressing video ${ compressed+1 }/${ total } ...  100%`);
        process.stdout.write("\n");
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
            // Remove first video element (already compressed)
            videos.shift()
            // Keep compressing
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
