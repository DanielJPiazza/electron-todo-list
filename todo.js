'use strict';

// -----------------------------------------------------
// ** GLOBAL CONSTANTS

// Requires
const remote = require('electron').remote
const fs = require('fs');

// For CSS & HTML
const removeTaskButtonClass = 'removeTaskButton';
const removeTaskButton = '\u2716';

// IO & user data file verification (synchronous)
const userDataFileName = 'userdata.txt';

// Error modal
const modal = document.querySelector('.modal');
const modalCloseButton = document.querySelector('.modal-close-button');


// -----------------------------------------------------
// ** FUNCTIONS **

function closeWindow() {
    remote.getCurrentWindow().close()
}

function toggleDevMode() {
    remote.getCurrentWindow().webContents.toggleDevTools();
    remote.getCurrentWindow().maximize();
}

function setFocusAddTaskField(){
    document.getElementById('newTaskInput').focus();
}

function removeFocusAddTaskField() {
    document.getElementById('newTaskInput').blur();
}

function updateArrayTotalAndUserData() {
    // Update user data file.
    fs.writeFile('userdata.txt', userDataArray.join('\n'), (err) => {
        if (err) throw Error(err);
    });

    // Update task total displayed in GUI.
    updateArrayTotalGUI();    
}

// Updates the total task number in the GUI.
function updateArrayTotalGUI() {
    var node = document.getElementById('numberOfTasks');
    node.textContent = userDataArray.length;
}

// Determines which LI is removed from the task list.
function whichChild(element) {
    var i = 0;
    while((element = element.previousSibling) != null) {
        ++i;
    }
    return i;
}

function createTask(data, source) {
    // Create new list item and append user input.
    var li = document.createElement('LI');
    var txt = document.createTextNode(data);
    li.appendChild(txt);
    
    // Append new list item to task list.
    document.querySelector('UL').appendChild(li);

    // Append remove task button and add remove node event to remove button.
    var span = document.createElement('SPAN');
    txt = document.createTextNode(removeTaskButton);
    span.className = removeTaskButtonClass;
    span.appendChild(txt);
    li.appendChild(span);

    // If new user task, add to user data array and write array to user data file.
    if (source === 'user') {
        userDataArray.push(data);
        updateArrayTotalAndUserData();
    }
}

// Load user's todo list items from previous session.
function createTaskOnSetup(taskData) {
    // If user task list is empty, create the default task.
    if (userDataArray[0] === '') {
        userDataArray.length = 0;
        userDataArray.push("Enter new tasks or delete this one...");
    }
    
    // Create tasks
    for (var i in taskData) {
        createTask(taskData[i]);
    }

    // Update task total displayed in GUI.
    updateArrayTotalGUI();
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
    createTask(inputValue, 'user');

    // Clear user input field.
    document.getElementById('newTaskInput').value = '';
    
    // Focus on add task field.
    setFocusAddTaskField();
}

// Display error modal with the passed argument.
function toggleModal(message, isHTML) {     
    // Allow function to be called with optional argument for HTML parsing.
    if (isHTML === 'HTML') {
        document.getElementById('inputErrorMessage').innerHTML = message;
    } else {
        document.getElementById('inputErrorMessage').textContent = message;
    }
    
    // Display or hide the modal, depending on the previous state.
    modal.classList.toggle('show-modal');
    
    if (modal.classList.contains('show-modal')) {
        removeFocusAddTaskField();
    } else {
        setFocusAddTaskField();
    }
}

// Deletes all tasks, prompting the user to verify the action first.
function deleteAllTasksPrompt() {
    var htmlForModal = 'Are you sure?<br><br>' +
                       '<button onClick="deleteAllTasksYes()">YES</button> ' +
                       '<button onClick="toggleModal(null)">NO</button>';
    
    toggleModal(htmlForModal, 'HTML');
}

// Deletes all tasks upon user confirmation in deleteAllTasksPrompt().
function deleteAllTasksYes() {
    document.querySelectorAll('LI').forEach(e => e.parentNode.removeChild(e));

    if (document.querySelectorAll('LI').length === 0) {
        userDataArray.length = 0;
        toggleModal(null);
    }

    updateArrayTotalAndUserData();
}


// ---------------------------------------------
// ** ELECTRON IPC COMMUNICATION (NON-REMOTE) **

// Receive window size from main process (IPC) when window is resized.
// Set height of todo list accordingly to avoid main window scrollbar.
require('electron').ipcRenderer.on('async-resize', (event, message) => {
    document.getElementById('todoList').style.height = ((message - 240).toString() + 'px');
});


// -----------------------------------------------------
// ** INITIAL SETUP & NON-FUNCTION EVENT LISTENERS **

// Check for user data file, and create new file if missing.
try {
    if (fs.existsSync(userDataFileName)) {
      // File exists
    }
} catch (err) {
    fs.writeFile('userdata.txt', 'Enter new tasks or delete this one...', (err) => {
        if (err) throw Error(err);
    });
}

// Read user data file and create task list.
var userDataArray;
fs.readFile(userDataFileName, (err, data) => {
    if (err) console.error(err);
    userDataArray = data.toString().split('\n');
    createTaskOnSetup(userDataArray);
});

// Toggle 'checked' class on clicked list items.
document.getElementById('todoList').addEventListener('click', function(e) {
    if (e.target.tagName.toLowerCase() === 'li') {
        e.target.classList.toggle('checked');
    }
});

// Remove associated list item for clicked remove task button.
document.getElementById('todoList').addEventListener('click', function(e) {
    if (e.target.className === 'removeTaskButton') {
        // Calculate which LI is being removed.
        var indexForRemoval = whichChild(e.target.parentNode) - 1;
        // Remove equivalent index from user data array.
        userDataArray.splice(indexForRemoval, 1);
        // Remove LI DOM element.
        e.target.parentNode.remove();
        // Update user data file.
        updateArrayTotalAndUserData();
    }
});

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
