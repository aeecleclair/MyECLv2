Ce document a pour objectif de permettre à une personne maitrisant les concepts de bases de Node.js et Express d'appréhender l'architecture de MyECL et de comprendre la marche à suivre pour réaliser un module.

# 1 Architecture globale du site

## A Motivations

Le site est basé sur Express et Node.js. Le code coté serveur est donc en
JavaScript. Le concept fondamentale de ce site est l'aspect modulaire qui a
pour objectif de permettre l'extension des fonctionnalitées par des
générations d'ÉCLAIRmen sans que ceux-ci ai besoin de comprendre le code des
dévellopeurs précédents. La compréhension de l'interface proposé doit être
suffisante pour dévelloper un nouveau module.

## B Architecture d'une page classique du site

Une page classique de MyECL se décompose en trois grandes parties. En haut on à un __header__ qui donne accès à des liens essentiels. À gauche on a un __menu__ qui peut être plier et qui rassemble des liens vers les différentes pages disponibles. Enfin au centre on a le __body__ qui affiche les pages du site.

## C Organisation des fichiers

A la racine du site se trouvent :
- le fichier de configuration générale de l'application *myecl_config.json*
- le point d'entrée de l'application myecl.js
- le dossier _primary_
- le dossier _static_
- le dossier _module_
- le dossier *node_modules*

Le dossier _primary_ contient les différents fichiers JS qui rassemblent les fonctionnalitées primaires du serveur :
- _init.js_ permet d'initialiser l'application Express, créer les routes minimales et exploite les autres fichiers
- _context.js_ lit la configuration, ajoute quelques propriétées et retourne un objet context qui va servir dans la plupart des autres fichiers comme source de parametres.
- _logger.js_ fournie des méthodes pour afficher des informations
- *module_loader.js* charge chaque module activé
- _authenticate.js_ met en place l'aspect authentification, l'interface de connexion et la communication avec le CAS
- _authorise.js_ met en place l'aspect autorisation : il vérifie que l'utilisateur n'accède qu'au ressources qui lui sont permisent
- _shortersql.js_ propose une interface avec la base de données exposant des fonctions simple à utiliser pour faire les taches les plus courantes

Le dossier _static_ contient les fichiers statiques (ressources envoyées tel quel au client) séparé dans deux dossiers :
- _public_ contient les fichiers accessible même sans être passer par la conexion par mot de passe (authentification)
- _private_ contient les fichiers uniquement accessible aux utilisateurs authentifié

Le dossier _modules_ contient un dossier pour chaque module activé ainsi que les
fichiers utiles à la gestion des modules.

Le dossier *node_modules* contient les modules installés avec npm

# 2 Installation

Pour installer le site il faut :
- Installer node.js
- Installer un serveur mariadb et y ajouter un utilisateur eclair et une base de données myecl
- Lancer le script _config.sh_ pour générer la configuration. Ce script peut prendre comme argument optionel "dev" et "prod" qui donne des valeures par défaut adaptées aux différents paramètres du script. En l'abcence d'argument le script demande à l'utilisateur de renseigner les paramètres à la main. Les valeures entre crochets sont les valeures prisent si le champ reste vide.


# 3 Architecture d'un module

## A Les fichiers essentiels

Un module est entierement contenu dans le dossier qui porte sont nom dans le répertoire _modules_
Un module n'a qu'un ou deux fichiers absolument indispensable. S'il ne contient que des fichiers statiques il ne nécessite que le fichier _config.json_. S'il contient en plus des routes dynamiques (la réponse est créer par du code JS) alors il aura en plus un fichier _callbacks.js_. Le reste du contenu du dossier est gérer comme bon lui semble par l'auteur du module.

## B Structure de _config.json_

Le fichier _config.json_ est la base de la définition d'un module. Il rassemble toute les informations nécessaires pour mettre en place le module.

