import React, { useState } from 'react';
import styles from './Login.module.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setToken, setUser }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                username,
                password
            });
            
            // Сохраняем токен и данные пользователя
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            setToken(response.data.token);
            setUser(response.data.user);
            navigate('/account');
        } catch (error) {
            setError(error.response?.data?.message || 'Неверное имя пользователя или пароль');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logoPlaceholder}></div>
                <div className={styles.headerButtons}>
                    <Link to="/">Главная</Link>
                    <Link to="/register">Регистрация</Link>
                </div>
            </header>
            
            <div className={styles.loginSection}>
                <h1>Вход</h1>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Имя пользователя"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Загрузка...' : 'Войти'}
                    </button>
                </form>
                {error && <p className={styles.error}>{error}</p>}
            </div>
            
            <footer className={styles.footer}>
                <div className={styles.footerButtons}>
                    <button>8 (800) 355-20-20</button>
                    <button>Почта</button>
                    <button>ВКонтакте</button>
                    <button>Telegram</button>
                    <button>WhatsApp</button>
                </div>
                <p>Пользовательское соглашение © Все права защищены 1997–2024</p>
            </footer>
        </div>
    );
};

export default Login;