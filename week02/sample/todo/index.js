document.addEventListener("DOMContentLoaded", function() {
  var taskInput = document.getElementById("task-input");
  var addButton = document.getElementById("add-button");
  var taskList = document.getElementById("task-list");

  addButton.addEventListener("click", function() {
    var taskText = taskInput.value;
    if (taskText !== "") {
      var taskItem = document.createElement("li");
      var taskTextElement = document.createElement("span");
      taskTextElement.textContent = taskText;
      var deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";

      taskItem.classList.add("task-item");
      taskItem.appendChild(taskTextElement);
      taskItem.appendChild(deleteButton);

      taskList.appendChild(taskItem);

      taskInput.value = "";
    }
  });

  taskList.addEventListener("click", function(event) {
    if (event.target.tagName === "BUTTON") {
      var taskItem = event.target.parentElement;
      taskList.removeChild(taskItem);
    }
  });
});
