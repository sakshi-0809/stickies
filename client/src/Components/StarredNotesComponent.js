import React, { useState, useEffect, useContext } from 'react';
import { withRouter } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import axios from 'axios';

function Sidebar(props) {
    const authContext = useContext(AuthContext);

    const handleLogout = (e) => {
        fetch('/logout', {
            method: 'GET'
        }).then(res => res.json()).then(data => {
            console.log(data);
            props.history.push('/');
        })
    }

    const handleBack = (e) => {
        props.history.push('/notes')
    }

    const handleEmail = (e) => {
        const data = {
            _id: authContext.user._id
        }

        axios.post("/sendmail", data);
    }

    return (
        <div className="sidebar">
            <div className="sidebar-heading">Stickies</div>
            <div className="back-button-div">
                <i className="material-icons back-button" onClick={handleBack}>arrow_back</i>
            </div>
            <i className="material-icons email-button" onClick={handleEmail}>email</i>
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

    const starredNotes = notesInside.filter(note => note.starred !== false)

    const handleNoteStar = (e) => {
        if (resultsInside.length === 0) {
            const noteIndex = notesInside.findIndex(note => note.key == e.target.id);
            const modNotes = [...notesInside];
            modNotes[noteIndex].starred = !modNotes[noteIndex].starred;
            setNotesInside(modNotes);
        } else {
            const noteIndex = notesInside.findIndex(note => note.key == e.target.id);
            const modNotes = [...notesInside];
            modNotes[noteIndex].starred = !modNotes[noteIndex].starred;
            setNotesInside(modNotes);

            const resultIndex = resultsInside.findIndex(note => note.key == e.target.id);
            const modResults = [...resultsInside];
            modResults[resultIndex].starred = !modResults[resultIndex].starred;
            setResultsInside(modResults);
        }

        const req = {
            _id: props.userId,
            notes: props.notes
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

    const handleBlurSave = (e) => {
        e.target.scrollTop = 0;
    }

    if (resultsInside.length === 0) {
        return starredNotes.map(note => {
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
                            onBlur={handleBlurSave}>
                        </textarea>
                        <i id={note.key} className="material-icons starred-notes" onClick={handleNoteStar}>{note.starred ? "star" : "star_outline"}</i>
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
                            value={note.content}>
                        </textarea>
                        <i id={note.key} className="material-icons starred-notes" onClick={handleNoteStar}>{note.starred ? "star" : "star_outline"}</i>
                    </div>
            )
        })
    }
}


function StarredNotes(props) {
    const authContext = useContext(AuthContext);
    const [notes, setNotes] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [resultMessage, setResultMessage] = useState('');

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
    }

    const handleClear = () => {
        setKeyword('');
        setSearchResults([]);
        setResultMessage('');
    }

    return (
        <div>
            <Sidebar history={props.history} notes={notes} />
            <div className="notes-heading">
                <form onSubmit={handleSearch} className="search-icon">
                    <input type='text' placeholder='Search' value={keyword} onChange={(e) => { setKeyword(e.target.value) }} />
                    <i className="material-icons" onClick={handleSearch}>search</i>
                    <i className="material-icons" onClick={handleClear}>close</i>
                    <span className='result-message'><em>{resultMessage}</em></span>
                </form>
                <div>Starred Notes</div>
            </div>
            <div className="notes-container">
                <RenderNote notes={notes} searchResults={searchResults} userId={authContext.user._id} />
            </div>
        </div>
    )
}

export default withRouter(StarredNotes);