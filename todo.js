'use strict';


// -- GLOBAL CONSTANTS --

const remote = require('electron').remote
const closebuttonclasses = 'closeButton';
const closeButton = '\u2716';
const fs = require('fs');
var userDataArray = fs.readFileSync('userdata.txt').toString().split("\n");


// -- UTILITY FUNCTIONS --

function closeWindow() {
    // Not used in todo.js. Called in index.html.
    remote.getCurrentWindow().close()
}

function setFocusAddTaskField(){
    document.getElementById('newTaskInput').focus();
}

function removeFocusAddTaskField() {
    document.getElementById('newTaskInput').blur();
}

// Called by createTaskOnSetup().
function createTaskOnSetupUtility(data) {
    // Create new list item and append user input.
    var li = document.createElement('LI');
    var txt = document.createTextNode(data.toString());
    li.appendChild(txt);

    // Toggle 'checked' class on click for new list item.
    li.addEventListener('click', function(e) {
        e.target.classList.toggle('checked');
    });
    
    // Append new list item to task list.
    document.querySelector('UL').appendChild(li);

    // Append close button and add remove node event to new item.
    var span = document.createElement('SPAN');
    txt = document.createTextNode(closeButton);
    span.className = closebuttonclasses;
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
        // Add a default task if the user's file is empty.
        createTaskOnSetupUtility("Create a new task or delete this one...");
    } else if (data.length === 1) {
        // Avoid calling a for loop if only one task.
        createTaskOnSetupUtility(data[0]);
    } else {
        // Pass the full array if more than one task.
        for (var i in data) {
            createTaskOnSetupUtility(data[i]);
        }
    }
}


// -- INITIAL SETUP --

// Load user's saved data and populate task list.
createTaskOnSetup(userDataArray);

// Allow 'Enter' key to call createTask().
document.getElementById('newTaskInput').addEventListener('keypress', function(e) {
    if (e.which === 13 || e.keyCode === 13) {
      createTask();
    }
}, false);


// -- IPC COMMUNICATION WITH MAIN.JS --

// Receive window size from main process when window is resized.
// Set height of todo list accordingly to avoid main window scrollbar.
require('electron').ipcRenderer.on('async-resize', (event, message) => {
    document.getElementById('todoList').style.height = ((message - 220).toString() + 'px');
});


// -- ERROR MODAL HANDLING --

const modal = document.querySelector('.modal');
const modalCloseButton = document.querySelector('.modal-close-button');

function toggleModal(message) {     
    document.getElementById('inputErrorMessage').textContent = message;
    modal.classList.toggle('show-modal');
    
    if (modal.classList.contains('show-modal')) {
        removeFocusAddTaskField();
    } else {
        setFocusAddTaskField();
    }
}

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


// -- NEW TASK FUNCTION --

// Create a new list item when 'Add Task' is clicked.
function createTask() {
    // Gather user input.
    var inputValue = document.getElementById('newTaskInput').value.trim();

    // Verify user input contains characters other than whitepsace.
    var inputRegex = new RegExp('^\\S');
    if (!inputRegex.test(inputValue)) {
        // If check fails, display error message.
        toggleModal('Tasks must contain text.');
        return false;
    }

    // Create new list item and append user input.
    var li = document.createElement('LI');
    var txt = document.createTextNode(inputValue);
    li.appendChild(txt);

    // Toggle 'checked' class on click for new list item.
    txt.addEventListener('click', function(e) {
        e.target.classList.toggle('checked');
    });
    
    // Append new list item to task list.
    document.querySelector('UL').appendChild(li);
    
    // Clear user input field.
    document.getElementById('newTaskInput').value = '';

    // Append close button and add remove node event to new item.
    var span = document.createElement('SPAN');
    txt = document.createTextNode(closeButton);
    span.className = closebuttonclasses;
    span.appendChild(txt);
    span.addEventListener('click', function(e) {
        e.target.parentNode.remove();
    });
    li.appendChild(span);

    // Focus on add task field.
    setFocusAddTaskField();
}
