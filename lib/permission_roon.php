<?php
  //error_reporting(E_ALL & ~E_NOTICE);
  require_once 'connDB.php';
  require_once 'service.php';
  $db = new DB();

  $task_view = isset($_SESSION['task_view']) ?$_SESSION['task_view']:null;
  $task_authen = isset($_SESSION['task_authen'])?$_SESSION['task_authen']:null;
  $permissions = isset($_SESSION['permissions'])?$_SESSION['permissions']:null;

  $url = $_SERVER["SERVER_NAME"] . $_SERVER["REQUEST_URI"];
$cut_url = explode('/', $url);

$num_fo = count($cut_url) - 2;
$num_fi = count($cut_url) - 1;

$folder = $cut_url[$num_fo];
$file = $cut_url[$num_fi];

//$local = $cut_url[$num_fo] . '/' . $cut_url[$num_fi];
$local = $cut_url[$num_fo];
$local .= isset($cut_url[$num_fi]) && $cut_url[$num_fi] != '' ? '/' . $cut_url[$num_fi] : '';

  $set_cookie = isset($local)? explode("/", $local):null;


  $cut_web_portal = explode("/web_portal/", $_SERVER["REQUEST_URI"]);
  $push_cookie0 = isset($cut_web_portal)? end($cut_web_portal):null;
  
  $push_cookie = isset($set_cookie)? $set_cookie[0].'/'.'front-manage.php':null;
  $push_cookie1 = isset($set_cookie)? $set_cookie[0].'/'.'front_manage.php':null;
  $push_cookie2 = isset($set_cookie)? $set_cookie[0].'/'.'index.php':null;
  
  $cut_web_portal1 = explode("/",end($cut_web_portal));
  $push_cookie3 = isset($cut_web_portal1)? $cut_web_portal1[0]:null;



 
