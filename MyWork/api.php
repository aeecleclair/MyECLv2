<?php

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {	
	die(require DIR.'api/example_'.(isset($_GET['php']) ? 'php' : 'js').'.php');
}

define('NO_SIGNATURE', false);
define('NO_SECURED_ACTION', false);
define('NO_TIMED_ACTION', false);
define('DEBUG_API', true);
define('VALIDITY_TOKEN', 300); //seconds
define('VALIDITY_TIMED_ACTION', 30); //seconds


$modules = [
	'general' 	=> 'General actions', 
	'sport' 	=> 'All actions associated to sports', 
	'ecole' 	=> 'All actions associated to ecoles', 
	'tournoi' 	=> 'All actions associated to tournois'];



header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
ob_start();

function validateSignature($post, $private_token) {
	$signature = !empty($post['signature']) ? $post['signature'] : '';
	unset($post['signature']);
	unset($post['_debug']);

	ksort($post);
	$sig = sha1(http_build_query($post).'&'.$private_token);

	return $sig == $signature;
}

function calculateSignatureDebug($post, $private_token) {
	unset($post['signature']);
	unset($post['_debug']);

	ksort($post);
	$sig = sha1(http_build_query($post).'&'.$private_token);
	return $sig;
}

function returnJson($error, $data) {
	$json = ['error' => $error];
	$json = array_merge($json, $data);
	$json['hash'] = sha1(serialize($json));
	die(json_encode($json));
}


$pdo->exec('DELETE FROM tokens '.
	'WHERE expire < NOW()');


if (empty($_POST['public_token']))
	returnJson(1, ['message' => 'Public token is not specified']);

$user = $pdo->query('SELECT '.
		'* '.
	'FROM utilisateurs '.
	'WHERE '.
		'public_token = "'.secure($_POST['public_token']).'" AND '.
		'_etat = "active"')
	->fetch(PDO::FETCH_ASSOC);


if (empty($user) ||
	empty($user['private_token']))
	returnJson(2, ['message' => 'Public token is invalid']);

if (defined('DEBUG_API') &&
	DEBUG_API &&
	!empty($_POST['_debug']) &&
	$_POST['_debug'] == 'signature')
	returnJson(0, ['signature' => calculateSignatureDebug($_POST, $user['private_token'])]);

if ((empty($_POST['signature']) ||
		!validateSignature($_POST, $user['private_token'])) && (
		!defined('DEBUG_API') ||
		!DEBUG_API ||
		!defined('NO_SIGNATURE') || 
		!NO_SIGNATURE))
	die(json_encode(['error' => 3, 'message' => 'Signature is invalid or not specified']));

if (empty($_POST['module']) || 
	!in_array($_POST['module'], array_keys($modules)))
	returnJson(4, ['message' => 'Module is invalid or not specified', 'modules' => $modules]);

if (!file_exists(DIR.'api/'.$_POST['module'].'/'.$_POST['module'].'.php'))
	returnJson(5, ['message' => 'Intern error : module file not found']);

require DIR.'api/'.$_POST['module'].'/'.$_POST['module'].'.php';
$actions = empty($actions) ? [] : $actions;

if (empty($_POST['action']) || 
	!in_array($_POST['action'], array_keys($actions)))
	returnJson(6, ['message' => 'Action is invalid or not specified', 'actions' => $actions]);

if (!function_exists($_POST['module'].'_'.$_POST['action']))
	returnJson(7, ['message' => 'Intern error : action function not found']);

if ((!defined('DEBUG_API') || 
		!DEBUG_API || 
		!defined('NO_SECURED_ACTION') ||
		!NO_SECURED_ACTION) &&
	substr($_POST['action'], 0, 2) == 'S_') {
	$tokens = $pdo->query('SELECT '.
			'token '.
		'FROM tokens '.
		'WHERE '.
			'id_utilisateur = '.(int) $user['id'].' AND '.
			'expire > NOW()')
		->fetchAll(PDO::FETCH_ASSOC | PDO::FETCH_UNIQUE);

	if (empty($_POST['action_token']) ||
		!in_array($_POST['action_token'], array_keys($tokens)))
		returnJson(8, ['message' => 'Action token is invalid or not specified (secured action)']);

	$pdo->exec('DELETE FROM tokens '.
		'WHERE '.
			'token = "'.secure($_POST['action_token']).'" AND '.
			'id_utilisateur = '.(int) $user['id']);
}

else if ((!defined('DEBUG_API') || 
		!DEBUG_API || 
		!defined('NO_TIMED_ACTION') ||
		!NO_TIMED_ACTION) &&substr($_POST['action'], 0, 2) == 'T_') {
	if (empty($_POST['timestamp']) ||
		!intval($_POST['timestamp']) ||
		abs(time() - $_POST['timestamp']) > VALIDITY_TIMED_ACTION)
		returnJson(9, ['message' => 'Timestamp is invalid or not specified (timed action)']);
}


$function = $_POST['module'].'_'.$_POST['action'];
unset($_POST['signature']);
unset($_POST['public_token']);
unset($_POST['action_token']);
unset($_POST['module']);
unset($_POST['action']);
unset($_POST['_debug']);

$function($_POST, $pdo, $user);

ob_end_clean();
returnJson(0, []);

