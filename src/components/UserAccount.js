import React, { useEffect, useState } from 'react';
import styles from './UserAccount.module.css';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../images/logo.png';

const UserAccount = ({ handleLogout }) => {
    const [user, setUser] = useState(null);
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState([]); // Переместили сюда
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

                // Исправленная деструктуризация с правильными именами
                const [
                    userResponse, 
                    cartResponse, 
                    ordersResponse // Добавляем недостающую переменную
                ] = await Promise.all([
                    axios.get('/api/user', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('/api/cart', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('/api/user/orders', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                setUser(userResponse.data);
                setCart(cartResponse.data);
                setOrders(ordersResponse.data.map(order => ({
                    ...order,
                    items: Array.isArray(order.items) 
                        ? order.items 
                        : []
                })));
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
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
                <Link to="/">
                    <img src={logo} alt="Logo" className={styles.logo} />
                </Link>
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

                <div className={styles.orders}>
                    <h3>История заказов</h3>
                    {orders.length > 0 ? (
                        <ul className={styles.ordersList}>
                            {orders.map(order => (
                                <li key={order.id} className={styles.orderItem}>
                                    <div className={styles.orderHeader}>
                                        <span>Заказ №{order.id}</span>
                                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className={styles.orderDetails}>
                                        <p>Товары:</p>
                                        <ul>
                                            {order.items.map((item, index) => (
                                                <li key={index}>
                                                    {item.name} - {item.price} руб.
                                                    {item.quantity > 1 && ` × ${item.quantity}`}
                                                </li>
                                            ))}
                                        </ul>
                                        <p className={styles.orderTotal}>Итого: {order.total} руб.</p>
                                        <p className={styles.orderStatus}>
                                            Статус: {order.status}
                                            {order.status === 'В пути' && <span className={styles.statusIcon}>🚚</span>}
                                            {order.status === 'Доставлен' && <span className={styles.statusIcon}>✅</span>}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>У вас пока нет заказов</p>
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