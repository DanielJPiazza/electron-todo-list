'use strict';

// -- GLOBAL VARIABLES --

var closeButtonClasses = 'closeButton';
var closeButton = '\u2716';


// -- UTILITY FUNCTIONS --

function closeWindow() {
    const remote = require('electron').remote
    let w = remote.getCurrentWindow()
    w.close()
}

function setFocusAddTaskField(){
    document.getElementById("newTaskInput").focus();
}


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

// Toggle strikethrough on click for existing list items.
var list = document.querySelector('UL');
list.addEventListener('click', function(ev) {
    if (ev.target.tagName == 'LI') {
        ev.target.classList.toggle('checked');
    }
}, false);

// Add remove node event to existing remove task buttons.
var remove = document.getElementsByTagName('LI');
for (var i = 0; i < remove.length; i++) {
    remove[i].addEventListener('click', function(ev) {
        if (ev.target.className == closeButtonClasses) {
            ev.target.parentNode.remove();
        }
    }, false);
}


// -- NEW TASK FUNCTION --

// Create a new list item when 'Add Task' is clicked.
function createTask() {
    var li = document.createElement('LI');
    var inputValue = document.getElementById('newTaskInput').value;
    var txt = document.createTextNode(inputValue);
    li.appendChild(txt);

    // Toggle strikethrough on click for new list item.
    txt.addEventListener('click', function(ev) {
        ev.target.classList.toggle('checked');
    });
    
    // Append new item to task list.
    document.querySelector('UL').appendChild(li);
    
    // Clear add task field.
    document.getElementById('newTaskInput').value = '';

    // Append close button and add remove node event to new item.
    var span = document.createElement('SPAN');
    var txt = document.createTextNode(closeButton);
    span.className = closeButtonClasses;
    span.appendChild(txt);
    span.addEventListener('click', function(ev) {
        ev.target.parentNode.remove();
    });
    li.appendChild(span);

    // Focus on add task field.
    setFocusAddTaskField();
}
