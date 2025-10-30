<?php  
 
// $serverName_PT = "localhost";  
// $uid_PT = "sa";
// $pwd_PT = "1234567";
$serverName_PT = "192.168.0.44";  
$uid_PT = "dev";
$pwd_PT = "ITD@9999";
$connectionInfo_PT = array("UID" => $uid_PT, "PWD" => $pwd_PT, "Database"=>"TPP_Web_Portal", 
"MultipleActiveResultSets"=>true,"CharacterSet"  => 'UTF-8');  
$conn_MSsql_PT = sqlsrv_connect( $serverName_PT, $connectionInfo_PT);  
if($conn_MSsql_PT){
    
}else{
    echo "Error in statement execution.\n";  
    die( print_r( sqlsrv_errors(), true));  
}


$strSQL = "select [co_num]
,[item]
,[sale_time_PO_cust]
,[sale_status]
,[sale_conf_stock]
,[sale_qty_IO]
,[sale_send_IO_user]
,[sale_send_IO_datetime]
,[sale_remark]
,[PN_recv_IO_user]
,[PN_recv_IO_datetime]
,[PN_paper_stock]
,[PN_paper_PR_num]
,[PN_paper_datetime]
,[PN_paper_PR_send_user]
,[PN_paper_PR_send_datetime]
,[PN_Ink_stock]
,[PN_Ink_PR_num]
,[PN_Ink_datetime]
,[PN_Ink_PR_send_user]
,[PN_Ink_PR_send_datetime]
,[PN_WOS_stock]
,[PN_WOS_PR_num]
,[PN_WOS_datetime]
,[PN_WOS_PR_send_user]
,[PN_WOS_PR_send_datetime]
,[PN_size_instend_send_user]
,[PN_size_instend_send_datetime]
,[PN_size_instend_recv_user]
,[PN_size_instend_recv_datetime]
,[PN_remark]
,[PC_paper_PR_recv_user]
,[PC_paper_PR_recv_datetime]
,[PC_paper_receive_stock]
,[PC_paper_PR_send_user]
,[PC_paper_PR_send_datetime]
,[PC_Ink_PR_recv_user]
,[PC_Ink_PR_recv_datetime]
,[PC_Ink_receive_stock]
,[PC_Ink_PR_send_user]
,[PC_Ink_PR_send_datetime]
,[PC_WOS_PR_recv_user]
,[PC_WOS_PR_recv_datetime]
,[PC_WOS_receive_stock]
,[PC_WOS_PR_send_user]
,[PC_WOS_PR_send_datetime]
,[cos_paper_PR_recv_user]
,[cos_paper_PR_recv_datetime]
,[cos_WOS_PR_recv_user]
,[cos_WOS_PR_recv_datetime]
,[cos_size_instend_recv_user]
,[cos_size_instend_recv_datetime]
,[cos_size_instend_reply_user]
,[cos_size_instend_reply_datetime]
,[create_id]
,[create_date]
,[update_id]
,[update_date]
,[delete_id]
,[delete_date]
FROM [TPP_Web_Portal].[dbo].[PT_MPC] ";
  

// $objQuery =  sqlsrv_query($conn_MSsql_PT, $strSQL);
// while($objResult = sqlsrv_fetch_array($objQuery, SQLSRV_FETCH_ASSOC)){
//     echo  $objResult["co_num"].' '.$objResult["item"];
// }




  
