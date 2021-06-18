import React, { useState, useContext } from 'react';
import { Link, withRouter } from 'react-router-dom';
import AuthService from '../Services/AuthService';
import { AuthContext } from '../Context/AuthContext'

function Login(props) {

    const authContext = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        AuthService.login({
            username: username,
            password: password
        }).then(data => {
            const { isAuthenticated, user } = data;
            if (isAuthenticated) {
                authContext.setUser(user);
                authContext.setIsAuthenticated(isAuthenticated);
                console.log(authContext.isAuthenticated)
                props.history.push('/notes');
            }
            else {
                setLoginError("Username/Password Incorrect");
            }
        });
    }

    const handleChange = (e) => {
        if (e.target.name === "username") {
            setUsername(e.target.value);
        } else if (e.target.name === "password") {
            setPassword(e.target.value);
        }
    }

    return (
        <div className="form-page">
            <div className="form-card">
                <div className="form-heading">Login</div>
                <div>
                    <form onSubmit={handleSubmit}>
                        <input type="text" placeholder="Username" value={username} name="username" onChange={handleChange} />
                        <input type="password" placeholder="Password" value={password} name="password" onChange={handleChange} />
                        {loginError === '' ? <div></div> : <div className="form-error">{loginError}</div>}
                        <button type="submit">Login</button>
                    </form>
                </div>
                <div className="register-option">Don't have an account? <Link to='/register'>Signup</Link></div>
            </div>
        </div>
    )
}

export default withRouter(Login);