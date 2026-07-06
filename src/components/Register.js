import React, { useState } from 'react';
import styles from './Register.module.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../images/logo.png';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/register', {
                username,
                password,
                email,
                phone
            });
            navigate('/login');
        } catch (error) {
            setError('Error registering user');
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link to="/">
                    <img src={logo} alt="Logo" className={styles.logo} />
                </Link>
                <div className={styles.headerButtons}>
                    <Link to="/">Главная</Link>
                    <Link to="/login">Вход</Link>
                </div>
            </header>
            <div className={styles.registerSection}>
                <h1>Регистрация</h1>
                <form onSubmit={handleRegister}>
                    <input
                        type="text"
                        placeholder="Имя пользователя"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Телефон"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                    <button type="submit">Зарегистрироваться</button>
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

export default Register;
