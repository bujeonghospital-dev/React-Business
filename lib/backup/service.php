<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once "../lib/connDB.php";
// require_once 'functions.php';
require_once '../lib/lang.php';


function getSystemMenu_active($host,$id_system_COOKIE)
{
    $db = new DB();
    $cut_url = explode('/', $host);
    $strSQL = "SELECT
    CASE WHEN COUNT(`id`) = 0  THEN (SELECT `id` FROM  `menu_system` WHERE `link_menu` LIKE '".$cut_url[0]."/%' LIMIT 1 ) WHEN `id` != ''  THEN `id` END AS id
FROM
    `menu_system`
WHERE
    `link_menu` = '".$host."'";
    if(isset($id_system_COOKIE) && $id_system_COOKIE != ''){
        $strSQL .= " AND `id` = '".$id_system_COOKIE."' ";
    }


 
  
    $objQuery = $db->Query($strSQL);
    $objResult = mysqli_fetch_array($objQuery, MYSQLI_ASSOC);
    $_COOKIE["id_system"] = $objResult["id"];

}


function getLinkSystem($local)
{
    $db = new DB();
    $local = $db->clear($local);
    $str_local = "SELECT link_menu,type FROM `menu_system` WHERE link_menu = '" . $local . "'";
    $result_local = $db->QueryFetchArray($str_local);
    return $result_local;
}



function getCurrentUser()
{
    $db = new DB();
    if (isset($_SESSION["user_id"])) {
        $user_id = $db->clear($_SESSION["user_id"]);
    }else{
        $user_id = "";
    }
    
    $str_user = "SELECT * FROM user WHERE id = '" . $user_id . "' and delete_date is NULL";
    $query_user = $db->Query($str_user);
    $result_user = mysqli_fetch_array($query_user);
    return $result_user;
}

function checkTable($table)
{
    $db = new DB();
    $str_tbl = "SHOW TABLES LIKE '" . $table . "'";
    $query_tbl = $db->Query($str_tbl);
    return $query_tbl;
}

function getUserPermissions($user_id)
{
    $db = new DB();
    $user_id = $db->clear($user_id);
    $str_em = "SELECT user_permissions.*,`menu_system`.`link_menu` AS link_system,`menu_system`.`id` AS id_system FROM user_permissions,`menu_system` WHERE user_permissions.id_menu = `menu_system`.`id` AND user_permissions.id_user = '" . $user_id . "'";
    $result_em = $db->Query($str_em);
    return $result_em;
}


function getSystemMenu($type, $level, $groups)
{
    $db = new DB();
    $level = $db->clear($level);
    $type = $db->clear($type);
    $groups = $db->clear($groups);
    $strSQL = "SELECT  `id` AS id_system, `name_th` AS name_system, `name_en` AS name_system_en, `link_menu` AS link_system, `type`, `groups`, `sort`, `level`, `icon` FROM `menu_system` WHERE level = '" . $level . "' AND type = '" . $type . "' ";
    if (isset($groups) && $groups != null) {
        $strSQL .= " AND groups = '" . $groups . "' ";
    }
    $strSQL .= " ORDER BY sort";
    //echo $strSQL;
    $objQuery = $db->Query($strSQL);
    return $objQuery;
}


function searchByValue($id, $array)
{
    foreach ($array as $key => $val) {
        if ($val['id'] === $id) {
            $resultSet['permissions'] = $val['permissions'];
            $resultSet['key'] = $key;
            $resultSet['id'] = $val['id'];
            return $resultSet;
        }
    }
    return null;
}


function check_token()
{
    $db = new DB();
    if (isset($_SESSION["user_id"])) {
        $user_id = $_SESSION["user_id"];
        $str = "SELECT user.token FROM `user`
        WHERE user.id = '" . $user_id . "' and user.delete_date is NULL ";
        $result = $db->QueryFetchArray($str);
        
      
        if (!isset($result) || (isset($result) && $_SESSION["token"] != $result['token'])) {
            session_destroy();
            echo '<script type="text/javascript">
            window.location="'.get_setting_web("Link_Redirect_Index").'";
            </script>';
            exit();
        }
    }else{
        //header('Location: ../page_home/index.php');
        session_destroy();
        echo '<script type="text/javascript">
            window.location="'.get_setting_web("Link_Redirect_Index").'";
        </script>';
        exit();
    } 
   
}

