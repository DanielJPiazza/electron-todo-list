'use strict';

// -- IMPORTS --
const remote = require('electron').remote


// -- GLOBAL VARIABLES --
const closeButtonClasses = 'closeButton';
const closeButton = '\u2716';
const inputErrorMessage = document.getElementById('inputErrorMessage');
const addTaskButton = document.getElementById('newTaskInput');


// -- UTILITY FUNCTIONS --
function closeWindow() {
    // Not used in todo.js. Called in index.html.
    remote.getCurrentWindow().close()
}

function setFocusAddTaskField(){
    document.getElementById('newTaskInput').focus();
}

function openErrorMessage(message) {
    document.getElementById('inputErrorMessage').textContent = message;
    inputErrorMessage.style.display = 'inline-block';
}

function closeErrorMessage() {
    document.getElementById('inputErrorMessage').textContent = '';
    inputErrorMessage.style.display = 'none';
}

// -- IPC COMMUNICATION WITH MAIN.JS --
// Receive window size from main process when window is resized.
// Set height of todo list accordingly to avoid main window scrollbar.
require('electron').ipcRenderer.on('async-resize', (event, message) => {
    document.getElementById('todoList').style.height = ((message - 220).toString() + 'px');
});


// -- INITIAL SETUP --
// Create and append close button to each existing list item.
var nodes = document.getElementsByTagName('LI');
for (var i = 0; i < nodes.length; i++) {
    var span = document.createElement('SPAN');
    var txt = document.createTextNode(closeButton);
    span.className = closeButtonClasses;
    span.appendChild(txt);
    nodes[i].appendChild(span);
}

// Add remove node event to existing remove task buttons.
var remove = document.getElementsByTagName('LI');
for (var i = 0; i < remove.length; i++) {
    remove[i].addEventListener('click', function(e) {
        if (e.target.className == closeButtonClasses) {
            e.target.parentNode.remove();
        }
    }, false);
}

// Toggle 'checked' class on click for existing list items.
document.querySelector('UL').addEventListener('click', function(e) {
    if (e.target.tagName == 'LI') {
        e.target.classList.toggle('checked');
    }
}, false);

// Allow 'Enter' key to call createTask().
addTaskButton.addEventListener('keypress', function(e) {
    if (e.which === 13 || e.keyCode === 13) {
      createTask();
    }
}, false);


// -- NEW TASK FUNCTION --
// Create a new list item when 'Add Task' is clicked.
function createTask() {
    // Clear any displayed error messages.
    closeErrorMessage();
    
    // Gather user input.
    var inputValue = document.getElementById('newTaskInput').value.trim();

    // Verify user input contains characters other than whitepsace.
    var inputRegex = new RegExp('^\\S');
    if (!inputRegex.test(inputValue)) {
        // If check fails, display error message.
        openErrorMessage('Tasks must contain text. Please enter task again.');
        
        // Focus on add task field.
        setFocusAddTaskField();
        
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
    span.className = closeButtonClasses;
    span.appendChild(txt);
    span.addEventListener('click', function(e) {
        e.target.parentNode.remove();
    });
    li.appendChild(span);

    // Focus on add task field.
    setFocusAddTaskField();
}