### La propritété __authorisation__
Cette propriété définie la règle de sécurité par défaut concernant ce module. Elle peut prendre quatres formes différentes :
- "public" : les ressources du module sont accessible sans se connecter.
- un # suivi d'un nom : c'est un alias, les alias sont définis dans le fichier de configuration principale sous la forme "#alias" : "requete SQL". Par exemple l'alias "#ecl" rend les ressources du module accessible par défaut à tout utilisateur identifié comme un (ancien) élève.
- une requète SQL SELECT qui doit renvoyer une liste de login autorisé à accéder aux ressources (ex : SELECT login FROM user WHERE promo = 2016;)
- une __fin__ de requète SQL qui sera à en interne collé après le début de requète SELECT login FROM user JOIN membership ON membership.id\_user = user.id (ex : WHERE membership.position = 'prez' AND membership.group = 'ECLAIR';)
Si la propriété est omise le comportement par défaut est celui de l'alias #ecl.


### La propriété __rules__

Cette propriété contient une liste de règles qui décrivent la façon d'accéder aux ressources du module. Une règle est elle même un objet associatif qui décrit le type de ressource et la façon d'y acceder. Il existe trois types de ressources :
- __static__ : un fichier ou un dossier contenant des fichiers statiques, la valeure est le chemin relatif au dossier du module
- __callback__ : un callback comme on en utilise avec Express. C'est une fonction javascript qui prend en argument un objet représentant la requète et un représentant la réponse. La valeure est le nom de la fonction tel qu'il est déclaré dans le fichier _callback.js_
- __middleware__ : identique à proche de __callback__ au détail près que la fonction doit prendre un troisième argument __next__ qui est une fonction à appeler sans argument une fois les traitements terminé.

Il y a trois méthodes pour accéder à ces ressources :
- __route__ associe de façon directe une route et une ressource. La valeur de la propriété est l'url complète par exemple "/modules/profile/static/\*"
- __body__ permet d'intégrer une page à la page de base de MyECL (qui comprend le header et le menu à droite)
- __tile__ permet de définir le contenu d'une tuile associé à ce module

Chaque règle peut avoir des propriétées supplémentaires :
- __authorisation__ : définit une règle de sécurité spécifique à cette règle
- __method__ : définit la méthode HTTP utilisé pour la règle (GET si elle est omise)
- __heads__ : Cette propriété sert à déclarer les feuilles de styles css et les scripts JavaScript spécifique à un body (elle est ignoré dans le cas d'une route ou d'une tile). Elle contient un objet ayant une ou deux des proprétées suivantes :
    - __styles__ : une liste de routes vers les fichiers css à ajouter au body
    - __scripts__ : une liste de routes vers les fichiers JS à ajouter au body

### La propriété __heads__

Cette propriété fonctionne comme son homonyme dans les rules mais s'applique à tout les bodys du module. Son contenu est fusioné avec le contenu de la propriété spécifique au body s'il existe.

### La propriété __menu__

Cette propriété permet à chaque module d'ajouter des éléments qui lui sont spécifique dans le menu de gauche. C'est une liste d'items qui peuvent être de trois types :
- __body__ : permet d'afficher un body définit dans __rules__, la valeure est le nom du body
- __link__ : un lien classique vers une URL quelquonque (qui peut être interne au site ou non), la valeure est l'URL cible
- __sub__ : un sous menu, la valeures est une nouvelle liste contenant des items. On peut imbriquer autant de menu que l'on veut (en théorie, mais le résultat esthétique n'est pas garanti)

Chaque item à en plus une propriété __name__ obligatoire qui contient le texte à afficher.  et peut avoir une propriété __icon__ qui contient du code HTML à ajouter juste avant le nom du lien.

### La propriété __header__

L'idée est la même que pour le menu mais cela concerne le header de la page.
Contrairement au menu le type __sub__ est interdit. De plus c'est la propriété __icon__ qui est obligatoire tandis que la propriété __name__ est facultative.