function ckecke_permission($data){
    if($data != ''){
        echo '<script type="text/javascript">alert("คุณไม่มีสิทธิ์ในการทำรายการนี้");window.location="'.get_setting_web("Link_Redirect_Index").'"; </script>';
        // echo '<script type="text/javascript">
        // Swal.fire({
        //     title: "คำเตือน!!!",
        //     text: "คุณไม่มีสิทธิ์ในการทำรายนี้",
        //     icon: "warning",
        //     showCancelButton: false,
        //     confirmButtonColor: "#3085d6",
        //     cancelButtonColor: "#d33",
        //     confirmButtonText: "OK"
        //   }).then((result) => {
        //     window.location="../page_home/index.php";
        //   });
          
           
        // </script>';
        exit();
    }

}
// function ckecke_type_file()
// {
//     var file=document.form_add.name_img.value;
//     var patt=/(.jpg|.png|.jpeg)/;
//     var result=patt.test(file);
//             if(!result){
//             swal.fire("คำเตือน", 'file type is wrong ("jpeg", "jpg", "png" only)', "error");
//             var tagButton = document.getElementsByClassName("dropify-clear")[0];
//             tagButton.click();
//             }
//     return result;
   
// }

//เปลี่ยนชื่อไฟล์ที่ถูกลบไปแล้วให้ขึ้นต้นด้วย Delete-ชื่อไฟล์
function rename_file_del($path,$name_file){
    $name_old = $path.$name_file;
    $name_new = $path."Delete-".$name_file;
    rename($name_old,$name_new);
}


function get_setting_web($data){
    $db = new DB();
    $strSQL = "SELECT `values` FROM `setting_web` WHERE `tag` = '".$data."' AND  `delete_date` IS null";
 
  
    $objQuery = $db->Query($strSQL);
    $objResult = mysqli_fetch_array($objQuery, MYSQLI_ASSOC);
    if(isset($objResult["values"])){
        return $objResult["values"];
    }else{
        return '';
    }
    

}

function get_setting_web_id($data){
    $db = new DB();
    $strSQL = "SELECT `id` FROM `setting_web` WHERE `tag` = '".$data."' AND  `delete_date` IS null";
 
  
    $objQuery = $db->Query($strSQL);
    $objResult = mysqli_fetch_array($objQuery, MYSQLI_ASSOC);
    if(isset($objResult["id"])){
        return $objResult["id"];
    }else{
        return '';
    }
    

}

function get_time_server()
{
    date_default_timezone_set("Asia/Bangkok");
    $today = getdate();
    $daterange = $today['year'].'/'.$today['mon'].'/'.$today['mday'].' '.$today['hours'].':'.$today['minutes'].':'.$today['seconds'];
    $date1 = strtotime($daterange);
    $date_sever = date('Y-m-d H:i:s', $date1);
    return $date_sever;
}



