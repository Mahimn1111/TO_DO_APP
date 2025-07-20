<?php
// Include the database connection file
require_once 'db_connect.php';

// Set CORS headers to allow requests from your frontend
header('Content-Type: application/json'); // Tell the client that the response is JSON
header('Access-Control-Allow-Origin: http://localhost:8081'); // Explicitly allow your frontend's origin
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS'); // Allowed HTTP methods
header('Access-Control-Allow-Headers: Content-Type, Authorization'); // Allowed headers

// Handle preflight OPTIONS requests for CORS (browser sends this before actual request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0); // Exit immediately for OPTIONS request
}

// Get the HTTP method (GET, POST, PUT, DELETE)
$method = $_SERVER['REQUEST_METHOD'];

// Get the raw POST/PUT/PATCH data (for adding/updating)
$input = json_decode(file_get_contents('php://input'), true);

// --- START UPDATED URL PARSING ---
// Get the path part of the URL (e.g., /your_todo_app/backend/tasks.php/123)
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_segments = explode('/', trim($path, '/'));

$id = null;
// Dynamically get the script name (e.g., 'tasks.php')
$tasks_script_name = basename(__FILE__);
$tasks_php_pos = array_search($tasks_script_name, $path_segments);

if ($tasks_php_pos !== false && isset($path_segments[$tasks_php_pos + 1])) {
    // If there's a segment immediately after tasks.php, it's considered the ID
    $id = intval($path_segments[$tasks_php_pos + 1]);
}
// --- END UPDATED URL PARSING ---


// Handle different HTTP methods
switch ($method) {
    case 'GET':
        // Fetch all tasks
        // URL: GET http://localhost:8081/your_todo_app/backend/tasks.php
        $sql = "SELECT id, text, is_completed FROM tasks ORDER BY created_at DESC";
        $result = $link->query($sql);
        $tasks = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $row['is_completed'] = (bool)$row['is_completed']; // Convert 0/1 to boolean
                $tasks[] = $row;
            }
        }
        echo json_encode($tasks);
        break;

    case 'POST':
        // Add a new task
        // URL: POST http://localhost:8081/your_todo_app/backend/tasks.php
        if ($input && isset($input['text'])) {
            $text = $link->real_escape_string($input['text']); // Sanitize input
            $sql = "INSERT INTO tasks (text, is_completed) VALUES ('$text', FALSE)"; // Use FALSE for boolean

            if ($link->query($sql) === TRUE) {
                $newTask = ['id' => $link->insert_id, 'text' => $text, 'is_completed' => false];
                http_response_code(201); // 201 Created
                echo json_encode($newTask);
            } else {
                http_response_code(500); // 500 Internal Server Error
                echo json_encode(['error' => 'Error adding task: ' . $link->error]);
            }
        } else {
            http_response_code(400); // 400 Bad Request
            echo json_encode(['message' => 'Invalid input for creating task.']);
        }
        break;

    case 'PUT': // For full updates, replacing the whole resource
    case 'PATCH': // For partial updates (like toggling complete)
        // Update an existing task
        // URL: PUT/PATCH http://localhost:8081/your_todo_app/backend/tasks.php/{id}
        if ($id !== null && $input) { // Condition simplified
            $set_clauses = [];
            if (isset($input['text'])) {
                $set_clauses[] = "text = '" . $link->real_escape_string($input['text']) . "'";
            }
            if (isset($input['is_completed'])) {
                $is_completed = (int)$input['is_completed']; // Convert boolean to 0 or 1
                $set_clauses[] = "is_completed = $is_completed";
            }

            if (!empty($set_clauses)) {
                $sql = "UPDATE tasks SET " . implode(', ', $set_clauses) . " WHERE id = " . $id;
                if ($link->query($sql) === TRUE) {
                    // Fetch and return the updated task data to ensure frontend has latest state
                    $result = $link->query("SELECT id, text, is_completed FROM tasks WHERE id = " . $id);
                    if ($result && $updatedTask = $result->fetch_assoc()) {
                        $updatedTask['is_completed'] = (bool)$updatedTask['is_completed'];
                        echo json_encode($updatedTask);
                    } else {
                        http_response_code(404); // Not Found if task somehow disappeared
                        echo json_encode(['message' => 'Task not found after update.']);
                    }
                } else {
                    http_response_code(500); // Internal Server Error
                    echo json_encode(['error' => 'Error updating task: ' . $link->error]);
                }
            } else {
                http_response_code(400); // Bad Request
                echo json_encode(['message' => 'No fields to update.']);
            }
        } else {
            http_response_code(400); // Bad Request
            echo json_encode(['message' => 'Invalid request for updating task (missing ID or input).']);
        }
        break;

    case 'DELETE':
        // Delete a task
        // URL: DELETE http://localhost:8081/your_todo_app/backend/tasks.php/{id}
        if ($id !== null) { // Condition simplified
            $sql = "DELETE FROM tasks WHERE id = " . $id;
            if ($link->query($sql) === TRUE) {
                if ($link->affected_rows > 0) {
                    http_response_code(204); // 204 No Content (successful delete with no data returned)
                } else {
                    http_response_code(404); // Not Found if ID didn't exist
                    echo json_encode(['message' => 'Task not found.']);
                }
            } else {
                http_response_code(500); // Internal Server Error
                echo json_encode(['error' => 'Error deleting task: ' . $link->error]);
            }
        } else {
            http_response_code(400); // Bad Request
            echo json_encode(['message' => 'Invalid request for deleting task (missing ID).']);
        }
        break;

    default:
        http_response_code(405); // 405 Method Not Allowed
        echo json_encode(['message' => 'Method Not Allowed']);
        break;
}

// Close the database connection
$link->close();
?>