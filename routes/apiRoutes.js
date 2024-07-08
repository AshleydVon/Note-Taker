// routes/apiRoutes.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const dbPath = path.join(__dirname, '../db/db.json');

// GET all notes
router.get('/notes', (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to read notes' });
      return;
    }
    res.json(JSON.parse(data));
  });
});

// POST a new note
router.post('/notes', (req, res) => {
  const newNote = { id: uuidv4(), ...req.body };

  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to read notes' });
      return;
    }

    const notes = JSON.parse(data);
    notes.push(newNote);

    fs.writeFile(dbPath, JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save note' });
        return;
      }

      res.json(newNote);
    });
  });
});

// DELETE a note by id
router.delete('/notes/:id', (req, res) => {
  const noteId = req.params.id;
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to read notes' });
      return;
    }

    let notes = JSON.parse(data);
    const updatedNotes = notes.filter(note => note.id !== noteId);

    fs.writeFile(dbPath, JSON.stringify(updatedNotes, null, 2), (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete note' });
        return;
      }

      res.json({ message: 'Note deleted successfully' });
    });
  });
});

module.exports = router;