function run_refno($document_number,$runnumber_get,$type_product,$ref_web) {
    $db = new DB();
    if (isset($_SESSION["id_company"])) {
      $id_company = $_SESSION["id_company"];
    }else{
      $id_company = '';
    }
  
  
  
    $sql = "SELECT * FROM `mod_document` where  tag = '".$runnumber_get."'   AND id_company = '' ";    
    $query = $db->Query($sql);
    $result = mysqli_fetch_array($query,MYSQLI_ASSOC);
    
    $code = $result['prefix'];
    $length = $result['length'];
    $lengthnumber  =  strlen($result['formate']);
    $cut = $lengthnumber-$length;
    $numbersum = pow(10,$cut);
    $datasub = substr($result['formate'],$lengthnumber-$length);
    $zero = "";
  
    if (isset($document_number) && $document_number != '') {
        $document_number = $document_number;
    }else{
        $document_number = $result['default'];
    }
  
    for ($x = 1; $x < $length; $x++) {
      $zero = $zero."0";
    }
  
    $zero = $zero."1";
  
  
      if($result['year_flg'] == 1){
        if ($result['year_form'] == '1') {
          $code = $code.(date("Y")+543);
        }else if ($result['year_form'] == '2') {
          $code = $code.substr((date("Y")+543),2);
        }else if ($result['year_form'] == '3') {
          $code = $code.date("Y");
        }else if ($result['year_form'] == '4') {
          $code = $code.substr(date("Y"),2);
        }
          
      }
  
  
        if($result['month_flg'] == 1){
  
          $code = $code.date("m");
        }
     
    if($result['day_flg'] == 1){
  
      $code = $code.date("d");
      
    }
  
  
      $sqlnumber = "   SELECT   CASE WHEN  SUBSTRING('$document_number', 1, $cut) = '$code' THEN  CONCAT('$code',RIGHT($numbersum+SUBSTRING('$document_number', $cut, $lengthnumber)+1,$length)  )  ELSE '$code$zero' END as runnumber  ";
      $querynumber = $db->Query($sqlnumber);
      $resultnumber = mysqli_fetch_array($querynumber,MYSQLI_ASSOC);
      $runnumber = $code.$zero;
      if($resultnumber['runnumber'] != ""){
          $runnumber =    $resultnumber['runnumber'];
      }
  
  
      if (isset($_SESSION['type_company'])) {
          $type_company = $_SESSION['type_company'];
      } else {
          $type_company = '';
      }
      if (isset($_SESSION['id_company'])) {
          $id_company = $_SESSION['id_company'];
      } else {
          $id_company = '';
      }
  
      $ref_web = $ref_web;
    //   $id = setMD5();   
    //   $str = "INSERT INTO `mod_runnumber`(`id`, `refno`, `document_no`, `type_product`, `ref_web`, `id_company`, `create_datetime`) VALUES ('".$id."','".$runnumber."','".$runnumber_get."','".$type_product."','".$ref_web."','".$id_company."',NOW(6))";
    //   $objQuery = $db->Query($str);
      return $runnumber;
  
      
  
}

function get_name_menu(){
    $db = new DB();
    $url = $_SERVER["SERVER_NAME"] . $_SERVER["REQUEST_URI"];
    $cut_url = explode('/', $url);

    $num_fo = count($cut_url) - 2;
    $num_fi = count($cut_url) - 1;

    $folder = $cut_url[$num_fo];
    $file = $cut_url[$num_fi];

    $sql = "SELECT `name_th` FROM `menu_system` WHERE `link_menu` LIKE '%".$folder."/%' ";    
    $query = $db->Query($sql);
    $result = mysqli_fetch_array($query,MYSQLI_ASSOC);


    return $result["name_th"];
}



function RUNNUMBER($tag,$document_number,$id_company) {
    $db = new DB();
    if (isset($_SESSION["id_company"])) {
      $id_company = $_SESSION["id_company"];
    }else{
      $id_company = '';
    }
    
        //$sql = "SELECT * FROM `mod_document` where  tag = '$tag'   AND id_company = '".$id_company."'  ";    
    $sql = "SELECT * FROM `mod_document` where  tag = '$tag'    ";    
    $query = $db->Query($sql);
    $result = mysqli_fetch_array($query,MYSQLI_ASSOC);
      
      $code = $result['prefix'];
      $length = $result['length'];
      $lengthnumber  =  strlen($result['formate']);
      $cut = $lengthnumber-$length;
      $numbersum = pow(10,$cut);
      $datasub = substr($result['formate'],$lengthnumber-$length);
      $between1 = $result['between1'];
      $between2 = $result['between2'];
      $between3 = $result['between3'];
      $between4 = $result['between4'];
      $zero = "";
    
    
    
      for ($x = 1; $x < $length; $x++) 
        {
        $zero = $zero."0";
        }
    
        $zero = $zero."1";

        $code =  $code.$between1;
    
    
        if($result['year_flg'] == 1){
            if($result['year_form'] == 1){
                $code = $code.(date("Y")+543);
            }else if($result['year_form'] == 2){
                $code = $code.substr((date("Y")+543), -2);
            }else if($result['year_form'] == 3){
                $code = $code.date("Y");
            }else if($result['year_form'] == 4){
                $code = $code.date("y");
            }
            
        }

        $code =  $code.$between2;
    
 
        if($result['month_flg'] == 1){
            $code = $code.date("m");
        }

        $code =  $code.$between3;
       
        if($result['day_flg'] == 1){
            $code = $code.date("d");
        }

        $code =  $code.$between4;
    
        $cut1 = $cut+1;
        $sqlnumber = "   SELECT   CASE WHEN  SUBSTRING('$document_number', 1, $cut) = '$code' THEN  CONCAT('$code',RIGHT($numbersum+SUBSTRING('$document_number', $cut1, $lengthnumber)+1,$length)  )  ELSE '$code$zero' END as runnumber  ";
        $querynumber = $db->Query($sqlnumber);
        $resultnumber = mysqli_fetch_array($querynumber,MYSQLI_ASSOC);
        $runnumber = $code.$zero;
        if($resultnumber['runnumber'] != ""){
            $runnumber =    $resultnumber['runnumber'];
        }
    
    
    
    
    
    return $runnumber;
    
    }

