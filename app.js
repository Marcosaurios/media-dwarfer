

var Glob = require("glob").Glob;

var ffprobe = require('ffprobe');
var ffprobeStatic = require('ffprobe-static');

var basename = "D:/Videos/";
var file_list = [];

/* Reading settings */

/*
60000/1000 = 60 fps
60000/1001 = 59.94fps
*/

/* Listing files */

console.log("Finding .mp4 and .MP4 files on D:/Videos...")
var found = new Glob(
    "**/*.{mp4,MP4}",
    {
        cwd: basename,
        matchBase:true
    },
    function (err, files) {
        console.log("... found: ")
        files.forEach(element => {
            console.log(element);
            file_list.push(basename+element)
        });
        
        
        console.log()        
        console.log(file_list)
        console.log()
    

        console.log()        
        console.log("file list [0]:" + files[0])
        console.log()
    
        console.log("ffprobe: ...")    
        ffprobe( file_list[0] , { path: ffprobeStatic.path }, function (err, info) {
            if (err) console.log(err);
            console.log(info.streams[0].r_frame_rate);
        })

        
})

/* Compressing by its quality */

