const ejs = require('ejs');
const fs = require('fs');

exports.name = 'ejs';

exports.render = function(template, values){
    return ejs.render(template, values);
};


exports.renderFile = function(template_file, values, cb){
    ejs.renderFile(template_file, values, function(err, template){
        if(err){
            cb(err);
        } else {
            cb(null, template);
        }
    });
};

exports.compile = function(template){
    return ejs.compile(template);
};

exports.compileFile = function(template_file, cb){
    fs.readFile(template_file, function(err, template){
        if(err){
            cb(err);
        } else {
            cb(null, template);
        }
    });
};

