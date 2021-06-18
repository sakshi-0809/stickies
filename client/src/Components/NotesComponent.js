import React, { useEffect, useState, useContext } from 'react';
import { withRouter } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import uniqid from 'uniqid';
import NoteModal from './NoteModalComponent';

function Sidebar(props) {
    const { notes, setNotes, userId } = props;

    const handleClick = (e) => {
        document.querySelector('.add-note-button').classList.toggle('add-note-button-focus');
        document.querySelector('.color-list').classList.toggle('color-list-selected');
    }

    const addNote = (e) => {
        const newNote = [{ key: uniqid(), color: e.target.value, content: '', starred: false }]
        const newNotes = newNote.concat(notes);

        const req = {
            _id: userId,
            notes: newNotes
        }

        fetch('/addnotes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req)
        }).then(res => res.json()).then(data => {
            console.log(data);
        })

        setNotes(newNotes);
    }

    const viewStarredNotes = (e) => {
        props.history.push('/starred');
    }

    const handleLogout = (e) => {
        fetch('/logout', {
            method: 'GET'
        }).then(res => res.json()).then(data => {
            console.log(data);
            props.history.push('/');
        })
    }

    return (
        <div className="sidebar">
            <div className="sidebar-heading">Stickies</div>
            <i className="material-icons add-note-button" onClick={handleClick}>add_circle</i>
            <div className="color-list">
                <button value="#FFC770" onClick={addNote} style={{ backgroundColor: "#FFC770" }}></button>
                <button value="#FFA172" onClick={addNote} style={{ backgroundColor: "#FFA172" }}></button>
                <button value="#B89AFF" onClick={addNote} style={{ backgroundColor: "#B89AFF" }}></button>
                <button value="#00C2FF" onClick={addNote} style={{ backgroundColor: "#00C2FF" }}></button>
                <button value="#E8E78E" onClick={addNote} style={{ backgroundColor: "#E8E78E" }}></button>
            </div>
            <i className="material-icons view-starred-notes" onClick={viewStarredNotes}>stars</i>
            <i className="material-icons logout-button" onClick={handleLogout}>exit_to_app</i>
        </div>
    )
}

