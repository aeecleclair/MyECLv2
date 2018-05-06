Le projet MyECLv2 vise à refondre le site des élèves de l'école Centrale Lyon [www.myecl.fr](www.myecl.fr) pour le moderniser et l'adapter aux contraintes propres à ÉCLAIR, en particulier le renouvellement annuel de l'équipe de dévellopeurs.

# Motivations

Le site est basé sur Express et Node.js. Le code coté serveur est donc en
JavaScript. Le concept fondamental de ce site est l'aspect modulaire qui a
pour objectif de permettre l'extension des fonctionnalités par des
générations d'ÉCLAIRmen sans que ceux-ci aient besoin de comprendre le code des
dévelopeurs précédents. La compréhension de l'interface proposée doit être
suffisante pour dévelloper un nouveau module.

# Documentation

La documentation a été déplacé dans la partie [wiki](https://github.com/aeecleclair/MyECLv2/wiki) du [dépot github](https://github.com/aeecleclair/MyECLv2) du projet.

# Politique lié aux contributions exterieures

Ce projet a été publié sous licence MIT (licence libre parmi les plus permissives) dans le but de s'ouvrir aux participations exterieures. N'hésitez pas à proposer vos modifications, remarques et critiques (contructives) à l'équipe de devellopement.

## Utilisation de github

Les commits sur github ne doivement pas être fait directement sur la branche master sauf pour modifier le README. Il est préférable de faire les commits sur une branche dédié ou a défaut sur main_dev. Les merge des branches avec master ne doivement se faire qu'après consultation des principaux dévellopeurs.

/!\ Le fichier **myecl_config.json** et le dossier **node_modules** ne doivent _jamais_ être ajouté a un commit car ils sont spécifiques à un utilisateur et sont créé à l'exécution de **config.json**.

## Pratiques de dévellopement

Quelques recommendations importantes sont présente [ici](/wiki/Recommendations-de-d%C3%A9vellopement).

# Avancement du projet

## Fonctionnalités de base

- [x] Mise en place d'une interface simple pour les modules
- [x] Mise en place d'un squelette du système de sécurité
- [x] Design de la page type
- [x] Implémentation du __menu__
- [x] Implémentation du __body__
- [x] Implémentation du __header__
- [x] Implémentation du chargement des tiles
- [ ] Implémentation d'un système de gestion des tiles pour l'utilisateur
    - [ ] Création de nouvelles tuiles
    - [x] Placement personalisé des tuiles
    - [x] Suppression d'une tuile
- [ ] Implémentation des notifications
- [x] Mise en place de la base de données
- [x] Adapter le menu au autorisations de l'utilisateur
- [x] Adapter le header au autorisations de l'utilisateur
- [ ] Mise en place du système complet de sécurité
    - [x] Mise en place d'un vrai formulaire d'inscription
    - [x] Création d'une page de connexion
    - [x] Création d'une page "Acces interdit"
    - [x] Conception d'un système de mot de passe sûre
    - [x] Implémentation du système de mot de passe
    - [x] Création d'un système d'autorisations flexible pour définir quel utilisateur a accès à chaque module
    - [x] Implémentation du système d'autorisation
    - [ ] Création d'un serveur oAuth2 pour d'autres services ECLAIR (mediapiston notament)
    - [ ] Sécuriser completement le site (empécher le brute force de mot de passe, les injections de script...)
- [x] Ajout d'un système de "service" à l'usage des auteurs des modules qui offre des fonctionnalitées interne supplémentaire
- [ ] Service d'accés aux utilisateurs, aux assos... (surcouche à shorter.sql)
- [x] Permettre aux modules d'ajouter des head aux pages body (script JS et styles CSS)
- [ ] Permettre l'utilisation de templates (si possible donner du choix sur le moteur)

## Modules

Ceux que l'on doit faire avant la mise en ligne :
- [x] Exemple pour montrer les fonctionnalitées de 
- [ ] Interface Admin
    - [ ] Gestion des groupes
    - [ ] Gestion des assos
- [ ] Emploi du temps
- [ ] PH
- [ ] JE
- [ ] SDeC
- [ ] annonces BDE
- [ ] Club ciné
- [ ] Beat Box


Les autres qu'il faudrait faire rapidement :

- [ ] Central'isation
- [ ] Réservation BDE
- [ ] ...

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