### La propriété __database__

Cette propriété permet de créer des tables dans le base de donnée à l'usage du module. Elle se présente sous la forme d'une liste d'objets comportant les propriétées __table__ et __schema__. __table__ donne le nom de la table, __schema__ donne sa structure sous la forme d'un objet associant les noms des colonnes de la table aux caractéristiques de la colonne (au moins le type de données).

### Les autres propriétées

Pour l'instant aucune autre propriété de la configuration n'est utilisé par le chargeur de module mais ça viendra.

## B Un exemple de configuration
```json
{
    "authorisation" : "ecl",
    "description" : "Module de test",
    "database" : [
        {
            "table" : "film", 
            "schema" : {
                "titre" : "VARCHAR(255)",
                "realisateur" : "VARCHAR(255)",
                "genre" : "VARCHAR(255)",
                "date_sortie" : "DATE",
                "pays" : "VARCHAR(255)"
            }
        }
    ],
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
    ],
    "header" : [
        {
            "icon" : "<span class=\"fa fa-question-circle\"></span>",
            "body" : "victoire"
        }
    ]
}
```

# 4 Ressources mise à disposition des modules

Plusieurs objets sont mis à la disposition des modules au chargement du système. Ces objets sont rassemblé dans l'objet __app__ accessible dans les callbacks et middlewares en sous le nom __req.app__.
 
## Logs

Pour fournir des informations à l'administrateur sur le bon fonctionnement du module on utilise l'objet __app.log__. Il contient trois fonctions :
- __info(msg)__ : pour des messages d'information.
- __warning(msg)__ : pour avertir d'un problème potentiel ou d'un situation anormale.
- __error(msg, fatal)__ : pour avertir d'une erreur importante. __fatal__ est optionel et vaut __false__ par défaut. S'il vaut __true__ l'appel de __error__ met fin au processus (tue le site). Si __msg__ est un objet erreur, sa description est affichée.

## Base de données

MyECL utilise une base de données MariaDB. Cette base de données permet à chaque module de stocker des informations ou de récupérer des données pré-existantes dans des tables appartenant au module même ou à d’autres modules. Un module peut creer ses propres tables dans sa configuration. Chaque table crée par le module doit etre déclarée dans la propriété __database__ du fichier config.json. 

Au chargement de MyECL la base de donnée est connectée et referencée dans l'objet __app.database__.

L'objet database possede differentes methodes permettent d'interagir avec la base de donées:

### create et drop
- __.create(name, schema, override)__ : Créer une table de nom __name__ et de structure __schema__. __schema__ est un objet semblable aux définitions de tables dans la configuration. __override__ est un booléen optionel (par défaut à __false__). S'il est vrai la table sera créer même si elle existait déjà. Dans ce cas la table précédente sera écrasé. S'il est faux et si la table existe déjà la création sera annulée.

__.drop(table)__ : Supprime la table de nom __table__

### select
__.select()__ : Cette méthode peut être appelé de six façon différentes en prenant de deux à cinq arguments. Le premier est toujours le nom de la table sur laquelle on fait le SELECT. Le dernier est toujours le callback qui exploite le résultat. Le callback a pour prototype __callback(error, result, fields)__ avec __error__ un objet erreur ou __undefined__, __result__ une liste d'objets { "nom de colonne" : valeur } et __fields__ la liste des noms de colonnes.

- deux arguments : la requete est SELECT * FROM nomDeLaTable;
- trois arguments : Le deuxième argument peut être :
    - __fields__ : une liste de noms de colonnes, la requete sera SELECT col1, col2,... FROM nomDeLaTable;
    - __condition__ : une condition sur les lignes sous forme de string (ex : __condition__ = "login = 'tcavigna'"). La requete sera SELECT * FROM nomDeLaTable WHERE condition;
