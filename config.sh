#!/bin/bash
# Initialise la configuration par défaut de MyECLv2

ask(){
    echo -n "$1 [$2] : "
    read $3
    if [[ -z ${!3} ]]
    then
        eval $3="$2"
    fi
}

# Renseignelent des paramètres essentiels
ask "URL d'écoute ?" "localhost" LURL
ask "URL du service ?" "www.myecl.fr" URL
ask "Protocole ?" "https" HTTP
ask "Port d'écoute ?" "8080" LPORT
ask "Port du service ?" "80" PORT
ask "Chemin vers la racine ?" "$(pwd)" ROOT_PATH
ask "Hôte de base de données" "localhost" DB_HOST

cd $ROOT_PATH
# Mise à jour des modules node.js
npm i

# Initialisation de la BDD
echo "Créer la base de donnée et l'utilisateur MariaDB ? [o/N] "
read CREATEDB
if [[ "x$CREATEDB" == "xo" ]]
then
    mysql -u root -p -e "GRANT USAGE ON *.* TO 'eclair'@'localhost' IDENTIFIED BY 'secret'; GRANT ALL PRIVILEGES ON myecl.* TO 'eclair'@'localhost';" 
fi    

# Génération de la configuration
cat <<EOF | sed "s?@URL?$URL?g" | sed "s?@LURL?$LURL?" | sed "s?@ROOT_PATH?$ROOT_PATH?g" | sed "s?@PORT?$PORT?g" | sed "s?@LPORT?$LPORT?" | sed "s?@DB_HOST?$DB_HOST?g" | sed "s?@HTTP?$HTTP?g" > $ROOT_PATH/myecl_config.json
{
    "port" : @LPORT,
    "url" : "@LURL",
    "root_path" : "@ROOT_PATH",

    "default_route" : "/home",

    "session_config" : {
        "secret" : "dats a fuckin good secret",
        "resave" : false,
        "saveUninitialized" : true
    },

    "database" : {
      "host"     : "@DB_HOST",
      "user"     : "eclair",
      "password" : "secret",
      "database" : "myecl"
    },

    "tables" : [
        {
            "table" : "user",
            "schema" : {
                "id" : "INT PRIMARY KEY NOT NULL",
                "login" : "VARCHAR(255)",
                "password" : "VARCHAR(255)",
                "name" : "VARCHAR(255)",
                "firstname" : "VARCHAR(255)",
                "nick" : "VARCHAR(255)",
                "birth" : "DATE",
                "gender" : "VARCHAR(1)",
                "promo" : "INT",
                "floor" : "VARCHAR(3)",
                "groups" : "TEXT"
            }
        }
    ],

    "cas_config" : {
        "cas_url" : "@HTTP://cas.ec-lyon.fr/cas",
        "service_url" : "http://@URL:@PORT",
        "cas_version" : "2.0",
        "session_name" : "login_dsi",
        "session_info" : "user_data"
    },

    "body_json_config" : {
        "inflate" : "false"
    },

    "default_static_options" : {
        "index" : false,
        "redirect" : false
    },

    "module_callbacks_file" : "callbacks.js",
    "module_config_file" : "config.json"
}
EOF