function RenderNote(props) {
    const [notesInside, setNotesInside] = useState([{}]);
    const [resultsInside, setResultsInside] = useState([{}]);

    useEffect(() => {
        setNotesInside(props.notes);
        setResultsInside(props.searchResults);
    }, [props]);

    const handleNoteChange = (e) => {
        if (resultsInside.length === 0) {
            const noteIndex = notesInside.findIndex(note => note.key == e.target.name);
            const modNotes = [...notesInside];
            modNotes[noteIndex].content = e.target.value;
            setNotesInside(modNotes);
        } else {
            const noteIndex = notesInside.findIndex(note => note.key == e.target.name);
            const modNotes = [...notesInside];
            modNotes[noteIndex].content = e.target.value;
            setNotesInside(modNotes);

            const resultIndex = resultsInside.findIndex(note => note.key == e.target.name);
            const modResults = [...resultsInside];
            modResults[resultIndex].content = e.target.value;
            setResultsInside(modResults);
        }
    }

    const handleBlurSave = (e) => {
        e.target.scrollTop = 0;

        const req = {
            _id: props.userId,
            notes: notesInside
        }

        fetch('/addnotes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req)
        }).then(res => res.json()).then(data => {
            console.log(data);
        })
    }

    const handleNoteDelete = (e) => {
        const req = {
            _id: props.userId,
            notes: {
                _id: e.target.id
            }
        }

        const newNotesInside = notesInside.filter(note => note.key != e.target.id);
        props.mainSetNotes(newNotesInside);

        fetch('/deletenote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req)
        }).then(res => res.json()).then(data => {
            console.log(data);
        })
    }

    const handleNoteStar = (e) => {
        let modNotes = [];
        const noteIndex = props.notes.findIndex(note => note.key == e.target.id);

        if (resultsInside.length === 0) {
            modNotes = [...props.notes];
            modNotes[noteIndex].starred = !(modNotes[noteIndex].starred);
            props.mainSetNotes(modNotes);
        } else {
            modNotes = [...props.notes];
            modNotes[noteIndex].starred = !(modNotes[noteIndex].starred);
            props.mainSetNotes(modNotes);

            const resultIndex = resultsInside.findIndex(note => note.key == e.target.id);
            const modResults = [...resultsInside];
            modResults[resultIndex].starred = !(modResults[resultIndex].starred);
            setResultsInside(modResults);
        }

        const req = {
            _id: props.userId,
            notes: modNotes
        }

        fetch('/addnotes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req)
        }).then(res => res.json()).then(data => {
            console.log(data);
        })
    }

    const handleNoteEdit = (e) => {
        document.querySelector('.note-modal-container').classList.toggle('note-modal-container-active');

        props.setNoteModalData(notesInside.filter(note => note.key === e.target.id)[0]);
    }

    if (resultsInside.length === 0) {
        return notesInside.map(note => {
            return (
                note.color === ''
                    ? null
                    : <div className="note-div" key={note.key} style={{ backgroundColor: note.color }}>
                        <textarea
                            key={note.key}
                            name={note.key}
                            className="note"
                            style={{ backgroundColor: note.color }}
                            placeholder="Click to add notes"
                            value={note.content}
                            onChange={handleNoteChange}
                            onBlur={handleBlurSave}>
                        </textarea>
                        <i id={note.key} className="material-icons delete-note-button" onClick={handleNoteDelete}>delete</i>
                        <i id={note.key} className="material-icons star-note-button" onClick={handleNoteStar}>{note.starred ? "star" : "star_outline"}</i>
                        <i id={note.key} className="material-icons edit-note-button" onClick={handleNoteEdit}>edit</i>
                    </div>
            )
        })
    } else {
        return resultsInside.map(note => {
            return (
                note.color === ''
                    ? null
                    : <div className="note-div" key={note.key} style={{ backgroundColor: note.color }}>
                        <textarea
                            key={note.key}
                            name={note.key}
                            className="note"
                            style={{ backgroundColor: note.color }}
                            placeholder="Click to add notes"
                            value={note.content}
                            onChange={handleNoteChange}
                            onBlur={handleBlurSave}>
                        </textarea>
                        <i id={note.key} className="material-icons delete-note-button" onClick={handleNoteDelete}>delete</i>
                        <i id={note.key} className="material-icons star-note-button" onClick={handleNoteStar}>{note.starred ? "star" : "star_outline"}</i>
                        <i id={note.key} className="material-icons edit-note-button" onClick={handleNoteEdit}>edit</i>
                    </div>
            )
        })
    }
}

function Notes(props) {
    const authContext = useContext(AuthContext);
    const [notes, setNotes] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [resultMessage, setResultMessage] = useState('');
    const [noteModalData, setNoteModalData] = useState({});

    useEffect(() => {
        setNotes(props.notes);
    }, [props.notes])

    const handleSearch = (event) => {
        event.preventDefault();

        const req = {
            id: authContext.user._id,
            keyword: keyword
        }

        fetch('/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req)
        }).then(res => res.json()).then(data => {
            setSearchResults(data.result);
            data.result.length === 0 && setResultMessage('No Notes Found');
        })

        document.querySelector('.add-note-button').classList.add('hide-button');
        document.querySelector('.color-list').classList.add('hide-button');
        document.querySelector('.view-starred-notes').classList.add('hide-button');
    }

    const handleClear = () => {
        setKeyword('');
        setSearchResults([]);
        setResultMessage('');

        document.querySelector('.add-note-button').classList.remove('hide-button');
        document.querySelector('.color-list').classList.remove('hide-button');
        document.querySelector('.view-starred-notes').classList.remove('hide-button');
    }

    return (
        <div>
            <NoteModal note={noteModalData} notes={notes} setNotes={setNotes} />
            <Sidebar notes={notes} setNotes={setNotes} userId={authContext.user._id} history={props.history} />
            <div className="notes-heading">
                <form onSubmit={handleSearch} className="search-icon">
                    <input type='text' placeholder='Search' value={keyword} onChange={(e) => { setKeyword(e.target.value) }} />
                    <i className="material-icons" onClick={handleSearch}>search</i>
                    <i className="material-icons" onClick={handleClear}>close</i>
                    <span className='result-message'><em>{resultMessage}</em></span>
                </form>
                <div>Notes</div>
            </div>
            <div className="notes-container">
                <RenderNote
                    notes={notes}
                    searchResults={searchResults}
                    setNotes={setNotes}
                    userId={authContext.user._id}
                    mainSetNotes={props.setNotes}
                    setNoteModalData={setNoteModalData}
                />
            </div>
        </div>
    )
}

export default withRouter(Notes);