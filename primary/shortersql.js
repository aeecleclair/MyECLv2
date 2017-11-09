/*
 * Module pour simplifier l'usage de la bdd
 */

const mysql = require('mysql');

/*
 * En générale les callback ont la forme function(error, results, fields)
 * Avec error un objet erreur ou null
 * result une liste d'objets
 * fields une liste de clées pour les objets result
 */

module.exports = function(context){
    
    const pool = mysql.createPool(context.database_config);
    var db = new Object();
    db.pool = pool; // Juste au cas où
    db.query = function(){
        return pool.query.apply(pool, arguments);
    };
     
    db.create = function(name, schema, override){ // créer une table
        var fields = new Array();
        for(var key in schema){
            fields.push(key + ' ' + schema[key]);
        }
       
        var query;
        if(override){
            query = 'CREATE OR REPLACE TABLE ' + name + '(' + fields.join(', ') + ');';
        } else {
            query = 'CREATE TABLE IF NOT EXISTS ' + name + '(' + fields.join(', ') + ');';
        }
        //context.log.info('Executing SQL request : ' + query);
        pool.query(query, function(err){
            if(err){
                context.log.error('Unable to properly create a table');
                throw err;
            }
        });
    };

    db.drop = function(table){ // supprime une table
        pool.query('DROP TABLE ' + table + ';', function(err){
            if(err){
                throw 'Unable to drop ' + table + ' table.';
            }
        });
    };

    db.select = function (){ // execute une requete select
        if(typeof arguments[0] !==  'string' && ! (arguments[0] instanceof String)){ // pas une string
            throw 'First argument should be the table name';
        }
        var query, values, callback;
        switch(arguments.length){
            case 2: // table, callback
                query = 'SELECT * FROM ' + arguments[0] + ';';
                callback = arguments[1];
                values = [];
                break;

            case 3: // table, fields, callback
                // table, condition, callback
                if(Array.isArray(arguments[1])){ // fields
                    query = 'SELECT ' + arguments[1].join(', ') + ' FROM ' + arguments[0] + ';';
                } else if(typeof arguments[1] ===  'string' || arguments[1] instanceof String){ // condition
                    query = 'SELECT * FROM ' + arguments[0] + ' WHERE ' + arguments[1] + ' ;';
                } else {
                    throw 'Second argument can be string (condition) or Array (field list).';
                }
                callback = arguments[2];
                values = [];
                break;

            case 4: // table, fields, condition, callback
                // table, condition, values, callback
                if(Array.isArray(arguments[1])){ // fields, condition
                    if(typeof arguments[2] !==  'string' && !(arguments[2] instanceof String)){ // pas une string
                        throw 'Third argument should be a string representing the condition of selection.';
                    }
                    query = 'SELECT ' + arguments[1].join(', ') + ' FROM ' + arguments[0] + ' WHERE ' + arguments[2] + ';';
                    values = [];
                    callback = arguments[3];
                } else if(typeof arguments[1] ===  'string' || arguments[1] instanceof String){ // condition, values
                    if(!Array.isArray(arguments[2])){
                        throw 'Third argument should be an Array representing a list of values';
                    }
                    query = 'SELECT * FROM ' + arguments[0] + ' WHERE ' + arguments[1] + ';';
                    values = arguments[2];
                    callback = arguments[3];
                } else {
                    throw 'Second argument can be string (condition) or Array (field list).';
                }
                break;

            case 5: // table, fields, condition, values, callback
                if(!Array.isArray(arguments[1])){ // pas une liste
                    throw 'Second argument should be an Array representing a list of values';
                }
                if(typeof arguments[2] !==  'string' && !(arguments[2] instanceof String)){ // pas une string
                    throw 'Third argument should be a string representing the condition of selection.';
                }
                if(!Array.isArray(arguments[3])){ // pas une liste
                    throw 'Fourth argument should be an Array representing a list of values';
                }
                query = 'SELECT ' + arguments[1].join(', ') + ' FROM ' + arguments[0] + ' WHERE ' + arguments[2] + ';';
                values = arguments[3];
                callback = arguments[4];
                break;

            default:
                throw 'select function can only have betwen two and five arguments.';
        }
        pool.query(query, values, callback);
    };

    db.save = function(table, object, callback){ // Enregistre un 'objet' dans une table (l'objet doit correspondre a la table)
        var fields = new Array();
        var values = new Array();
        var qtags_insert = new Array();  // On utilise le systeme de remplacement de mysql
        var qtags_update = new Array();  // car il evite les injections de SQL et certaines erreures

        for(var key in object){
            qtags_insert.push('?');
            qtags_update.push(key + ' = ?');
            fields.push(key);
            values.push(object[key] ? object[key] : 0);  // renvoie 0 à la place de false ou undefined
        }
        
        var query = 'INSERT INTO ' + table +
            ' (' + fields.join(', ') +
            ') VALUES (' + 
            qtags_insert.join(', ')+ ')' +
            'ON DUPLICATE KEY UPDATE ' +  // fait une erreur sur MySQL car spécifique à MariaDB
            qtags_update.join(', ') + ';';

        pool.query({
            'sql' : query,
            'values' : values.concat(values)
        }, callback);
    };

    return db;
};
