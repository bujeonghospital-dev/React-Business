<?php
	session_start();
	session_destroy();

	echo"<script>";
			echo"window.location='../mod_knowledge/index.php?dep=3';";
			echo"</script>";
?>