- quatres arguments, deux cas possible :
    - le deuxième est __fields__ et le troisème __condition__
    - le deuxième est __condition__ et le troisième __values__ qui est une liste. Dans ce cas __condition__ doit contenir des ? (ex : __condition__ = "login = ?") et chaque ? sera remplacé par un élément de __values__. Il faut absolument se servir de ce système quand on veux inclure des données reçu d'un utilisateur pour empécher les injections SQL (cf google)

- cinq arguments : le deuxième est __fields__, le troisième __condition__ et le quatrième __values__

### save
__.save(table, object, callback)__ sert a enregistrer des infos dans la table __table__ (elle utilise INSERT et UPDATE). __object__ est un objet de type {"nom de colonne" : valeur }. Si l'objet ne correspond à rien dans la table, un nouvel enregistrement est créer. Si il y a un conflit de clé l'enregistrement existant est mis à jour. L'objet peut ne pas contenir certaines colonnes, auquel cas les valeurs seront misent par défaut, en revanche l'objet ne peut pas avoir de colonnes qui n'existent pas dans la table. Dans le cas contraire la requete va échouer.

### query
__.query()__ est un binding vers la fonction pool.query du module mysql. Elle répond donc exactement à la documentation disponible sur internet. Comme __.select__ elle peux être appelé de multiple façon. Cette fonction permet de faire n'importe quel requete SQL et servira pour des requetes plus complexes que ce qui peut être fait avec les autres méthodes.

Les tables essentielles au fonctionnement de MyECL sont chargées par init.js et sont définies dans le fichier de configuration principal.

# 5 Avancement du projet

## Fonctionnalités de base

- [x] Mise en place d'une interface simple pour les modules
- [x] Mise en place d'un squelette du système de sécurité
- [x] Design de la page type
- [x] Implémentation du __menu__
- [ ] Adapter le menu à l'utilisateur
- [x] Implémentation du __body__
- [x] Implémentation du __header__
- [ ] Adapter le header à l'utilisateur
- [x] Mise en place de la base de données
- [ ] Isolation des tables des différents modules
- [ ] Considerer les risque de donner acces à toutes les collections à tous les modules
- [ ] Mise en place du système complet de sécurité
    - [x] Création d'une page de connexion
    - [ ] Création d'une page "Acces interdit"
    - [x] Conception d'un système de mot de passe sûre
    - [x] Implémentation du système de mot de passe
    - [x] Création d'un système d'autorisations flexible pour définir quel utilisateur a accès à chaque module
    - [x] Implémentation du système d'autorisation
- [ ] Ajout d'un système de "service" à l'usage des modules qui offre des fonctionnalitées interne supplémentaire
    - [ ] Service d'accés au utilisateurs, aux assos... (surcouche à shorter.sql)
- [ ] Permettre aux modules d'ajouter des head aux pages body ()
- [ ] Implémentation du chargement des tiles
- [ ] Implémentation d'un système de gestion des tiles pour l'utilisateur
- [ ] Implémentation des notifications

## Modules

Ceux que l'on doit faire avant la mise en ligne :
- [x] Exemple pour montrer les fonctionnalitées de base
- [ ] Emploi du temps
- [ ] PH
- [ ] JE
- [ ] SDeC
- [ ] annonces BDE
- [ ] Club ciné
- [ ] Beat Box
- [ ] Interface Admin

Les autres qu'il faudrait faire rapidement :

- [ ] Central'isation
- [ ] Réservation BDE
- ...

## Autres projets pour bien plus tard

- [ ] Module BDS pour gérer leur materiel
- [ ] Module dBs, pareil
- [ ] Intégration de MediaPiston
- [ ] Module de chat
- [ ] Module fil d'actualité
- [ ] Module de jeux (pour remetre Dodge Malou chez nous et en faire des nouveaux)
- [ ] Module de sondage
- [ ] Module pour se mettre en fil d'attente pour que ECLAIR dévellope un module
- [ ] Module CMB



