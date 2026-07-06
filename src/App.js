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
                const decodedToken = jwtDecode(token);
                if (decodedToken.exp < Date.now() / 1000) {
                    handleLogout();
                }
            } catch (error) {
                handleLogout();
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
            <Routes>
                {/* Основной маршрут */}
                <Route path="/" element={<Home token={token} />} />

                {/* Маршрут для страницы товара */}
                <Route 
                    path="/products/:id" 
                    element={<ProductPage token={token} />}  // token передается как пропс
                />

                {/* Защищенные маршруты */}
                <Route path="/cart" element={
                    token ? <Cart token={token} /> : <Navigate to="/login" />
                }/>

                <Route path="/compare" element={
                    token ? <Compare token={token} /> : <Navigate to="/login" />
                }/>

                {/* Авторизация */}
                <Route path="/login" element={
                    token || adminToken 
                        ? <Navigate to={adminToken ? "/admin" : "/account"} /> 
                        : <Login setToken={setToken} setAdminToken={setAdminToken} />
                }/>

                <Route path="/register" element={
                    token ? <Navigate to="/account" /> : <Register />
                }/>

                {/* Аккаунты */}
                <Route path="/account" element={
                    token ? <UserAccount handleLogout={handleLogout} /> : <Navigate to="/login" />
                }/>

                <Route path="/admin" element={
                    adminToken ? <AdminAccount handleLogout={handleAdminLogout} /> : <Navigate to="/login" />
                }/>

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
};

export default App;