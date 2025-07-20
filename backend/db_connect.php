<?php
// Database connection settings
define('DB_SERVER', 'localhost'); // Usually 'localhost' for XAMPP
define('DB_USERNAME', 'root');   // Default XAMPP MySQL username
define('DB_PASSWORD', '');       // Default XAMPP MySQL password (empty)
define('DB_NAME', 'todo_app_db'); // The name of the database you just created

/* Attempt to connect to MySQL database */
$link = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Check connection
if($link->connect_error){
    die("ERROR: Could not connect to the database. " . $link->connect_error);
}
// Optional: Set character set for proper UTF-8 handling
$link->set_charset("utf8mb4");
?>