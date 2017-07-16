Ce document a pour objectif de permettre a une personne maitrisant les
concepts de bases de Node.js et Express d'appréhender l'architecture de MyECL
et de comprendre la march a suivre pour réaliser un module.

# Architecture globale du site

## Motivations

Le site est basé sur Express et Node.js. Le code coté serveur est donc en
JavaScript. Le concept fondamentale de ce site est l'aspect modulaire qui a
pour objectif de permettre l'extension des fonctionnalitées par des
générations d'ÉCLAIRmen sans que ceux-ci ai besoin de comprendre le code des
dévellopeurs précédents. La compréhension de l'interface proposé doit être
suffisante pour dévelloper un nouveau module.

## Organisation des fichiers

A la racine du site se trouvent :
- le fichier de configuration générale de l'application myecl_config.json
- le point d'entrée de l'application myecl.js
- le dossier _src_
- le dossier _client_
- le dossier _public_
- le dossier _module_
- le dossier *node_modules*

Le dossier _src_ contient les différents fichiers JS qui rassemblent le code de base du serveur :
- _init.js_ permet d'initialiser l'application Express, créer les routes minimales et exploite les autres fichiers
- _context.js_ lit la configuration, ajoute quelques propriétées et retourne un objet context qui va servir dans la plupart des autres fichiers comme source de parametres.
- _logger.js_ fournie des méthodes pour afficher des informations
- *module_loader.js* charge chaque module activé
- _authenticate.js_ met en place l'aspect authentification, l'interface de connexion et la communication avec le CAS
- _authorise.js_ met en place l'aspect autorisation : il vérifie que l'utilisateur n'accède qu'au ressources qui lui sont permisent

Le dossier _client_ contient les fichiers statiques qui sont réservé à un utilisateur authentifié (connecté) et qui ne dépendent pas d'un module.

Le dossier _public_ contient les fichiers statiques consultable même sans se connecter

Le dossier _modules_ contient un dossier pour chaque module activé ainsi que les
fichiers utiles à la gestion des modules.

Le dossier *node_modules* contient les modules installés avec npm

# Architecture d'un module

##  Les fichiers essentiels

Un module est entierement contenu dans le dossier qui porte sont nom dans le répertoire _modules_
Un module n'a qu'un ou deux fichiers absolument indispensable. S'il ne contient que des fichiers statiques il ne nécessite que le fichier _config.json_. S'il contient en plus des routes dynamiques (la réponse est créer par du code JS) alors il aura en plus un fichier _callbacks.js_. Le reste du contenu du dossier est gérer comme bon lui semble par l'auteur du module.

## Structure de _config.json_

Le fichier _config.json_ est la base de la définition d'un module. Il rassemble toute les informations nécessaires pour mettre en place le module.

### La propritété __authorisation__
Cette propriété définie la règle de sécurité par défaut concernant ce module. Si elle vaut "public" alors les ressources du module sont accessible sans se connecter. Si elle est omise les ressources du module seront par défaut accéssible à tout utilisateur connécté.

### La propriété __rules__

Cette propriété contient une liste de règles qui décrivent la façon d'accéder aux ressources du module. Une règle est elle même un objet associatif qui décrit le type de ressource et la façon d'y acceder. Il existe trois types de ressources :
- __static__ : un fichier ou un dossier contenant des fichiers statiques, la valeure est le chemin relatif au dossier du module
- __callback__ : un callback comme on en utilise avec Express. C'est une fonction javascript qui prend en argument un objet représentant la requète et un représentant la réponse. La valeure est le nom de la fonction tel qu'il est déclaré dans le fichier _callback.js_
- __middleware__ : identique à proche de __callback__ au détail près que la fonction doit prendre un troisième argument __next__ qui est une fonction à appeler sans argument une fois les traitements terminé.

Il y a trois méthodes pour accéder à ces ressources :
- __route__ associe de façon directe une route et une ressource. La valeur de la propriété est l'url complète par exemple "/modules/profile/static/*"
- __body__ permet d'intégrer une page à la page de base de MyECL (qui comprend le header et le menu à droite)
- __tile__ permet de définir le contenu d'une tuile associé à ce module

Chaque règle peut avoir des propriétées supplémentaires :
- __authorisation__ : définit une règle de sécurité spécifique à cette règle
- __method__ : définit la méthode HTTP utilisé pour la règle (GET si elle est omise)

### La propriété __menu__

Cette propriété permet à chaque module d'ajouter des éléments qui lui sont spécifique dans le menu de gauche. C'est une liste d'items qui peuvent être de trois types :
- __body__ : permet d'afficher un body définit dans __rules__, la valeure est le nom du body
- __link__ : un lien classique vers une URL quelquonque (qui peut être interne au site ou non), la valeure est l'URL cible
- __sub__ : un sous menu, la valeures est une nouvelle liste contenant des items. On peut imbriquer autant de menu que l'on veut (en théorie, mais le résultat esthétique n'est pas garanti)

Chaque item à en plus une propriété __name__ obligatoire qui contient le texte à afficher.  et peut avoir une propriété __icon__ qui contient du code HTML à ajouter juste avant le nom du lien.

### La propriété __header__

Pas encore implémenté.
L'idée est la même que pour le menu mais cela concerne le header de la page.

### Les autres propriétées

Pour l'instant aucune autre proproété de la configuration n'est utilisé par le chargeur de module mais ça viendra.

## Un exemple de configuration
'''json
{
    "authorisation" : "ecl",
    "description" : "Module de test",
    "rules" : [
        {
            "route" : "/modules/test/static/*",
            "static" : "static/"
        },
        {
            "body" : "main",
            "callback" : "main_cb"
        },
        {
            "body" : "victoire",
            "static" : "static/boo.html"
        },
        {
            "body" : "daf",
            "static" : "static/daf.html"
        }
    ],
    "menu" : [
        {
            "body" : "main",
            "name" : "Hello",
            "icon" : "<span class='fa fa-user'>"
        },
        {
            "body" : "victoire",
            "name" : "Boo Yah !"
        },
        {
            "name" : "D'autres trucs",
            "sub" : [
                {
                    "body" : "daf",
                    "name" : "Dah fuck ?"
                },
                {
                    "link" : "http://assoce.eclair.ec-lyon.fr/",
                    "name" : "Les assos"
                }
            ]
        },
        {
            "link" : "https://www.google.com",
            "name" : "Google"
        }
    ]
}
'''
