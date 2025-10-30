<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
  }

require_once  "../lib/connDB.php";
require_once  "../lib/service.php";



if(isset($_POST["form"])){
    if($_POST["form"] == 'chk_username'){
        che_username();
    }else if($_POST["form"] == 'chk_email_name'){
        chk_email_name();
    }else if($_POST["form"] == 'chk_id_em'){
        chk_id_em();
    }

}

function chk_id_em(){
    $con = new DB();
    $data = $_POST["data"];
    $sql = "SELECT COUNT(`id`) AS num FROM `mod_employee` WHERE `id` = '".$data."' ";
    if(isset($_POST["id"])){
        $id = $_POST["id"];
        $sql .= " AND `id` != '".$id."' ";
    }
    $query = $con->query($sql) or die ("Error Query [".$sql."]");
    $result = $query->fetch_assoc();
    header('Content-Type: appplication/json');
    echo json_encode(array('num' => $result["num"]));
}


function chk_email_name(){
    $con = new DB();
    $data = $_POST["data"];
    $sql = "SELECT COUNT(`id`) AS num FROM `user` WHERE `email_name` = '".$data."' ";
    if(isset($_POST["id"])){
        $id = $_POST["id"];
        $sql .= " AND `id` != '".$id."' ";
    }
    $query = $con->query($sql) or die ("Error Query [".$sql."]");
    $result = $query->fetch_assoc();
    header('Content-Type: appplication/json');
    echo json_encode(array('num' => $result["num"]));
}


function che_username_php(){
    $con = new DB();
    $data = $_POST["data"];
    $sql = "SELECT COUNT(`id`) AS num FROM `user` WHERE `username` = '".$data."' ";
    $query = $con->query($sql) or die ("Error Query [".$sql."]");
    $result = $query->fetch_assoc();
    return $result["num"];
}

function che_username(){
    $con = new DB();
    $data = $_POST["data"];
    $sql = "SELECT COUNT(`id`) AS num FROM `user` WHERE `username` = '".$data."' ";
    if(isset($_POST["id"])){
        $id = $_POST["id"];
        $sql .= " AND `id` != '".$id."' ";
    }
    $query = $con->query($sql) or die ("Error Query [".$sql."]");
    $result = $query->fetch_assoc();
    header('Content-Type: appplication/json');
    echo json_encode(array('num' => $result["num"]));
}

function setMD5()
{

    $passuniq = uniqid();
    $passmd5 = md5($passuniq);

    $sumlenght = strlen($passmd5); #num passmd5

    $letter_pre = chr(rand(97, 122)); #set char for prefix

    $letter_post = chr(rand(97, 122)); #set char for postfix

    $letter_mid = chr(rand(97, 122)); #set char for middle string

    $num_rand = rand(0, $sumlenght); #random for cut passmd5

    $cut_pre = substr($passmd5, 0, $num_rand); #cutmd5 start 0 stop $numrand
    $setmid = $cut_pre . $letter_mid; #set pre string + char middle

    $cut_post = substr($passmd5, $num_rand, $sumlenght + 1);

    $set_modify_md5 = $letter_pre . $setmid . $cut_post . $letter_post;
    return $set_modify_md5;
}

