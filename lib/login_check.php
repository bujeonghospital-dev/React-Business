<?php
session_start();
require_once  "../lib/connDB.php";
require_once  "../lib/lang.php";
require_once  "../lib/service.php";

$con = new DB();

// if(isset($_POST['username_login']) && isset($_POST['password_login']) && $_POST['username_login'] != '' && $_POST['password_login'] != '' ){
// $username=$_POST['username_login'];
// $userpass=$_POST['password_login'];


// $sql = "SELECT * FROM user WHERE username ='$username' AND passward='$userpass'"; //ค้นหาสมาชิก
// 		//$query =mysql_query($sql) or die ("error=$sql");
// 		$query = $con->query($sql) or die ("Error Query [".$sql."]");
// 		$num = mysqli_num_rows($query);
// 		//$rowuser = mysql_fetch_array($query);
// 		$rowuser = $query->fetch_assoc();
// 			if($num)
// 			{
// 				$_SESSION["user_id"] = $rowuser["id"];

				
// 				session_write_close();

//                 header('Content-Type: application/json');
//                 echo json_encode(array('status' => '0'));
// 			}
// 			else		
// 			{
//                 header('Content-Type: application/json');
//                 echo json_encode(array('status' => '1'));
// 			}
// 		exit();
// }else{
// 	header('Content-Type: application/json');
// 	echo json_encode(array('status' => '2', 'msg' => 'กรุณากรอก Username และ Password'));
// }



// function doLogin()
// {
    setCookieEmpty("lang", "th");
    $db = new DB();
    header('Content-Type: application/json');
    // if (isset($_POST['username_login'])) {
    //     $username = $_POST['username_login'];
    // } else {
    //     $username = $_POST['username_login'];
    // }
    $username = $_POST['username_login'];
    $password = $_POST['password_login'];

    $username = $db->clear($username);
    $password = $db->clear($password);

    $str = "SELECT user.*,user.name AS Fname,roles.name,roles.tag,roles.back_end,department.name AS department_name_fix  ,department.name_full_th AS department_name  ,position.name_full_th AS position_name
    FROM user 
    LEFT JOIN roles ON user.id_role = roles.id_role  
    LEFT JOIN `department` ON user.id_dep  = `department`.id
    LEFT JOIN `position` ON user.position  = `position`.id
    WHERE username  = '" . $username . "'  AND user.delete_date IS NULL";
    $result = $db->QueryFetchArray($str);
    // $status_backend = $result["back_end"];
    // $_SESSION["back_end_permissions"] = $result["back_end"];
    $status_backend = 1;
    $_SESSION["back_end_permissions"] = 1;
    //var_dump($str);


    if (!$result) {
        echo json_encode(array('status' => '1', 'message' => 'ชื่อผู้ใช้งานไม่ถูกต้อง'));
    } else {
        $hash = $result['password'];
        if (password_verify($password, $hash)) {
            $sql_user_img = "SELECT
            parth_file.id AS id_file,
            parth_file.path,
            parth_file.name_file
            FROM
            `parth_file`
            WHERE  parth_file.id_ref = '".$result['id']."' AND prefix = 'user_img' AND parth_file.delete_date is null
            ";
            $query_user_img = $con->query($sql_user_img) or die ("Error Query [".$sql_user_img."]");
            $result_user_img = $query_user_img->fetch_assoc();
            if(isset($result_user_img["path"]) && isset($result_user_img["name_file"]) && $result_user_img["path"] != '' && $result_user_img["name_file"] != ''){
                if(file_exists($result_user_img["path"].$result_user_img["name_file"])){
                    $_SESSION['avatar'] = $result_user_img["path"].$result_user_img["name_file"];
                }else{
                    $_SESSION['avatar'] = "../images/user.png";
                }
            }else{
                $_SESSION['avatar'] = "../images/user.png";
            }
            

        $_SESSION["user_id"] = session_id();
        $name = "";
        
        $_SESSION['position'] = "";
        $_SESSION['email'] = "";
        $_SESSION['name'] = $result['username'];
		$_SESSION['username'] = $result['username'];
        $_SESSION['admin'] = 0;
        
            $_SESSION["user_id"] = $result['id'];
            $_SESSION["user_session"] = session_id();
            $_SESSION["id_data"] = $result['id'];
            $_SESSION['admin'] = $result['admin'];
            $_SESSION['role_name'] = $result['name'];
            $_SESSION['role_tag'] = $result['tag'];
			$_SESSION['name'] = $result['Fname'].' '.$result['Lname'];
            if($result['department_name'] != ''){
                $_SESSION["department_name"] = $result['department_name'];
            }else{
                $_SESSION["department_name"] = "ไม่ระบุ";
            }

            if($result['department_name_fix'] != ''){
                $_SESSION["department_name_fix"] = $result['department_name_fix'];
            }else{
                $_SESSION["department_name_fix"] = "ไม่ระบุ";
            }

            if($result['position_name'] != ''){
                $_SESSION["position_name"] = $result['position_name'];
            }else{
                $_SESSION["position_name"] = "ไม่ระบุ";
            }
            
           
            

            $result_perm = getUserPermissions($result['id']);
            
            $task_view = array();
            $task_authen = array();
            $permissions = array();
            while ($obResult = mysqli_fetch_array($result_perm)) {
                array_push($permissions, array("id"=>$obResult['id_system'],"permissions"=>$obResult['permissions'],"link"=>$obResult['link_system']));
                array_push($task_view, $obResult['id_system']);
                array_push($task_authen, $obResult['permissions']);
            }

            $_SESSION["permissions"] = $permissions;
            $_SESSION["task_view"] = $task_view;
            $_SESSION["task_authen"] = $task_authen;

            if (isset($_POST['username_login'])) {
                if($result['id'] == '1'){
                    $_SESSION["user_id"] = $result['id'];
                    $_SESSION['admin'] = $result['admin'];
                    $_SESSION["id_data"] = $result['id'];
                    $_SESSION['name'] = "Super Admin";
                    $_SESSION["back_end_permissions"] = '1';
                    $_SESSION['position'] = '';
                    $_SESSION['avatar'] = '';
                }
                
            } else {
                // switch ($result['tag']) {
                                  


                //     default:
                //         if (!empty($result['id_role'])) {
                         
                          
                //         } else {
                //             $name =  $result['admin'] == 1?"Super Admin":"";
                //         }
                        
                        
                //         break;

                // }
            }

            $token = bin2hex(random_bytes(16));

            $sql = "UPDATE user
                    SET last_login = NOW()
                    ,token = '" . $token . "'    
                    WHERE id = '{$result['id']}'";

            $query = $db->Query($sql);
            $_SESSION["token"] = $token;

if ($result['admin'] == 1) {
    $status_backend = '1';
    $_SESSION["back_end_permissions"] = '1';
}

    echo json_encode(array('status' => '0', 'message' => $_SESSION["admin"].'ยินดีต้อนรับ'.$result['admin']));

} else {
    echo json_encode(array('status' => '1', 'message' => 'รหัสผ่านไม่ถูกต้อง'));
}


 }


?>

