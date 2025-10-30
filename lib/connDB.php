<?php

class DB
{
    public $objConnect = null;
    public function __construct()
    {
        include_once "db.php";

        $this->Connect();
    }

    public function __destruct()
    {
        $this->Close();
    }
    
    public function Connect()
    {
        if ($this->objConnect == null) {
            $this->objConnect =
            new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE, DB_PORT);

            if ($this->objConnect->connect_errno) {
                echo "Error MySQLi: (" . $this->objConnect->connect_errno
                    . ") " . $this->objConnect->connect_error;
                exit();
            }
            $this->objConnect->set_charset("utf8");
            date_default_timezone_set("Asia/Bangkok");
        }
    }

    public function Query($qry)
    {
        $result = null;
        try {
            $this->Connect();
            $result = isset($qry)?$this->objConnect->query($qry):null;
            if (!$result) {
                throw new Exception(mysqli_error($this->objConnect) . " :: " .$qry);
            }
        } catch (Exception $ex) {
            $this->console_log($ex->getMessage());
        }

        return $result;
    }

    public function QueryFetchArray($qry)
    {
        $row = null;
        try {
            $result = $this->Query($qry);
            if (!$result) {
                throw new Exception(mysqli_error($this->objConnect). " :: " .$qry);
            }
            $row = mysqli_fetch_array($result, MYSQLI_ASSOC);
        } catch (Exception $ex) {
            $this->console_log($ex->getMessage());
        }

        return $row;
    }

    public function MultipleQueries($qry)
    {
        $result = null;
        try {
            $this->Connect();
            $result = $this->objConnect->multi_query($qry);
        } catch (Exception $ex) {
            $this->console_log($ex->getMessage());
        }
        return $result;
    }

    public function Close()
    {
        if ($this->objConnect != null) {
            $this->objConnect->close();
        }
    }

    public function clear($text)
    {
        $text = trim($text);
        if (get_magic_quotes_gpc()) {  // prevents duplicate backslashes
            $text = stripslashes($text);
        }
        $text = htmlspecialchars($text);
        $text = strip_tags($text);
        return $this->objConnect->real_escape_string($text);
    }

    public function lastInsertID()
    {
        return $this->objConnect->insert_id;
    }

    public function count($fieldname, $tablename, $where = "")
    {
        $sql = "SELECT count(" . $fieldname . ") FROM "
            . $tablename . " " . $where;

        $result = $this->objConnect->query($sql);
        $count = 0;
        if ($result) {
            while ($row = mysqli_fetch_array($result)) {
                $count = $row[0];
            }
        }
        return $count;
    }

    public function console_log($output, $with_script_tags = true)
    {
        $js_code = 'console.log(' . json_encode($output, JSON_HEX_TAG) .
            ');';
        if ($with_script_tags) {
            $js_code = '<script>' . $js_code . '</script>';
        }
        echo $js_code;
    }
    
    public function Execute($sql, $variables, $data)
    {
        try {
            $param = implode(",", $data);
            $this->Connect();
            $stmt = $this->objConnect->prepare($param);
            $stmt->bind_param($variables, $data);
            $result = $stmt->execute();
        } catch (Exception $ex) {
            $this->console_log($ex->getMessage());
        }
        return $result;
    }
    
    public function Select($sql, $variables, $data)
    {
        $row = null;
        try {
            $param = implode(",", $data);
            $this->Connect();
            $stmt = $this->objConnect->prepare($sql);
            $stmt->bind_param($variables, $param);
            $stmt->execute();
            $result = $stmt->get_result();
        } catch (Exception $ex) {
            $this->console_log($ex->getMessage());
        }
        return $row;
    }
    
    public function selectFetch($sql, $variables, $data)
    {
        $row = null;
        try {
            $param = implode(",", $data);
            $this->Connect();
            $stmt = $this->objConnect->prepare($sql);
            $stmt->bind_param($variables, $param);
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
        } catch (Exception $ex) {
            $this->console_log($ex->getMessage());
        }
        return $row;
    }
    
    public function ExecuteAffected($sql, $variables, $data)
    {
        $result = 0;
        try {
            $param = implode(",", $data);
            $this->Connect();
            $stmt = $this->objConnect->prepare($sql);
            $stmt->bind_param($variables, $param);
            $stmt->execute();
            $result = $stmt->affected_rows;
            if ($result == 0) {
                throw new Exception($stmt -> error);
            }
        } catch (Exception $ex) {
            $this->console_log($ex->getMessage());
        }
        return $result;
    }
}

/*
===============How to use ======================
include_once 'connect.php';
$db = new DB();

$id = $db->clear($_POST['id']);

#Non-prepared#
$sql = "SELECT * FROM mod_employee WHERE id_employee ='$id' LIMIT 1;";
$result = $db->Query($sql);

#Prepared#
Type of Valiable :
i = integer
s = string
b = blob
d = double

$sql = "SELECT * FROM mod_employee WHERE id_employee =? LIMIT 1;";
$variables = "s";
$data = [$id];
$result = $db->Execute($sql,$variables,$data);
*/
