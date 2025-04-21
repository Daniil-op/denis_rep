import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Instructions from './components/Instructions';
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
    const [cart, setCart] = useState([]);

    useEffect(() => {
        if (token) {
            const decodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            if (decodedToken.exp < currentTime) {
                localStorage.removeItem('token');
                setToken(null);
            } else {
                // Fetch user data and cart data here
                // For simplicity, we'll use dummy data
                setCart([{ name: 'House 1', price: '1000000' }, { name: 'House 2', price: '2000000' }]);
            }
        }
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    const handleAdminLogout = () => {
        localStorage.removeItem('adminToken');
        setAdminToken(null);
    };

    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<Home token={token} />} />
                    <Route path="/instructions" element={<Instructions />} />
                    <Route path="/cart" element={<Cart cart={cart} setCart={setCart} token={token} />} />
                    <Route path="/compare" element={<Compare token={token} />} />
                    <Route path="/product/:id" element={<ProductPage token={token} />} />
                    <Route path="/login" element={token ? <Navigate to="/account" /> : <Login setToken={setToken} />} />
                    <Route path="/register" element={token ? <Navigate to="/account" /> : <Register />} />
                    <Route path="/account" element={token ? <UserAccount handleLogout={handleLogout} /> : <Navigate to="/login" />} />
                    <Route path="/admin" element={adminToken ? <AdminAccount handleLogout={handleAdminLogout} /> : <Navigate to="/admin/login" />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