function save_file($name_input_file, $prefix, $id_ref, $directory, $id_file_old){
    $con = new DB();
    if (isset($_FILES[$name_input_file]) && $_FILES[$name_input_file]['name'] != '') {
       // echo $_FILES[$name_input_file]['name'];
       
            $fieldname = $_FILES[$name_input_file]['name'];
            // Get filename.
            $filename = explode(".", $_FILES[$name_input_file]['name']);
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $tmpName = $_FILES[$name_input_file]['tmp_name'];

            // Get mime type.
            $mimeType = finfo_file($finfo, $tmpName);

            // Get extension. You must include fileinfo PHP extension.
            $extension = end($filename);

            // Allowed extensions.
           // $AllowedExts = array("jpeg", "jpg", "png");
            $allowedExts = array("jpeg","jpg","png");

            // Allowed mime types.
            $allowedMimeTypes = array("image/jpeg","image/jpg","image/png");

            // Validate image.
            if (!in_array(strtolower($mimeType), $allowedMimeTypes) || !in_array(strtolower($extension), $allowedExts)) {
                //echo 'type ไม่ผ่าน';
                //return "ไม่สำเร็จ เพราะ Type file ไม่ถูกต้อง (gif, jpeg, jpg, png)";
                $newname_video = "";
                $tmp_size = '';
            } else {
                $namefile = $_FILES[$name_input_file]["name"];
                $sur = strrchr($namefile, "."); //ตัดนามสกุลไฟล์เก็บไว้
                $name = $prefix."-".(Date("dmy-His-U").rand('1000', '9999').$sur); //ผมตั้งเป็น วันที่_เวลา.นามสกุล
                $target = $directory.$name;
                $newname = $name;

                if (file_exists($target)) {
                    $oldname = pathinfo($name, PATHINFO_FILENAME);
                    $ext = pathinfo($name, PATHINFO_EXTENSION);
                    $newname = $oldname;
                    do {
                        $r = rand(1000, 9999);
                        $newname = $oldname."-".$r.".$ext";
                        
                        $target = $directory.$newname;
                    } while (file_exists($target));
                }

                $newname = $newname;
                $tmp_size = $_FILES[$name_input_file]["size"];
                copy($_FILES[$name_input_file]["tmp_name"], iconv('UTF-8', 'windows-874', $directory.$newname));

                // echo $newname."<br>";
                

                


                if($id_file_old != ''){
                    $sql_file = "SELECT `id`,`path`,`name_file`,`prefix` FROM `parth_file` WHERE `id_ref` = '".$id_ref."' AND `prefix` = '".$prefix."' AND  `delete_date` IS null";
                    $query_file = $con->query($sql_file);
                    $result_file = $query_file->fetch_assoc();

                    if($result_file["prefix"] == 'DS'){
                        rename_file_del($result_file["path"],$result_file["name_file"]);
                    }else{
                        unlink($result_file["path"].$result_file["name_file"]);
                    }
                    

                    $sql = "UPDATE `parth_file` SET `delete_id`='".$_SESSION['user_id']."',`delete_date`=NOW() WHERE `id` = '".$result_file["id"]."' "; 
                    $query = $con->query($sql) or die ("Error Query [".$sql."]");

                }
                
                


                $sql_item = "INSERT INTO `parth_file`(`path`, `name_file`, `prefix`, `id_ref`, `create_id`, `create_date`)
                 VALUES 
                 ('".$directory."','".$newname."','".$prefix."','".$id_ref."','".$_SESSION['user_id']."',NOW())"; 
                $query_item = $con->query($sql_item) or die ("Error Query [".$sql_item."]");
                

            }
        
    } else {
        //echo "ไม่สำเร็จ เพราะไม่มีไฟล์";
        $newname = "";
        $tmp_size = '';
        if($id_file_old == ''){
            $sql = "UPDATE `parth_file` SET `delete_id`='".$_SESSION['user_id']."',`delete_date`=NOW() WHERE `id` = '".$id_file_old."' "; 
            $query = $con->query($sql) or die ("Error Query [".$sql."]");

            $sql_file = "SELECT `path`,`name_file`,`prefix` FROM `parth_file` WHERE `id` = '".$id_file_old."'";
            $query_file = $con->query($sql_file);
            $result_file = $query_file->fetch_assoc();

            if(isset($result_file["prefix"]) && $result_file["prefix"] !=''){

                if($result_file["prefix"] == 'DS'){
                    rename_file_del($result_file["path"],$result_file["name_file"]);
                }else{
                    unlink($result_file["path"].$result_file["name_file"]);
                }
            }
            
        }
    }
}

?>