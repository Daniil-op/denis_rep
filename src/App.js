import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Cart from './components/Cart';
import Compare from './components/Compare';
import ProductPage from './components/ProductPage';
import Login from './components/Login';
import Register from './components/Register';
import UserAccount from './components/UserAccount';
import AdminAccount from './components/AdminAccount';
import { jwtDecode } from 'jwt-decode';

const App = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp < Date.now() / 1000) {
                    localStorage.removeItem('token');
                    setToken(null);
                }
            } catch {
                localStorage.removeItem('token');
                setToken(null);
            }
        }
    }, [token]);

    const handleLogout = () => { localStorage.removeItem('token'); setToken(null); };
    const handleAdminLogout = () => { localStorage.removeItem('adminToken'); setAdminToken(null); };

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home token={token} />} />
                <Route path="/cart" element={<Cart token={token} />} />
                <Route path="/compare" element={<Compare token={token} />} />
                <Route path="/product/:id" element={<ProductPage token={token} />} />
                <Route path="/login" element={token ? <Navigate to="/account" /> : <Login setToken={setToken} />} />
                <Route path="/register" element={token ? <Navigate to="/account" /> : <Register />} />
                <Route path="/account" element={token ? <UserAccount handleLogout={handleLogout} /> : <Navigate to="/login" />} />
                <Route path="/admin" element={adminToken ? <AdminAccount handleLogout={handleAdminLogout} /> : <Navigate to="/admin/login" />} />
                <Route path="/admin/login" element={adminToken ? <Navigate to="/admin" /> : <Login setToken={setAdminToken} isAdmin={true} />} />
            </Routes>
        </Router>
    );
};

export default App;
