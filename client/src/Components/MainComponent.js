import React, { useContext, useEffect, useState } from 'react';
import { Route, Switch, withRouter, Redirect } from 'react-router-dom';
import Login from './LoginComponent';
import Register from './RegisterComponent';
import Notes from './NotesComponent';
import StarredNotes from './StarredNotesComponent';
import { AuthContext } from '../Context/AuthContext';

const PrivateRoute = ({ component: Component, notes, setNotes, ...rest }) => {
    return (
        <Route {...rest} render={(props) => {
            return (
                rest.isAuthenticated
                    ? <Component notes={notes} setNotes={setNotes} {...props} />
                    : <Redirect to='/' />
            )
        }} />
    )
}

function Main(props) {
    const authContext = useContext(AuthContext);
    const [notes, setNotes] = useState([{}]);

    useEffect(() => {
        setNotes(authContext.user.notes);
        if (authContext.isAuthenticated) {
            props.history.push('/notes');
        }
    }, [authContext.user.notes, authContext.isAuthenticated, props.history])

    return (
        <Switch>
            <Route exact path='/'>
                <Login />
            </Route>
            <Route path='/register'>
                <Register />
            </Route>
            <PrivateRoute path='/notes' component={Notes} notes={notes} setNotes={setNotes} isAuthenticated={authContext.isAuthenticated} />
            <Route path='/starred' >
                <StarredNotes notes={notes} setNotes={setNotes} isAuthenticated={authContext.isAuthenticated} />
            </Route>
            <Redirect to='/' />
        </Switch>
    )
}

export default withRouter(Main);