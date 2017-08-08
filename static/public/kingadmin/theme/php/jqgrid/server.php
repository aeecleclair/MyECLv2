<?php

include 'dbconfig.php';

$page = $_GET['page']; // get the requested page
$limit = $_GET['rows']; // get how many rows we want to have into the grid
$sidx = $_GET['sidx']; // get index row - i.e. user click to sort
$sord = $_GET['sord']; // get the direction
if(!$sidx)
	$sidx =1;

$wh = "";
$searchOn = Strip($_REQUEST['_search']);
if($searchOn == 'true') {
	$searchstr = Strip($_REQUEST['filters']);
	$wh = constructWhere($searchstr);
}

function constructWhere($s){
	$qwery = "";
	//['eq','ne','lt','le','gt','ge','bw','bn','in','ni','ew','en','cn','nc']
	$qopers = array(
				  'eq'=>" = ",
				  'ne'=>" <> ",
				  'lt'=>" < ",
				  'le'=>" <= ",
				  'gt'=>" > ",
				  'ge'=>" >= ",
				  'bw'=>" LIKE ",
				  'bn'=>" NOT LIKE ",
				  'in'=>" IN ",
				  'ni'=>" NOT IN ",
				  'ew'=>" LIKE ",
				  'en'=>" NOT LIKE ",
				  'cn'=>" LIKE " ,
				  'nc'=>" NOT LIKE " );
	if ($s) {
		$jsona = json_decode($s,true);
		if(is_array($jsona)){
			$gopr = $jsona['groupOp'];
			$rules = $jsona['rules'];
			$i =0;
			foreach($rules as $key=>$val) {
				$field = $val['field'];
				$op = $val['op'];
				$v = $val['data'];
				if($v && $op) {
					$i++;
					// ToSql in this case is absolutley needed
					$v = ToSql($field, $op, $v);
					if ($i == 1) $qwery = " AND ";
					else $qwery .= " " .$gopr." ";
					switch ($op) {
						// in need other thing
						case 'in' :
						case 'ni' :
							$qwery .= $field.$qopers[$op]." (".$v.")";
							break;
						default:
							$qwery .= $field.$qopers[$op].$v;
					}
				}
			}
		}
	}

	return $qwery;
}

function ToSql ($field, $oper, $val) {
	// we need here more advanced checking using the type of the field - i.e. integer, string, float
	switch ($field) {
		case 'id':
			return intval($val);
			break;
		case 'amount':
		case 'tax':
		case 'total':
			return floatval($val);
			break;
		case 'invdate':
			$arrDateVal = explode("/", $val);
			return '\'' . $arrDateVal[2] . '-' . $arrDateVal[0] . '-' . $arrDateVal[1] . '\''; // reformat date to: Y-m-d
			break;
		default :
			//mysql_real_escape_string is better
			if($oper=='bw' || $oper=='bn') return "'" . addslashes($val) . "%'";
			else if ($oper=='ew' || $oper=='en') return "'%" . addcslashes($val) . "'";
			else if ($oper=='cn' || $oper=='nc') return "'%" . addslashes($val) . "%'";
			else return "'" . addslashes($val) . "'";
	}
}

// connect to the database
$db = mysql_connect($DB_HOST, $DB_USERNAME, $DB_PASSWORD)
or die("Connection Error: " . mysql_error());

mysql_select_db($DB_NAME) or die("Error conecting to db.");
$result = mysql_query("SELECT COUNT(*) AS count FROM invheader");
$row = mysql_fetch_array($result,MYSQL_ASSOC);
$count = $row['count'];

if( $count >0 ) {
	$total_pages = ceil($count/$limit);
} else {
	$total_pages = 0;
}

if ($page > $total_pages)
	$page=$total_pages;

$start = $limit*$page - $limit; // do not put $limit*($page - 1)
$SQL = "SELECT * FROM invheader  WHERE 1 " . $wh . " ORDER BY $sidx $sord LIMIT $start , $limit";
$result = mysql_query( $SQL ) or die("Couldn't execute query." . mysql_error() . " Query: " . $SQL);

$response = new Response();
$response->page = $page;
$response->total = $total_pages;
$response->records = $count;
$i=0;

while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
	$response->rows[$i]['id'] = $row["invid"];
	$response->rows[$i]['cell'] = array(null, $row["invid"], $row["client_id"], $row["invdate"], $row["amount"], $row["tax"], $row["total"], $row["closed"], $row["ship_via"], $row["note"]);
	$i++;
}

mysql_close($db);
echo json_encode($response);

function Strip($value)
{
	if(get_magic_quotes_gpc() != 0)
	{
		if(is_array($value))  
			if ( array_is_associative($value) )
			{
				foreach( $value as $k=>$v)
					$tmp_val[$k] = stripslashes($v);
				$value = $tmp_val; 
			}				
			else  
				for($j = 0; $j < sizeof($value); $j++)
					$value[$j] = stripslashes($value[$j]);
		else
			$value = stripslashes($value);
	}
	return $value;
}

function array_is_associative ($array)
{
	if ( is_array($array) && ! empty($array) )
	{
		for ( $iterator = count($array) - 1; $iterator; $iterator-- )
		{
			if ( ! array_key_exists($iterator, $array) ) { return true; }
		}
		return ! array_key_exists(0, $array);
	}
	return false;
}

class Response {
	var $page, $total, $records, $rows;
}

?>