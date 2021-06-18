import React from 'react';
import ReactDOM from 'react-dom';
import 'material-design-icons-iconfont';
import './index.css';
import App from './App';
import AuthProvider from './Context/AuthContext';

ReactDOM.render(
  <AuthProvider>
    <App />
  </AuthProvider>,
  document.getElementById('root')
);