/////การรันเลขที่เอกสารแบบพิเศษคือ รันเลขทั้งปี  แต่แสดงเดือนด้วย/////////////
    function RUNNUMBER_QA($tag,$document_number,$id_company) {
        $db = new DB();
        if (isset($_SESSION["id_company"])) {
          $id_company = $_SESSION["id_company"];
        }else{
          $id_company = '';
        }
        
            //$sql = "SELECT * FROM `mod_document` where  tag = '$tag'   AND id_company = '".$id_company."'  ";    
        $sql = "SELECT * FROM `mod_document` where  tag = '$tag'    ";    
        $query = $db->Query($sql);
        $result = mysqli_fetch_array($query,MYSQLI_ASSOC);
          
          $code = $result['prefix'];
          $length = $result['length'];
          $lengthnumber  =  strlen($result['formate']);
          $cut = $lengthnumber-$length;
          $numbersum = pow(10,$cut);
          $datasub = substr($result['formate'],$lengthnumber-$length);
          $between1 = $result['between1'];
          $between2 = $result['between2'];
          $between3 = $result['between3'];
          $between4 = $result['between4'];
          $zero = "";
        
        
        
          for ($x = 1; $x < $length; $x++) 
            {
            $zero = $zero."0";
            }
        
            $zero = $zero."1";
    
            $code =  $code.$between1;
        
        
            if($result['year_flg'] == 1){
                if($result['year_form'] == 1){
                    $code = $code.(date("Y")+543);
                }else if($result['year_form'] == 2){
                    $code = $code.substr((date("Y")+543), -2);
                }else if($result['year_form'] == 3){
                    $code = $code.date("Y");
                }else if($result['year_form'] == 4){
                    $code = $code.date("y");
                }
                
            }
    
            $code =  $code.$between2;

            $code1 = $code;
        
     
            if($result['month_flg'] == 1){
                $code = $code.date("m");
            }
    
            $code =  $code.$between3;
           
            if($result['day_flg'] == 1){
                $code = $code.date("d");
            }
    
            $code =  $code.$between4;
        
            $cut1 = $cut+1;
             $sqlnumber = "   SELECT   CASE WHEN  SUBSTRING('$document_number', 1, 9) = '$code1' THEN  CONCAT('$code',RIGHT($numbersum+SUBSTRING('$document_number', $cut1, $lengthnumber)+1,$length)  )  ELSE '$code$zero' END as runnumber  ";
            $querynumber = $db->Query($sqlnumber);
            $resultnumber = mysqli_fetch_array($querynumber,MYSQLI_ASSOC);
            $runnumber = $code.$zero;
            if($resultnumber['runnumber'] != ""){
                $runnumber =    $resultnumber['runnumber'];
            }
        
        
        
        
        
        return $runnumber;
        
        }
