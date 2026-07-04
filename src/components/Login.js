import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API from '../api';
import styles from './Login.module.css';

const Login = ({ setToken, isAdmin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${API}/api/login`, { username, password });
            if (isAdmin) {
                if (!res.data.isAdmin) { setError('Нет прав администратора'); return; }
                localStorage.setItem('adminToken', res.data.token);
                setToken(res.data.token);
                navigate('/admin');
            } else {
                localStorage.setItem('token', res.data.token);
                setToken(res.data.token);
                navigate('/account');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Неверный логин или пароль');
        } finally { setLoading(false); }
    };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <Link to="/" className={styles.logo}>🏠 ДомСтрой</Link>
                <h1>{isAdmin ? 'Вход для администратора' : 'Вход в аккаунт'}</h1>
                <form onSubmit={handleLogin}>
                    <div className={styles.field}>
                        <label>{isAdmin ? 'Email' : 'Имя пользователя'}</label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder={isAdmin ? 'admin@example.com' : 'username'} />
                    </div>
                    <div className={styles.field}>
                        <label>Пароль</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    <button type="submit" className={styles.btn} disabled={loading}>
                        {loading ? 'Загрузка...' : 'Войти'}
                    </button>
                </form>
                {!isAdmin && <p className={styles.hint}>Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>}
            </div>
        </div>
    );
};

export default Login;
