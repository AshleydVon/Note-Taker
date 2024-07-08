// assets/js/index.js (assuming this is your client-side JavaScript)
let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let noteList;

// Function to initialize DOM elements
const initializeElements = () => {
  noteTitle = document.querySelector('.note-title');
  noteText = document.querySelector('.note-textarea');
  saveNoteBtn = document.querySelector('.save-note');
  newNoteBtn = document.querySelector('.new-note');
  noteList = document.querySelectorAll('.list-container .list-group');

  if (saveNoteBtn && newNoteBtn && noteTitle && noteText) {
    saveNoteBtn.addEventListener('click', handleNoteSave);
    newNoteBtn.addEventListener('click', handleNewNoteView);
    noteTitle.addEventListener('keyup', handleRenderSaveBtn);
    noteText.addEventListener('keyup', handleRenderSaveBtn);
  }
};

// Function to show an element
const show = (elem) => {
  if (elem) {
    elem.style.display = 'inline';
  }
};

// Function to hide an element
const hide = (elem) => {
  if (elem) {
    elem.style.display = 'none';
  }
};

// activeNote is used to keep track of the note in the textarea
let activeNote = {};

// Function to get all notes from the server
const getNotes = () =>
  fetch('/api/notes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

// Function to save a new note to the server
const saveNote = (note) =>
  fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });

// Function to delete a note from the server
const deleteNote = (noteId) =>
  fetch(`/api/notes/${noteId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

// Function to render the active note if it exists, otherwise render empty inputs
const renderActiveNote = () => {
  if (!saveNoteBtn) {
    return; // Return early if saveNoteBtn is not initialized
  }

  hide(saveNoteBtn);

  if (activeNote.id) {
    noteTitle.setAttribute('readonly', true);
    noteText.setAttribute('readonly', true);
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
  } else {
    noteTitle.removeAttribute('readonly');
    noteText.removeAttribute('readonly');
    noteTitle.value = '';
    noteText.value = '';
  }
};

// Function to handle saving a note
const handleNoteSave = () => {
  const newNote = {
    title: noteTitle.value,
    text: noteText.value,
  };
  saveNote(newNote).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Function to handle deleting the clicked note
const handleNoteDelete = (e) => {
  e.stopPropagation();

  const note = e.target.parentElement;
  const noteId = JSON.parse(note.getAttribute('data-note')).id;

  if (activeNote.id === noteId) {
    activeNote = {};
  }

  deleteNote(noteId)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to delete note');
      }
      return response.json();
    })
    .then(() => {
      getAndRenderNotes();
      renderActiveNote();
    })
    .catch((error) => {
      console.error('Error deleting note:', error);
      // Handle error, e.g., show an alert to the user
    });
};

// Function to set the activeNote and display it
const handleNoteView = (e) => {
  e.preventDefault();
  activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
  renderActiveNote();
};

// Function to set the activeNote to an empty object and allow the user to enter a new note
const handleNewNoteView = (e) => {
  activeNote = {};
  renderActiveNote();
};

// Function to handle whether to show or hide the save button based on note title and text input
const handleRenderSaveBtn = () => {
  if (!noteTitle.value.trim() || !noteText.value.trim()) {
    hide(saveNoteBtn);
  } else {
    show(saveNoteBtn);
  }
};

// Function to render the list of note titles
const renderNoteList = async (notes) => {
  try {
    let jsonNotes = await notes.json();
  
    if (noteList && window.location.pathname === '/notes') {
      noteList.forEach((el) => (el.innerHTML = ''));
    }
  
    let noteListItems = [];
  
    const createLi = (text, delBtn = true) => {
      const liEl = document.createElement('li');
      liEl.classList.add('list-group-item');
  
      const spanEl = document.createElement('span');
      spanEl.classList.add('list-item-title');
      spanEl.innerText = text;
      spanEl.addEventListener('click', handleNoteView);
  
      liEl.append(spanEl);
  
      if (delBtn) {
        const delBtnEl = document.createElement('i');
        delBtnEl.classList.add('fas', 'fa-trash-alt', 'float-right', 'text-danger', 'delete-note');
        delBtnEl.addEventListener('click', handleNoteDelete);
  
        liEl.append(delBtnEl);
      }
  
      return liEl;
    };
  
    if (jsonNotes.length === 0) {
      noteListItems.push(createLi('No saved Notes', false));
    }
  
    jsonNotes.forEach((note) => {
      const li = createLi(note.title);
      li.setAttribute('data-note', JSON.stringify(note));
  
      noteListItems.push(li);
    });
  
    if (noteList && window.location.pathname === '/notes') {
      noteListItems.forEach((note) => noteList[0].append(note));
    }
  } catch (error) {
    console.error('Error rendering note list:', error);
  }
};

// Function to get notes from the server and render them to the sidebar
const getAndRenderNotes = () => {
  getNotes()
    .then(renderNoteList)
    .catch((error) => console.error('Error getting and rendering notes:', error));
};

// Ensure DOM content is fully loaded before initializing elements
document.addEventListener('DOMContentLoaded', () => {
  initializeElements();
  getAndRenderNotes();
  renderActiveNote();
});
