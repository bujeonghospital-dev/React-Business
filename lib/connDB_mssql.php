<?php  
 
$serverName = "192.168.0.44";  
$uid = "dev";
$pwd = "ITD@9999";
$connectionInfo = array("UID" => $uid, "PWD" => $pwd, "Database"=>"TPP_LIV_App", 
"MultipleActiveResultSets"=>true,"CharacterSet"  => 'UTF-8');  
$conn_MSsql = sqlsrv_connect( $serverName, $connectionInfo);  


  
