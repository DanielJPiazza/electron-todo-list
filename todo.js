'use strict';



// ** GLOBAL CONSTS & VARS **

// Requires
const remote = require('electron').remote
const fs = require('fs');

// For CSS & HTML
const removeTaskButtonClass = 'removeTaskButton';
const removeTaskButton = '\u2716';

// Input/output
var userDataArray = fs.readFileSync('userdata.txt').toString().split("\n");

// Error modal handling
const modal = document.querySelector('.modal');
const modalCloseButton = document.querySelector('.modal-close-button');



// ** FUNCTIONS **

function closeWindow() {
    remote.getCurrentWindow().close()
}

function setFocusAddTaskField(){
    document.getElementById('newTaskInput').focus();
}

function removeFocusAddTaskField() {
    document.getElementById('newTaskInput').blur();
}

function createTask(data) {
    // Create new list item and append user input.
    var li = document.createElement('LI');
    var txt = document.createTextNode(data);
    li.appendChild(txt);

    // Toggle 'checked' class on click for new list item.
    li.addEventListener('click', function(e) {
        e.target.classList.toggle('checked');
    });
    
    // Append new list item to task list.
    document.querySelector('UL').appendChild(li);

    // Append remove task button and add remove node event to remove button.
    var span = document.createElement('SPAN');
    txt = document.createTextNode(removeTaskButton);
    span.className = removeTaskButtonClass;
    span.appendChild(txt);
    span.addEventListener('click', function(e) {
        e.target.parentNode.remove();
    });
    li.appendChild(span);
}

// Load user's todo list items from previous session.
// Currently the file is 'userdata.txt' stored in the application root.
function createTaskOnSetup(data) {
    if (data.length === 1 && data[0] === "") {    
        // Add default task if the user's file is empty.
        createTask("Create a new task or delete this one...");
    } else if (data.length === 1) {
        // Avoid calling for loop if only one task.
        createTask(data[0]);
    } else {
        // Pass full array if more than one task.
        for (var i in data) {
            createTask(data[i]);
        }
    }
}

// Create a new list item when 'Add Task' is clicked.
function createTaskFromForm() {
    // Gather user input.
    var inputValue = document.getElementById('newTaskInput').value.trim();

    // Verify user input contains characters other than whitepsace.
    var inputRegex = new RegExp('^\\S');
    if (!inputRegex.test(inputValue)) {
        // If check fails, display error message.
        toggleModal('Tasks must contain text.');
        return false;
    }

    // Create task list item and add to DOM.
    createTask(inputValue);

    // Clear user input field.
    document.getElementById('newTaskInput').value = '';
    
    // Focus on add task field.
    setFocusAddTaskField();
}

// Display error modal with the passed argument.
function toggleModal(message) {     
    document.getElementById('inputErrorMessage').textContent = message;
    modal.classList.toggle('show-modal');
    
    if (modal.classList.contains('show-modal')) {
        removeFocusAddTaskField();
    } else {
        setFocusAddTaskField();
    }
}



// ** OTHER NON-FUNCTION LOGIC **

// Receive window size from main process (IPC) when window is resized.
// Set height of todo list accordingly to avoid main window scrollbar.
require('electron').ipcRenderer.on('async-resize', (event, message) => {
    document.getElementById('todoList').style.height = ((message - 220).toString() + 'px');
});



// ** INITIAL SETUP & NON-FUNCTION EVENT LISTENERS **

// Load user's saved data and populate task list.
createTaskOnSetup(userDataArray);

// Allow 'Enter' key to call createTaskFromForm().
document.getElementById('newTaskInput').addEventListener('keypress', function(e) {
    if (e.which === 13 || e.keyCode === 13) {
      createTaskFromForm();
    }
}, false);

// Allow mouse click on '.modal-close-button' to close error modal.
modalCloseButton.addEventListener('click', function(e) {
    toggleModal(null);
});

// Close error modal if outside is clicked.
modal.addEventListener('click', function(e) {
    if (e.target === modal) {
        toggleModal(null);
    }
});

// Allow 'Escape' key to close error modal.
document.addEventListener('keydown', function(e) {
    if ((e.which === 27 || e.keyCode === 27) && (modal.classList.contains('show-modal'))) {
        toggleModal(null);
    }
});
