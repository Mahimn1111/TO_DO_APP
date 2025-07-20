document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Get DOM Elements (References) ---
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const emptyState = document.querySelector('.empty-state');

    // --- Configuration: Backend API URL ---
    // IMPORTANT: Adjust this URL to match your XAMPP setup
    // If your project folder is 'your_todo_app' inside htdocs, the path would be:
    const API_URL = 'http://localhost:8081/your_todo_app/backend/tasks.php';

    // --- 2. Function to Update Empty State Visibility ---
    const updateEmptyState = () => {
        if (taskList.children.length === 0) {
            emptyState.style.display = 'block'; // Show if no tasks
        } else {
            emptyState.style.display = 'none';  // Hide if tasks exist
        }
    };

    // --- 3. Function to Create a New Task Element (for DOM) ---
    // This function now accepts a 'task' object directly from the backend,
    // which includes 'id', 'text', and 'is_completed' properties.
    const createTaskElement = (task) => {
        const li = document.createElement('li'); // Create a new <li> element
        li.className = 'task-item'; // Assign the base class for styling
        li.dataset.taskId = task.id; // Store the database ID on the DOM element for easy access (e.g., for updates/deletes)

        if (task.is_completed) {
            li.classList.add('completed'); // Add 'completed' class if the task is marked as such
        }

        li.innerHTML = `
            <span class="task-text">${task.text}</span>
            <div class="task-actions">
                <button class="complete-btn" title="Mark Complete"><i class="fas fa-check"></i></button>
                <button class="delete-btn" title="Delete Task"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;

        // --- Attach Event Listeners to New Task Buttons (Complete & Delete) ---

        // Complete Button Listener
        li.querySelector('.complete-btn').addEventListener('click', () => {
            const taskId = li.dataset.taskId; // Get the task ID from the data attribute
            const currentStatus = li.classList.contains('completed'); // Check the current UI completion status
            const newStatus = !currentStatus; // Toggle the status (true if was false, false if was true)

            fetch(`${API_URL}/${taskId}`, { // Send a PATCH request to the backend API with the task ID
                method: 'PATCH', // Use PATCH for partial updates
                headers: {
                    'Content-Type': 'application/json', // Inform the backend we're sending JSON
                },
                body: JSON.stringify({ is_completed: newStatus }), // Send the new completion status
            })
            .then(response => {
                if (!response.ok) { // Check if the HTTP response indicates an error (e.g., 4xx, 5xx)
                    // Attempt to parse and throw a more specific error if the backend sends JSON error details
                    return response.json().then(errorData => {
                        throw new Error(`Failed to update task: ${errorData.message || response.statusText}`);
                    });
                }
                return response.json(); // Parse the JSON response from the backend (should return updated task data)
            })
            .then(updatedTask => {
                // Only update the UI if the backend request was successful
                li.classList.toggle('completed', updatedTask.is_completed); // Update class based on backend's response
                console.log('Task updated successfully:', updatedTask);
            })
            .catch(error => {
                console.error('Error updating task:', error);
                alert('Could not update task. Please try again.'); // Provide user feedback
            });
        });

        // Delete Button Listener
        li.querySelector('.delete-btn').addEventListener('click', () => {
            const taskId = li.dataset.taskId; // Get the task ID from the data attribute

            fetch(`${API_URL}/${taskId}`, { // Send a DELETE request to the backend API with the task ID
                method: 'DELETE',
            })
            .then(response => {
                if (response.ok) { // Check if the HTTP response is successful (200-299 range, including 204 No Content)
                    li.remove(); // Remove the task element from the DOM
                    updateEmptyState(); // Re-evaluate and update the empty state message
                    console.log('Task deleted successfully:', taskId);
                } else {
                    // If response is not ok, try to read error message from backend
                    return response.json().then(errorData => {
                        throw new Error(`Failed to delete task: ${errorData.message || response.statusText}`);
                    });
                }
            })
            .catch(error => {
                console.error('Error deleting task:', error);
                alert('Could not delete task. Please try again.'); // Provide user feedback
            });
        });

        return li; // Return the created <li> element for appending to the list
    };

    // --- 4. Function to Load Tasks from Backend (called on page load) ---
    const loadTasks = () => {
        fetch(API_URL) // Send a GET request to fetch all tasks from the backend
            .then(response => {
                if (!response.ok) { // Check if the network response was successful
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json(); // Parse the JSON data from the response
            })
            .then(tasks => {
                taskList.innerHTML = ''; // Clear any existing tasks in the DOM (important for initial load)
                tasks.forEach(task => { // Loop through each task received from the backend
                    const newTaskElement = createTaskElement(task); // Create a DOM element for the task
                    taskList.appendChild(newTaskElement); // Append the task element to the list
                });
                updateEmptyState(); // After loading, check and update the empty state message
            })
            .catch(error => {
                console.error('Error loading tasks:', error);
                alert('Could not load tasks. Please check your backend server and network connection.'); // Inform the user
            });
    };

    // --- 5. Event Listener for "Add Task" Button Click ---
    addTaskBtn.addEventListener('click', () => {
        const taskText = taskInput.value.trim(); // Get the input value, removing leading/trailing whitespace
        if (taskText !== '') { // Only proceed if the input is not empty
            fetch(API_URL, { // Send a POST request to the backend to add a new task
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Inform the backend we're sending JSON
                },
                body: JSON.stringify({ text: taskText }), // Convert the JavaScript object to a JSON string
            })
            .then(response => {
                if (!response.ok) { // Check for successful HTTP status (e.g., 200, 201)
                    return response.json().then(errorData => {
                        throw new Error(`Failed to add task: ${errorData.message || response.statusText}`);
                    });
                }
                return response.json(); // Parse the JSON response from the backend (should contain the new task with its ID)
            })
            .then(newTaskData => {
                const newTask = createTaskElement(newTaskData); // Create a new DOM element using the data from the backend
                taskList.prepend(newTask); // Add the new task to the top of the list (better UX for new items)
                taskInput.value = ''; // Clear the input field
                updateEmptyState(); // Check and update the empty state message
            })
            .catch(error => {
                console.error('Error adding task:', error);
                alert('Could not add task. Please try again.'); // Provide user feedback
            });
        }
    });

    // --- 6. Event Listener for "Enter" Key Press in Input Field ---
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') { // If the Enter key is pressed
            addTaskBtn.click(); // Programmatically trigger the click event on the add button
        }
    });

    // --- 7. Initial Load of Tasks when the page is ready ---
    // This is the first thing that happens after the DOM is fully loaded.
    loadTasks();
});