# Ce script sert a mettre en place en prod le container myecl une fois que e depot git a ete mis a jour.
# A lancer sur la machine gerant le container de myecl.
# Droits root via sudo necessaires.


# Variables globales
# Chemin du fichier docker-compose de myecl
PATH_MYECL="/etc/container/configuration_files/myecl/"
# Chemin dans le container du site myecl
SITE_MYECL="/srv/web/myecl"
# Nom du service dans le fichier docker-compose
SERVICE_MYECL="node_myecl"
CONTAINER_MYECL="myecl_node"



# On arrete le container en cours
echo "Stopping old container.... Please wait. "
docker stop $CONTAINER_MYECL
echo -e "Old container stopped. \n"



# Copie des nouveaux fichiers dans le colume du container.
echo "Copying new files..."
sudo rm -rf /var/lib/docker/volumes/myecl_site/_data/
sudo cp -r ./ /var/lib/docker/volumes/myecl_site/_data/
sudo rm -rf /var/lib/docker/volumes/myecl_site/_data/.git
sudo rm /var/lib/docker/volumes/myecl_site/_data/.gitignore
sudo rm /var/lib/docker/volumes/myecl_site/_data/.gitkeep
sudo rm /var/lib/docker/volumes/myecl_site/_data/setup_myecl.sh
echo -e "Files copied.\n"



# On relance le nouveau container.
echo "Launching new container... Please wait."
pushd $PATH_MYECL
docker-compose up -d $SERVICE_MYECL
sleep 1
popd
echo -e "Container launched.\n"



echo -e "Node launched.\n"
echo -e "-------------------------------- \n\n"
echo "Container ready."

