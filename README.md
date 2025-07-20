# Modern To-Do List Application

A full-stack, responsive To-Do List application built with a modern user interface and persistent data storage using PHP and MySQL. This application allows users to add, mark as complete/incomplete, and delete tasks, with all changes saved to a database.



## 🚀 Features

* **Add New Tasks:** Quickly add new to-do items to your list.
* **Mark as Complete/Incomplete:** Toggle the completion status of tasks.
* **Delete Tasks:** Permanently remove tasks from your list.
* **Persistent Storage:** All tasks are saved to a MySQL database, ensuring your data is retained even after closing the browser.
* **Responsive Design:** Adapts seamlessly to various screen sizes (desktops, tablets, mobile phones).
* **Clean and Intuitive UI:** Modern design for a smooth user experience.
* **RESTful API Backend:** A PHP-based API handles all data interactions with the database.

---

## 🛠️ Technologies Used

**Frontend:**
* **HTML5:** Structure of the web application.
* **CSS3:** Styling and responsiveness (flexbox, media queries, CSS variables).
* **JavaScript (ES6+):** Dynamic behavior, DOM manipulation, and asynchronous communication with the backend using the `fetch` API.
* **Font Awesome:** For icons (e.g., checkmark, trash).

**Backend:**
* **PHP:** Server-side scripting language for the API.
* **MySQL:** Relational database management system for persistent data storage.

**Development Environment:**
* **XAMPP:** Local server environment (Apache, MySQL, PHP).

---

## 💻 Local Setup & Installation

To run this application on your local machine, you will need XAMPP installed.

1.  **Download and Install XAMPP:**
    If you don't have XAMPP, download it from [apachefriends.org](https://www.apachefriends.org/index.html) and follow the installation instructions for your operating system.

2.  **Start XAMPP Services:**
    Open your XAMPP Control Panel and start the **Apache** and **MySQL** modules. Ensure their status indicates they are running.

3.  **Clone the Repository (or place files):**
    Place all the project files (`index.html`, `style.css`, `script.js`, `backend/`, etc.) into your XAMPP's web server document root, typically `C:\xampp\htdocs\` (on Windows) or `/Applications/XAMPP/htdocs/` (on macOS).
    * Example: Create a folder `your_todo_app` inside `htdocs` and place all your project files there.
        `C:\xampp\htdocs\your_todo_app\`
        `C:\xampp\htdocs\your_todo_app\index.html`
        `C:\xampp\htdocs\your_todo_app\style.css`
        `C:\xampp\htdocs\your_todo_app\script.js`
        `C:\xampp\htdocs\your_todo_app\backend\db_connect.php`
        `C:\xampp\htdocs\your_todo_app\backend\tasks.php`

4.  **Database Setup:**
    * Open your web browser and go to `http://localhost/phpmyadmin/`.
    * Click on the "New" button on the left sidebar to create a new database.
    * Name the database `todo_app_db`.
    * Select the `todo_app_db` database from the left sidebar.
    * Click on the "SQL" tab.
    * Paste the following SQL query into the text area and click "Go" to create the `tasks` table:

        ```sql
        CREATE TABLE tasks (
            id INT(11) AUTO_INCREMENT PRIMARY KEY,
            text VARCHAR(255) NOT NULL,
            is_completed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        ```

5.  **Configure `db_connect.php`:**
    * Open `your_todo_app/backend/db_connect.php`.
    * Ensure the database connection details match your XAMPP MySQL setup. Default XAMPP settings usually work without changes:
        ```php
        <?php
        define('DB_SERVER', 'localhost');
        define('DB_USERNAME', 'root');
        define('DB_PASSWORD', ''); // No password by default for XAMPP root user
        define('DB_NAME', 'todo_app_db');

        // Attempt to connect to MySQL database
        $link = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

        // Check connection
        if ($link->connect_error) {
            die("Connection failed: " . $link->connect_error);
        }
        ?>
        ```

6.  **Configure `script.js` API URL:**
    * Open `your_todo_app/script.js`.
    * Locate the `API_URL` constant (around line 12).
    * **Crucially, ensure this URL includes the correct port if your local server is running on a non-standard port (e.g., 8081).** If your frontend is served from `http://localhost:8081/your_todo_app/`, then your API URL must also reflect that port.
        ```javascript
        // IMPORTANT: Adjust this URL to match your XAMPP setup and port
        const API_URL = 'http://localhost:8081/your_todo_app/backend/tasks.php';
        // If your frontend is accessed via http://localhost/your_todo_app/, then use:
        // const API_URL = 'http://localhost/your_todo_app/backend/tasks.php';
        ```
    * **Save all changes.**

7.  **Access the Application:**
    * Open your web browser.
    * Navigate to the URL where your `index.html` is served. Based on the common setup, this would be:
        `http://localhost:8081/your_todo_app/` (if your server uses port 8081 for frontend files)
        OR
        `http://localhost/your_todo_app/` (if your server uses the default port 80 for frontend files)

You should now see the To-Do List application. Try adding, completing, and deleting tasks to test its functionality!

---

## 💡 How it Works

The application operates as a classic client-server model:

1.  **Frontend (Browser - HTML, CSS, JavaScript):**
    * Displays the user interface.
    * Captures user input (new tasks) and actions (complete, delete).
    * Uses **JavaScript's `fetch` API** to send HTTP requests (GET, POST, PATCH, DELETE) to the PHP backend.
    * Receives JSON responses from the backend and updates the UI accordingly.

2.  **Backend (PHP API - `tasks.php`):**
    * Receives HTTP requests from the frontend.
    * Parses the request method (GET, POST, PATCH, DELETE) and extracts any necessary data (task text, task ID).
    * Connects to the **MySQL database** using `db_connect.php`.
    * Executes appropriate SQL queries (SELECT, INSERT, UPDATE, DELETE) to interact with the `tasks` table.
    * Returns data or status codes to the frontend in **JSON format**.
    * Includes **CORS (Cross-Origin Resource Sharing)** headers to allow the frontend to communicate with the backend across different origins/ports during development.

3.  **Database (MySQL):**
    * Stores all task data persistently. Each task has an `id`, `text`, `is_completed` status, and `created_at` timestamp.

---

## 🤝 Contributing

Feel free to fork this repository, suggest features, or contribute improvements!

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE). (You might want to create a separate `LICENSE` file in your root folder with the full MIT license text).

---

**Example `LICENSE` file content (create `your_todo_app/LICENSE`):**
