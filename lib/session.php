<?php
echo  session_status();
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
require_once  "../lib/connDB.php";

$con = new DB();

	if(!isset($_SESSION['USERNAME']))
	{
		echo "<script>alert(' !! กรุณาทำการล็อกอิน เพื่อเข้าสู่ระบบ !! '); window.location='login.php';</script>";
		exit();
	}
	$username = $_SESSION['USERNAME'];

	$strSQL = 'SELECT * FROM member WHERE username = "'.$username.'" ';
	// $query = mysql_query($strSQL);
	// $rowuser = mysql_fetch_array($query);
	$query = $con->query($strSQL) or die ("Error Query [".$strSQL."]");
	$rowuser = $query->fetch_assoc();

	$permission = $rowuser["permission"];
	$dept_id = $rowuser["dept_id"];
?>