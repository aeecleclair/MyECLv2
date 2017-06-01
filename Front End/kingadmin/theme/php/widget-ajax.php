<?php

header("Content-type: application/json");
echo json_encode( array( 'msg' => 'Hi! This is a message from the server' ));
die();

?>