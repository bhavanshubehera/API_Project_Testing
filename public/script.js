const API_URL = "http://localhost:5000/api/tasks";

// Add Task Handler
document.getElementById("task-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();

  if (!title || !description) return;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, completed: false })
    });

    if (!response.ok) {
      throw new Error(`Failed to add task. Status: ${response.status}`);
    }

    // Clear input fields
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";

    // Refresh task list
    loadTasks();
  } catch (err) {
    console.error("Error adding task:", err);
    alert("Failed to add task. See console for details.");
  }
});

// Load All Tasks
async function loadTasks() {
  try {
    const res = await fetch(API_URL);
    const tasks = await res.json();
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = "";

    tasks.forEach(task => {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center";

      li.innerHTML = `
        <div class="${task.completed ? 'completed' : ''}">
          <span class="task-text">${task.title}</span><br />
          <small>${task.description}</small>
        </div>
        <div>
          <button class="btn btn-outline-${task.completed ? 'warning' : 'success'} btn-sm me-2"
            onclick="toggleComplete('${task._id}', ${task.completed})">
            ${task.completed ? '↩️ Mark Incomplete' : '✅ Mark Done'}
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteTask('${task._id}')">🗑️</button>
        </div>
      `;
      taskList.appendChild(li);
    });

    console.log("Fetched tasks:", tasks);
  } catch (err) {
    console.error("Error loading tasks:", err);
    alert("Failed to load tasks.");
  }
}

// Delete Task
async function deleteTask(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Delete failed. Status: ${res.status}`);
    loadTasks();
  } catch (err) {
    console.error("Error deleting task:", err);
    alert("Failed to delete task.");
  }
}

// Toggle Task Completion
async function toggleComplete(id, currentStatus) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !currentStatus })
    });
    if (!res.ok) throw new Error(`Update failed. Status: ${res.status}`);
    loadTasks();
  } catch (err) {
    console.error("Error updating task:", err);
    alert("Failed to update task.");
  }
}

// Load tasks on page load
window.onload = loadTasks;