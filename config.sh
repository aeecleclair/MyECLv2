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

# Renseignement des paramètres essentiels
case "$1" in
    prod)
        LURL="localhost"
        URL="www.myecl.fr"
        HTTP="https"
        LPORT=8998
        PORT=443
        ROOT_PATH=$(pwd)
        DB_HOST="bases.eclair.ec-lyon.fr"
        ;;

    dev)
        LURL="localhost"
        URL="localhost"
        HTTP="http"
        LPORT=8080
        PORT=8080
        ROOT_PATH=$(pwd)
        DB_HOST="localhost"
        ;;
    *)
        ask "URL d'écoute ?" "localhost" LURL
        ask "URL du service ?" "localhost" URL
        ask "Protocole ?" "http" HTTP
        ask "Port d'écoute ?" "8080" LPORT
        ask "Port du service ?" "8080" PORT
        ask "Chemin vers la racine ?" "$(pwd)" ROOT_PATH
        ask "Hôte de base de données" "localhost" DB_HOST
        ;;
esac

# Initialisation de la BDD
echo "Créer la base de donnée et l'utilisateur MariaDB ? [o/N] "
read CREATEDB
if [[ "x$CREATEDB" == "xo" ]]
then
    mysql -u root -p -e "CREATE DATABASE myecl; GRANT USAGE ON *.* TO 'eclair'@'localhost' IDENTIFIED BY 'secret'; GRANT ALL PRIVILEGES ON myecl.* TO 'eclair'@'localhost';" 
fi    

# Mise à jour des modules node.js
npm install

# Génération de la configuration
cat <<EOF | sed "s?@URL?$URL?g" | sed "s?@LURL?$LURL?" | sed "s?@ROOT_PATH?$ROOT_PATH?g" | sed "s?@PORT?$PORT?g" | sed "s?@LPORT?$LPORT?" | sed "s?@DB_HOST?$DB_HOST?g" | sed "s?@HTTP?$HTTP?g" > $ROOT_PATH/myecl_config.json
{
    "port" : @LPORT,
    "url" : "@LURL",
    "root_path" : "@ROOT_PATH",

    "default_route" : "/modules/panorama/index.html",

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
                "id" : "INT PRIMARY KEY NOT NULL AUTO_INCREMENT",
                "login" : "VARCHAR(12)",
                "password" : "VARCHAR(60)",
                "name" : "VARCHAR(32)",
                "firstname" : "VARCHAR(64)",
                "nick" : "VARCHAR(20)",
                "birth" : "DATE",
                "gender" : "VARCHAR(1)",
                "promo" : "INT",
                "floor" : "VARCHAR(3)",
                "groups" : "TEXT"
            }
        },
        {
            "table" : "membership",
            "schema" : {
                "id" : "INT PRIMARY KEY NOT NULL AUTO_INCREMENT",
                "id_user" : "INT NOT NULL",
                "id_group" : "INT NOT NULL",
                "position" : "VARCHAR(50)",
                "term" : "VARCHAR(50)"
            }
        },
        {
            "table" : "user_group",
            "schema" : {
                "id" : "INT PRIMARY KEY NOT NULL AUTO_INCREMENT",
                "name" : "VARCHAR(127) UNIQUE",
                "description" : "TEXT"
            },
            "init" : "REPLACE INTO user_group (id, name, description) VALUES (0, \"ecl\", \"Centraliens de Lyon\");"
        }
    ],

    "alias" : {
        "#ecl" : "SELECT login FROM user JOIN membership ON user.id = membership.id_user WHERE membership.id_group = 0;"
    },

    "cas_config" : {
        "cas_url" : "https://cas.ec-lyon.fr/cas",
        "service_url" : "@HTTP://@URL:@PORT",
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