/////end การรันเลขที่เอกสารแบบพิเศษคือ รันเลขทั้งปี  แต่แสดงเดือนด้วย/////////////


    function get_client_ip() {
        $ipaddress = '';
        if (getenv('HTTP_CLIENT_IP'))
            $ipaddress = getenv('HTTP_CLIENT_IP');
        else if(getenv('HTTP_X_FORWARDED_FOR'))
            $ipaddress = getenv('HTTP_X_FORWARDED_FOR');
        else if(getenv('HTTP_X_FORWARDED'))
            $ipaddress = getenv('HTTP_X_FORWARDED');
        else if(getenv('HTTP_FORWARDED_FOR'))
            $ipaddress = getenv('HTTP_FORWARDED_FOR');
        else if(getenv('HTTP_FORWARDED'))
           $ipaddress = getenv('HTTP_FORWARDED');
        else if(getenv('REMOTE_ADDR'))
            $ipaddress = getenv('REMOTE_ADDR');
        else
            $ipaddress = 'UNKNOWN';
        return $ipaddress;
    }


    function generateRandomString($length) {
        if($length==''){
            $length = 6;
        }
	    $characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	    $charactersLength = strlen($characters);
	    $randomString = '';
	    for ($i = 0; $i < $length; $i++) {
	        $randomString .= $characters[rand(0, $charactersLength - 1)];
	    }
	    return $randomString;
	}


    function get_admin_system(){
        $db = new DB();
        if(isset($_COOKIE["id_system"])){
            $id_system = $_COOKIE["id_system"];
        }else{
            $id_system = "";
        }
        
        
        $sql = "SELECT user.id,
        CONCAT(user.name,' ',user.Lname) AS name_user,
        user.tel,
        department.name_full_th AS dept_name,
        position.name_full_th AS position_name,
        mod_admin_system.parth_file,
        mod_admin_system.name_file,
        mod_admin_system.id AS id_admin_system
    FROM
        `mod_admin_system`
        LEFT JOIN user ON mod_admin_system.id_user = user.id
        LEFT JOIN department ON user.id_dep = department.id
        LEFT JOIN position ON user.position = position.id
    WHERE
        `id_menu_system` = '".$id_system."' ";    
        $query = $db->Query($sql);
        $result = mysqli_fetch_array($query,MYSQLI_ASSOC);
        if(isset($result['id']) && $result['id'] != ''){

        
        


        $sql_user_img = "SELECT
            parth_file.id AS id_file,
            parth_file.path,
            parth_file.name_file
            FROM
            `parth_file`
            WHERE  parth_file.id_ref = '".$result['id']."' AND prefix = 'user_img' AND parth_file.delete_date is null
            ";
            $query_user_img = $db->query($sql_user_img) or die ("Error Query [".$sql_user_img."]");
            $result_user_img = $query_user_img->fetch_assoc();
            if(isset($result_user_img["path"]) && isset($result_user_img["name_file"]) && $result_user_img["path"] != '' && $result_user_img["name_file"] != ''){
                if(file_exists($result_user_img["path"].$result_user_img["name_file"])){
                    $avatar = $result_user_img["path"].$result_user_img["name_file"];
                }else{
                    $avatar = "../images/user.png";
                }
            }else{
                $avatar = "../images/user.png";
            }

            $data = ["name_user" => $result["name_user"],"tel" => $result["tel"],"dept_name" => $result["dept_name"],
            "position_name" => $result["position_name"],"avatar" => $avatar,"parth_file" => $result["parth_file"],"name_file" => $result["name_file"]];
            $text_html = "";
            $text_html .= '<div class="col-md-12 row">';
            $text_html .= '<div class="col-4"></div>';
            $text_html .= '<div class="col-3"></div>';
            $text_html .= '<div class="col-5" style="margin-bottom: 10px;position: relative;">';
            $text_html .= '<H3>ผู้ดูแลข้อมูล</H3>';
            $text_html .= '<div style="position: absolute;
            top: 10px;
            right: 16px;" class="topright"><a target="_blank" class="text-themecolor" href="'.$data['parth_file'].$data['name_file'].'">คู่มือ</a></div>';
            $text_html .= '<img src="'. $data['avatar'].'" alt="user" class="profile-pic" style="    width: 30px;border-radius: 100%;"> ';
            $text_html .= ' คุณ '.$data['name_user'].'<br>';
            $text_html .= $data['dept_name'].' '.$data['position_name'].'<br>';
            $text_html .= '<i class="mdi mdi-phone-classic"></i> โทรศัพท์ภายใน : '.$data['tel'].'<br>';
            $text_html .= '</div>';
            $text_html .= '</div>';
        }else{
            $text_html = "";
            if(isset($result["id_admin_system"]) && $result["id_admin_system"] != ''){
                $text_html .= '<div style="position: absolute;
                top: 100px;
                right: 16px;" class="topright"><a target="_blank" class="text-themecolor" href="'.$result['parth_file'].$result['name_file'].'">คู่มือ</a></div>';
            }else{
                $text_html .= '';
            }
        }
    
    
        return $text_html;
    }


    function get_name_user($data){
        $db = new DB();
        $strSQL = "SELECT concat(`name`,' ',`Lname`) AS name_user FROM `user` WHERE `id` = '".$data."' ";
     
      
        $objQuery = $db->Query($strSQL);
        $objResult = mysqli_fetch_array($objQuery, MYSQLI_ASSOC);
        if(isset($objResult["name_user"])){
            return $objResult["name_user"];
        }else{
            return '';
        }
        
    
    }


    function DateDiff($strDate1,$strDate2)
	 {
				return (strtotime($strDate2) - strtotime($strDate1))/  ( 60 * 60 * 24 );  // 1 day = 60*60*24
	 }
	 function TimeDiff($strTime1,$strTime2)
	 {
				return (strtotime($strTime2) - strtotime($strTime1))/  ( 60 * 60 ); // 1 Hour =  60*60
	 }
	 function DateTimeDiff($strDateTime1,$strDateTime2)
	 {
				return (strtotime($strDateTime2) - strtotime($strDateTime1))/  ( 60 * 60 ); // 1 Hour =  60*60
	 }

    //  echo "Date Diff = ".DateDiff("2008-08-01","2008-08-31")."<br>";
	//  echo "Time Diff = ".TimeDiff("00:00","19:00")."<br>";
	//  echo "Date Time Diff = ".DateTimeDiff("2008-08-01 00:00","2008-08-01 19:00")."<br>";



    function compareDate_MPC($date1,$date2) {
 
		$arrDate1 = explode("/",$date1);
		$arrDate2 = explode("/",$date2);
		$timStmp1 = mktime(0,0,0,$arrDate1[1],$arrDate1[0],$arrDate1[2]);
		$timStmp2 = mktime(0,0,0,$arrDate2[1],$arrDate2[0],$arrDate2[2]);

		if ($timStmp1 == $timStmp2) {
			//return "\$date = \$date2";
            return "เท่า";
		} else if ($timStmp1 > $timStmp2) {
			//return "\$date > \$date2";
            return "ส่งเร็ว";
		} else if ($timStmp1 < $timStmp2) {
			//return "\$date < \$date2";
            return "late";
		}
	}
    //ใช้ compareDate_MPC -> echo compareDate_MPC("20/06/2024","20/06/2024") -> date1 = วันที่ต้องการ, date2 = วันที่ของเข้า;
    //echo compareDate("2004-01-06","2004-05-06");

    function diff_date_matl($strDateTime1,$strDateTime2){


        $arrDate1 = explode("/",$strDateTime1);
		$arrDate2 = explode("/",$strDateTime2);

        $strDateTime1 = $arrDate1[2]."-".$arrDate1[1]."-".$arrDate1[0];
		$strDateTime2 = $arrDate2[2]."-".$arrDate2[1]."-".$arrDate2[0];


        $date1=date_create($strDateTime1);
        $date2=date_create($strDateTime2);

    //     $date1=date_create("2024-07-02 12:39");
    //    // echo "<br>";
    //      $date2=date_create("2024-07-03 12:38");
     
        $diff=date_diff($date1,$date2);
        $diff_date =  $diff->format("%R%a");
        return $diff_date;

       
    }


    function check_department($name){
        //if((isset($_SESSION["department_name_fix"]) && ($_SESSION["department_name_fix"] == $name)) ){
        if((isset($_SESSION["department_name_fix"]) && ($_SESSION["department_name_fix"] == $name)) || $_SESSION["admin"] == "1" || $_SESSION["admin"] == "2"){
            
        }else{
            header('Content-Type: appplication/json');
            echo json_encode(array('status' => '1', 'message' => 'คุณไม่มีสิทธิ์ทำรายการ'));
            exit();
        }
    }

?>