var fs = require('fs'),
    multiparty = require('multiparty'),
    walk = require('walk'),
    Config = require('../config/config');
/*
 * Display upload form
 */
exports.display_form = {
    handler: function(requestuest, reply) {
        reply(
            '<form action="/uploadFile" method="post" enctype="multipart/form-data">' +
            '<input type="file" name="file">' +
            '<input type="submit" value="Upload">' +
            '</form>'
        );
    }
}

/*
 * upload file
 */

exports.uploadFile = {
    payload: {
        maxBytes: 209715200,
        output: 'stream',
        parse: false
    },
    handler: function(requset, reply) {
        var form = new multiparty.Form();
        form.parse(requset.payload, function(err, fields, files) {
            if (err) return reply(err);
            else upload(files, reply);
        })
    }
}
/*
 * upload file function
 */
var upload = function(files, reply) {
    fs.readFile(files.file[0].path, function(err, data) {
        checkFileExist();
        fs.writeFile(Config.MixInsideFolder + files.file[0].originalFilename, data, function(err) {
            if (err) return reply(err);
            else return reply('File uploaded to: ' + Config.MixInsideFolder + files.file[0].originalFilename);

        })
    })
}

/*
 * Check File existence and create if not exist
 */

var checkFileExist = function() {
    fs.exists(Config.publicFolder, function(exists) {
        if (exists === false) fs.mkdirSync(Config.publicFolder);

        fs.exists(Config.MixFolder, function(exists) {
            if (exists === false) fs.mkdirSync(Config.MixFolder);
        });
    });
}

/**
 * get file
 */
exports.getFile = {
    handler: function(request, reply) {
        var file = request.params.file,
            path = Config.publicFolder + Config.uploadFolder + "/" + file,
            ext = file.substr(file.lastIndexOf('.') + 1);
        fs.readFile(path, function(error, content) {
            if (error) return reply("file not found");
            switch (ext) {
                case "pdf":
                    reply(content).header('Content-Type', 'application/pdf').header("Content-Disposition", "attachment; filename=" + file);
                    break;
                case "ppt":
                    reply(content).header('Content-Type', 'application/vnd.ms-powerpoint').header("Content-Disposition", "attachment; filename=" + file);
                    break;
                case "pptx":
                    reply(content).header('Content-Type', 'application/vnd.openxmlformats-officedocument.preplyentationml.preplyentation').header("Content-Disposition", "attachment; filename=" + file);
                    break;
                case "xls":
                    reply(content).header('Content-Type', 'application/vnd.ms-excel').header("Content-Disposition", "attachment; filename=" + file);
                    break;
                case "xlsx":
                    reply(content).header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').header("Content-Disposition", "attachment; filename=" + file);
                    break;
                case "doc":
                    reply(content).header('Content-Type', 'application/msword').header("Content-Disposition", "attachment; filename=" + file);
                    break;
                case "docx":
                    reply(content).header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document').header("Content-Disposition", "attachment; filename=" + file);
                    break;
                case "csv":
                    reply(content).header('Content-Type', 'application/octet-stream').header("Content-Disposition", "attachment; filename=" + file);
                    break;
                default:
                    reply.file(path);
            }

        });
    }
}

/**
 *get fileList
 */
exports.fileList = {
    handler: function(request, reply) {
        var files = [];
        // Walker options
        var walker = walk.walk(Config.publicFolder + Config.uploadFolder, {
            followLinks: false
        });

        walker.on('file', function(root, stat, next) {
            // Add this file to the list of files
            files.push(stat.name);
            next();
        });

        walker.on('end', function() {
            return reply(files);
        });
    }
}