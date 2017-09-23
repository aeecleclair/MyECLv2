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

Le dossier _static_ contient les fichiers statiques (ressources envoyées tel quel au client) séparé dans deux dossiers :
- _public_ contient les fichiers accessible même sans être passer par la conexion par mot de passe (authentification)
- _private_ contient les fichiers uniquement accessible aux utilisateurs authentifié

Le dossier _modules_ contient un dossier pour chaque module activé ainsi que les
fichiers utiles à la gestion des modules.

Le dossier *node_modules* contient les modules installés avec npm

# 2 Architecture d'un module

## A Les fichiers essentiels

Un module est entierement contenu dans le dossier qui porte sont nom dans le répertoire _modules_
Un module n'a qu'un ou deux fichiers absolument indispensable. S'il ne contient que des fichiers statiques il ne nécessite que le fichier _config.json_. S'il contient en plus des routes dynamiques (la réponse est créer par du code JS) alors il aura en plus un fichier _callbacks.js_. Le reste du contenu du dossier est gérer comme bon lui semble par l'auteur du module.

## B Structure de _config.json_

Le fichier _config.json_ est la base de la définition d'un module. Il rassemble toute les informations nécessaires pour mettre en place le module.

### La propritété __authorisation__
Cette propriété définie la règle de sécurité par défaut concernant ce module. Si elle vaut "public" alors les ressources du module sont accessible sans se connecter. Si elle est omise les ressources du module seront par défaut accéssible à tout utilisateur connécté.

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

### La propriété __menu__

Cette propriété permet à chaque module d'ajouter des éléments qui lui sont spécifique dans le menu de gauche. C'est une liste d'items qui peuvent être de trois types :
- __body__ : permet d'afficher un body définit dans __rules__, la valeure est le nom du body
- __link__ : un lien classique vers une URL quelquonque (qui peut être interne au site ou non), la valeure est l'URL cible
- __sub__ : un sous menu, la valeures est une nouvelle liste contenant des items. On peut imbriquer autant de menu que l'on veut (en théorie, mais le résultat esthétique n'est pas garanti)

Chaque item à en plus une propriété __name__ obligatoire qui contient le texte à afficher.  et peut avoir une propriété __icon__ qui contient du code HTML à ajouter juste avant le nom du lien.

### La propriété __header__

L'idée est la même que pour le menu mais cela concerne le header de la page.
Contrairement au menu le type __sub__ est interdit. De plus c'est la propriété __icon__ qui est obligatoire tandis que la propriété __name__ est facultative.

### Les autres propriétées

Pour l'instant aucune autre proproété de la configuration n'est utilisé par le chargeur de module mais ça viendra.

## B Un exemple de configuration
```json
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
    ],
    "header" : [
        {
            "icon" : "<span class=\"fa fa-question-circle\"></span>",
            "body" : "victoire"
        }
    ]
}
```

# 3 Ressources mise à disposition des modules

## Base de données

MyECL utilise une base de données MySQL. Cette base de données permet à chaque module de stocker des informations ou de récupérer des données pré-existantes dans des tables appartenant au module même ou à d’autres modules. Un module peut creer ses propres tables. Pour cela il est nescessaire de déclarer les tables du module dans le fichier config.json du module que l’on souhaite développer (voir exemple de config.json). Chaque table crée par le module doit etre déclarée dans la propriété « database » du fichier config.json qui est une Array. On remarquera que deux propriétés sont nécessaires : 

- __table__: Definit le nom de la table tel qu’il apparait dans la bdd
- __schema__: Désigne la structure de la table. Il est nescessaire de spécifier les types propres à MySQL

Au chargement de MyECL la base de donnée est connectée et referencée dans l'objet "app.database". On remarquera que l'objet "app" est accessible dans n'importe quel callback recevant une requete à travers l'objet "req.app".

L'objet database possede differentes methodes permettent d'interagir avec la base de donées:

- __.query()__:
- __.select()__:
- __.save()__:

Les tables essentielles au fonctionnement de MyECL sont chargées par init.js et sont définies dans le fichier /primary/tables.json 

# 4 Avancement du projet

## Fonctionnalités de base

- [x] Mise en place d'une interface simple pour les modules
- [x] Mise en place d'un squelette du système de sécurité
- [x] Design de la page type
- [x] Implémentation du __menu__
- [x] Implémentation du __body__
- [x] Implémentation du __header__
- [x] Mise en place de la base de données
- [ ] Isolation des tables des différents modules
- [ ] Considerer les risque de donner acces à toutes les collections à tous les modules
- [ ] Mise en place du système complet de sécurité
    - [ ] Création d'une page de connexion
    - [ ] Création d'une page "Acces interdit"
    - [x] Conception d'un système de mot de passe sûre
    - [x] Implémentation du système de mot de passe
    - [ ] Création d'un système d'autorisations flexible pour définir quel utilisateur a accès à chaque module
    - [ ] Implémentation du système d'autorisation
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



