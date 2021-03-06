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
        LURL="172.18.24.170"
        URL="156.18.24.171"
        HTTP="http"
        LPORT=80
        PORT=80
        ROOT_PATH=/srv/web/myecl
        DB_HOST="172.18.24.169"
        DB_CLIENT="172.18.24.170"
        CREATEDB="no"
        ;;

    dev_docker)
        LURL="172.18.24.173"
        URL="156.18.24.171"
        HTTP="http"
        LPORT=80
        PORT=8080
        ROOT_PATH=/srv/web/myecl
        DB_HOST="172.18.24.172"
        DB_CLIENT="172.18.24.173"
        CREATEDB="no"
        ;;

    ether)
        LURL="ether.eclair.ec-lyon.fr"
        URL="ether.eclair.ec-lyon.fr"
        HTTP="http"
        LPORT=80
        PORT=80
        ROOT_PATH=/srv/MyECL
        DB_HOST="localhost"
        DB_CLIENT="localhost"
        ;;

    dev)
        LURL="localhost"
        URL="localhost"
        HTTP="http"
        LPORT=8080
        PORT=8080
        ROOT_PATH=$(pwd)
        DB_HOST="localhost"
        DB_CLIENT="localhost"
        ;;
    *)
        ask "URL d'écoute ?" "localhost" LURL
        ask "URL du service ?" "localhost" URL
        ask "Protocole ?" "http" HTTP
        ask "Port d'écoute ?" "8080" LPORT
        ask "Port du service ?" "8080" PORT
        ask "Chemin vers la racine ?" "$(pwd)" ROOT_PATH
        ask "Hôte de base de données" "localhost" DB_HOST
        ask "IP du client de bdd" "localhost" DB_CLIENT
        ;;
esac

if [ -z "$CREATEDB"  ]
then
    # Initialisation de la BDD
    echo "Créer la base de donnée et l'utilisateur MariaDB ? [o/N] "
    read CREATEDB
    if [[ "x$CREATEDB" == "xo" ]]
    then
        echo "Utiliser le mot de passe root de mysql/mariadb"
        mysql -h $DB_HOST -u root -p -e "CREATE DATABASE myecl; GRANT USAGE ON *.* TO 'eclair'@'$DB_CLIENT' IDENTIFIED BY 'secret'; GRANT ALL PRIVILEGES ON myecl.* TO 'eclair'@'$DB_CLIENT';" 
    fi
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
                "email" : "TEXT",
                "picture_path" : "TEXT",
                "picture_url" : "TEXT"
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
        "cas_version" : "3.0",
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

