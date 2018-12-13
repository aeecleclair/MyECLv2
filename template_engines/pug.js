const pug = require('pug');

exports.name = 'pug';

exports.render = function(template, values){
    return pug.render(template, values);
};


exports.renderFile = function(template_file, values, cb){
    cb(null, pug.renderFile(template_file, values));
};

exports.compile = function(template){
    return pug.compile(template);
};

exports.compileFile = function(template_file, cb){
    cb(null, pug.compileFile(template_file));
};

