<?php  
 
$serverName = "192.168.0.44";  
$uid = "dev";
$pwd = "ITD@9999";
$connectionInfo2DB = array("UID" => $uid, "PWD" => $pwd, "Database" => "TPP_Web_Portal", 
"MultipleActiveResultSets"=>true,"CharacterSet"  => 'UTF-8');  
$conn_MSsql2DB = sqlsrv_connect( $serverName, $connectionInfo2DB);  

$connectionInfo2DB = array("UID" => $uid, "PWD" => $pwd, "Database" => "TPP_LIV_App", 
"MultipleActiveResultSets"=>true,"CharacterSet"  => 'UTF-8');  
$conn_MSsql2DB = sqlsrv_connect( $serverName, $connectionInfo2DB);  


  