if(isset($_SESSION['admin']) && $_SESSION['admin'] != ''){
   


    if ($_SESSION['admin'] == '0' || $_SESSION['admin'] == '2') { //---User
     
        if (!isset($id_cookie)) {
        

            $str_local = 'SELECT id,link_menu,type FROM menu_system WHERE link_menu LIKE "'.$push_cookie0.'%"'; #อยู่ในไฟล์ menu
            $query_local = $db->Query($str_local);
            $result_local = mysqli_fetch_array($query_local);
            if (!isset($result_local)) {
            

                // $push_cookie = $db->clear($push_cookie);
                // $str_local = 'SELECT id,link_menu,type FROM menu_system WHERE link_menu = "'.$push_cookie.'"'; #อยู่ในไฟล์ menu
                // $query_local = $db->Query($str_local);
                // $result_local = mysqli_fetch_array($query_local);
                // if (!isset($result_local)) {
                //     $str_local = 'SELECT id,link_menu,type FROM menu_system WHERE link_menu = "'.$push_cookie1.'"'; #อยู่ในไฟล์ menu
                //     $query_local = $db->Query($str_local);
                //     $result_local = mysqli_fetch_array($query_local);
                //         if (!isset($result_local)) {
                //             $str_local = 'SELECT id,link_menu,type FROM menu_system WHERE link_menu = "'.$push_cookie2.'"'; #อยู่ในไฟล์ menu
                //             $query_local = $db->Query($str_local);
                //             $result_local = mysqli_fetch_array($query_local);
                    
                        if (!isset($result_local)) {
                            $str_local = 'SELECT count(id) AS num FROM menu_system WHERE link_menu LIKE "'.$push_cookie3.'%"'; #อยู่ในไฟล์ menu
                            $query_local = $db->Query($str_local);
                            $result_local = mysqli_fetch_array($query_local);
                            if($result_local["num"] > 1){
                                if($push_cookie3 == "mod_MPC_All"){
                                    if($_SESSION["department_name_fix"] == "SMD"){
                                        $push_cookie4 = "mod_MPC_All/index_SMD.php";
                                    }else if($_SESSION["department_name_fix"] == "PPD"){
                                        $push_cookie4 = "mod_MPC_All/index_PPD.php";
                                    }else if($_SESSION["department_name_fix"] == "PCD"){
                                        $push_cookie4 = "mod_MPC_All/index_PCD.php";
                                    }else{
                                        $push_cookie4 = "";
                                    }
                                    if($push_cookie4 != ''){
                                        $str_local = 'SELECT id,link_menu,type FROM menu_system WHERE link_menu LIKE "'.$push_cookie4.'%"'; #อยู่ในไฟล์ menu
                                        $query_local = $db->Query($str_local);
                                        $result_local = mysqli_fetch_array($query_local);
                                    }
                                }else{
                                    $str_local = 'SELECT id,link_menu,type FROM menu_system WHERE link_menu LIKE "'.$push_cookie3.'%"'; #อยู่ในไฟล์ menu
                                    $query_local = $db->Query($str_local);
                                    $result_local = mysqli_fetch_array($query_local);
                                }
                                
                            }else{
                                $str_local = 'SELECT id,link_menu,type FROM menu_system WHERE link_menu LIKE "'.end($cut_web_portal).'%"'; #อยู่ในไฟล์ menu
                                $query_local = $db->Query($str_local);
                                $result_local = mysqli_fetch_array($query_local);
                            }
                            
                            
                        }
                    
                            
                //         }
                        
                // }


            }

            

            
            if (isset($result_local)) {
               
                $task = searchByValue($result_local['id'], $permissions);
                $task1 = searchByValue($result_local['id'], $permissions);
                $button_manage = isset($task)?'':'display:none';
            
                if (isset($task)) { 
                   
                    $key = array_search($result_local['id'], $task);
                    $auth = $task["permissions"];
                    $auth = str_replace(' ', '', trim($auth));
                    $arrAuth = explode(",", $auth);
                    $button_view = ((array_search('1', $arrAuth)) === false)?'display:none':'';
                    $button_create = ((array_search('2', $arrAuth)) === false)?'display:none':'';
                    $button_update = ((array_search('3', $arrAuth)) === false)?'display:none':'';
                    $button_delete = ((array_search('4', $arrAuth)) === false)?'display:none':'';
                    $input_read = ((array_search('1', $arrAuth)) === false)?'readonly':'';
                    $image_click = ((array_search('1', $arrAuth)) === false)?'':'img-upload';
                    $button_download = ((array_search('5', $arrAuth)) === false)?'display:none':'';
                    $button_upload = ((array_search('6', $arrAuth)) === false)?'display:none':'';
                    $button_print = ((array_search('7', $arrAuth)) === false)?'display:none':'';
                    $button_approval = ((array_search('8', $arrAuth)) === false)?'display:none':'';
                    
    
                    $task_manage = 'display:none;';
                    $task_alert = '';
                    $button_delete_all = 'display:none;';
                } else {
                    
                    $button_view = 'display:none';
                    $button_create = 'display:none';
                    $button_update = 'display:none';
                    $button_delete = 'display:none';
                    $input_read = 'readonly';
                    $image_click = '';
                    $button_download = 'display:none';
                    $button_upload = 'display:none';
                    $button_print = 'display:none';
                    $button_approval = 'display:none';
    
                    $task_manage = 'display:none;';
                    $task_alert = '';
                    $button_delete_all = 'display:none;';
                }
            } else {
                
                $button_manage = 'display:none';
                $button_view = 'display:none';
                $button_create = 'display:none';
                $button_update = 'display:none';
                $button_delete = 'display:none';
                $input_read = 'readonly';
                $image_click = '';
                $button_download = 'display:none';
                $button_upload = 'display:none';
                $button_print = 'display:none';
                $button_approval = 'display:none';

                $task_manage = 'display:none;';
                $task_alert = '';
                $button_delete_all = 'display:none;';
            }
        } else {
           
            $task = searchByValue($id_cookie, $permissions);
            $button_manage = isset($task)?'':'display:none';
            
            if (isset($task)) {
                
                $key = array_search($id_cookie, $task);
                $auth = $task["permissions"];
                $auth = str_replace(' ', '', trim($auth));
                $arrAuth = explode(",", $auth);
                $button_view = ((array_search('1', $arrAuth)) === false)?'display:none':'';
                $button_create = ((array_search('2', $arrAuth)) === false)?'display:none':'';
                $button_update = ((array_search('3', $arrAuth)) === false)?'display:none':'';
                $button_delete = ((array_search('4', $arrAuth)) === false)?'display:none':'';
                $input_read = ((array_search('1', $arrAuth)) === false)?'readonly':'';
                $image_click = ((array_search('1', $arrAuth)) === false)?'':'img-upload';
                $button_download = ((array_search('5', $arrAuth)) === false)?'display:none':'';
                $button_upload = ((array_search('6', $arrAuth)) === false)?'display:none':'';
                $button_print = ((array_search('7', $arrAuth)) === false)?'display:none':'';
                $button_approval = ((array_search('8', $arrAuth)) === false)?'display:none':'';

                $task_manage = 'display:none;';
                $task_alert = '';
                $button_delete_all = 'display:none;';
            } else {
             
                $button_manage = 'display:none';
                $button_view = 'display:none';
                $button_create = 'display:none';
                $button_update = 'display:none';
                $button_delete = 'display:none';
                $input_read = 'readonly';
                $image_click = '';
                $button_download = 'display:none';
                $button_upload = 'display:none';
                $button_print = 'display:none';
                $button_approval = 'display:none';

                $task_manage = 'display:none;';
                $task_alert = '';
                $button_delete_all = 'display:none;';
            }
        }


    } 
    if (isset($_SESSION['admin']) && $_SESSION['admin'] == '1') { //--Admin
     
        $button_manage = '';
        $button_view = '';
        $button_create = '';
        $button_update = '';
        $button_delete = '';
        $input_read = '';
        $image_click = 'img-upload';
        $button_download = '';
        $button_upload = '';
        $button_print = '';
        $button_approval = '';

        $task_manage = '';
        $task_alert = 'display:none;';
        $button_delete_all = '';
    }

}else{
   
        $button_manage = 'display:none;';
        $button_view = 'display:none;';
        $button_create = 'display:none;';
        $button_update = 'display:none;';
        $button_delete = 'display:none;';
        $input_read = 'display:none;';
        $image_click = 'display:none;';
        $button_download = 'display:none;';
        $button_upload = 'display:none;';
        $button_print = 'display:none;';
        $button_approval = 'display:none;';

        $task_manage = 'display:none;';
        $task_alert = 'display:none;';
        $button_delete_all = 'display:none;';
    }

  
  /*function searchByValue($id, $array)
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
  }*/
?>


