import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../Context/AuthContext';

function NoteModal(props) {
    const [note, setNote] = useState({});
    const [tempNote, setTempNote] = useState({});
    const [notes, setNotes] = useState([]);
    const authContext = useContext(AuthContext);

    useEffect(() => {
        setNote(props.note);
        setNotes(props.notes);
        setTempNote({ ...props.note });
    }, [props])

    const handleModalClose = (e) => {
        setNote({ ...note, content: note.content });

        const modal = document.querySelector(`#${note.key}`);

        setNote({ ...note, content: tempNote.content });
        const noteIndex = notes.findIndex(n => n.key === note.key);
        const modNotes = [...notes];
        modNotes[noteIndex].content = tempNote.content;
        setNotes(modNotes);

        modal.value = tempNote.content;
        document.querySelector('.note-modal-container').classList.toggle('note-modal-container-active');
    }

    const handleNoteChange = (e) => {
        setNote({ ...note, content: e.target.value });
        const noteIndex = notes.findIndex(n => n.key === e.target.name);
        const modNotes = [...notes];
        modNotes[noteIndex].content = e.target.value;
        setNotes(modNotes);
    }

    const handleSave = (e) => {
        const req = {
            _id: authContext.user._id,
            note: note
        }

        fetch('/editnote', {
            method: 'POST',
            body: JSON.stringify(req),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => res.json()).then(data => {
            console.log(data)
        })

        document.querySelector('.note-modal-container').classList.toggle('note-modal-container-active');

        props.setNotes(notes);
    }

    return (
        <div className="note-modal-container">
            <div className="note-modal">
                <i className="material-icons close-modal" onClick={handleModalClose}>close</i>
                <textarea
                    key={note.key}
                    name={note.key}
                    id={note.key}
                    style={{ backgroundColor: note.color }}
                    placeholder="Click to add notes"
                    value={note.content}
                    onChange={handleNoteChange}>
                </textarea>
                <i className="material-icons save-modal" onClick={handleSave}>save</i>
            </div>
        </div>
    )
}

export default NoteModal;