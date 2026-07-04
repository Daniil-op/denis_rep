import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API from '../api';
import styles from './Login.module.css';

const Register = () => {
    const [form, setForm] = useState({ username: '', password: '', email: '', phone: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post(`${API}/api/register`, form);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data || 'Ошибка регистрации');
        } finally { setLoading(false); }
    };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <Link to="/" className={styles.logo}>🏠 ДомСтрой</Link>
                <h1>Регистрация</h1>
                <form onSubmit={handleSubmit}>
                    {[
                        ['username','Имя пользователя','text','username'],
                        ['password','Пароль','password','••••••••'],
                        ['email','Email','email','email@example.com'],
                        ['phone','Телефон','text','+7 (___) ___-__-__'],
                    ].map(([key, label, type, ph]) => (
                        <div className={styles.field} key={key}>
                            <label>{label}</label>
                            <input type={type} placeholder={ph} value={form[key]}
                                onChange={e => setForm({...form, [key]: e.target.value})} required />
                        </div>
                    ))}
                    {error && <p className={styles.error}>{error}</p>}
                    <button type="submit" className={styles.btn} disabled={loading}>
                        {loading ? 'Загрузка...' : 'Зарегистрироваться'}
                    </button>
                </form>
                <p className={styles.hint}>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
            </div>
        </div>
    );
};

export default Register;
