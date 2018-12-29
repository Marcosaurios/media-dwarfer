

const Glob = require("glob").Glob;
const ffmpeg = require('fluent-ffmpeg');

var file_list;
/* Reading settings */


/* Listing files */

console.log("Finding .mp4 and .MP4 files on D:/Videos...")
var found = new Glob(
    "**/*.{mp4,MP4}",
    {
        cwd: "D:/Videos",
        matchBase:true
    },
    function (err, files) {
        console.log("... found: ")
        files.forEach(element => {
            console.log(element);
        });
        
        file_list = files;
        //console.log(files)
        
        console.log("-------")
        console.log(file_list)
        console.log("-------")
        
        ffmpeg.ffprobe(file_list, (error, meta) => {
            console.log(meta)
        })
})


// ffmpeg.ffprobe(file_list, (error, metadata) => {
//   const duration = metadata.format.duration;
//   console.log(duration);
// });

/* Compressing by its quality */

