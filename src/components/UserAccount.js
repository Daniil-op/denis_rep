import React, { useEffect, useState } from 'react';
import styles from './UserAccount.module.css';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const UserAccount = ({ handleLogout }) => {
    const [user, setUser] = useState(null);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                // Загружаем данные пользователя
                const userResponse = await axios.get('http://localhost:5000/api/user', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Загружаем корзину
                const cartResponse = await axios.get('http://localhost:5000/api/cart', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setUser(userResponse.data);
                setCart(cartResponse.data);
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                } else {
                    setError('Не удалось загрузить данные. Попробуйте позже.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <p>Загрузка данных...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Попробовать снова</button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logoPlaceholder}></div>
                <div className={styles.searchBar}>
                    <input type="text" placeholder="Поиск по названию дома" />
                    <button>Поиск</button>
                </div>
                <div className={styles.headerButtons}>
                    <Link to="/">Главная</Link>
                    <Link to="/instructions">Инструкции</Link>
                    <Link to="/compare">Сравнение</Link>
                    <Link to="/cart">Корзина ({cart.length})</Link>
                    <button onClick={handleLogout}>Выйти</button>
                </div>
            </header>

            <div className={styles.userInfoSection}>
                <div className={styles.userInfo}>
                    <h3>Информация о пользователе</h3>
                    <p>Имя: {user.username}</p>
                    <p>Email: {user.email}</p>
                    <p>Телефон: {user.phone}</p>
                </div>
                
                <div className={styles.cart}>
                    <h3>Корзина</h3>
                    {cart.length > 0 ? (
                        <ul>
                            {cart.map((item, index) => (
                                <li key={index}>{item.name} - {item.price} руб.</li>
                            ))}
                        </ul>
                    ) : (
                        <p>Ваша корзина пуста.</p>
                    )}
                </div>
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

export default UserAccount;