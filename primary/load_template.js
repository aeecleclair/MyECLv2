/*
 * Charge les moteurs de templates avec une interface commune
 * Les moteurs seront déclaré dans des fichiers séparé
 * Pour ajouter un moteur il suffira de créer un fichier interface qui le
 * déclare en créant un ensemble de fonctions que l'on retrouvera a chaque fois
 */

// Exemple de syntaxes
// var pug = require('pug');

// compile
//var fn = pug.compile('string of pug', options);
//var html = fn(locals);
//
//// render
//var html = pug.render('string of pug', merge(options, locals));
//
//// renderFile
//var html = pug.renderFile('filename.pug', merge(options, locals));<Paste>

// Fonctions utilisées :
// render : template string, values -> html string
// renderFile : template file, values -> html string
// compile : template string -> (values -> html string)
// compileFile : template file -> (values -> html string)
