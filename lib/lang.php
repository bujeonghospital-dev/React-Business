<?php


function lang($th = "",$en = "",$ch = ""){
  if(isset($_SESSION['lang'])){
    switch ($_SESSION['lang']) {
      case 'th':
        return $th;
        break;
      case 'en':
        return $en;
        break;
            case 'ch':
                return $ch;
                break;
    }
  }else{
    return $th;
  }
}


 

function check_cookie_active ($cookie , $lang){ //เทียบค่า ที่ query ว่าเท่ากับ คงที่มั้ย return active
    echo $cookie ;
    if($lang == "th"){
        if ($cookie == "th" ){
            return " btn-success ";
        }else{
            return "";
        }
    }else if ($lang == "en"){
        if ($cookie == "en"){
            return " btn-success ";
        }else{
            return "";
        }
    }
return "";
}

function check_cookie_active_front_end ($cookie , $lang){ //เทียบค่า ที่ query ว่าเท่ากับ คงที่มั้ย return active
    echo $cookie ;
    if($lang == "th"){
        if ($cookie == "th" ){
            return " active_lang ";
        }else{
            return "";
        }
    }else if ($lang == "en"){
        if ($cookie == "en"){
            return " active_lang ";
        }else{
            return "";
        }
    }
return "";
}


function setCookieEmpty($cookie_name , $cookie_value){
    if(!isset($_COOKIE[$cookie_name]) ) {
      // setcookie($cookie_name, $cookie_value, time() + 86400,"/"); // 86400 = 1 day
      setcookie($cookie_name, $cookie_value, time(),"/");

    }
}


?>

