import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API from '../api';
import Nav from './Nav';
import Footer from './Footer';
import styles from './UserAccount.module.css';

const UserAccount = ({ handleLogout }) => {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        Promise.all([
            axios.get(`${API}/api/user`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${API}/api/user/orders`, { headers: { Authorization: `Bearer ${token}` } }),
        ]).then(([u, o]) => { setUser(u.data); setOrders(o.data); setLoading(false); })
          .catch(() => { navigate('/login'); });
    }, []);

    if (loading) return <div><Nav token={token} /><div className={styles.loading}>Загрузка...</div></div>;

    return (
        <div>
            <Nav token={token} />
            <div className={styles.main}>
                <div className={styles.sidebar}>
                    <div className={styles.avatar}>{user?.username?.[0]?.toUpperCase()}</div>
                    <h2>{user?.username}</h2>
                    <p>{user?.email}</p>
                    <p>{user?.phone}</p>
                    <button className={styles.logoutBtn} onClick={handleLogout}>Выйти</button>
                </div>
                <div className={styles.content}>
                    <h2>Мои заказы</h2>
                    {orders.length === 0 ? (
                        <div className={styles.empty}>
                            <p>У вас пока нет заказов</p>
                            <Link to="/" className={styles.shopBtn}>Перейти в каталог</Link>
                        </div>
                    ) : orders.map(order => (
                        <div key={order.id} className={styles.order}>
                            <div className={styles.orderHeader}>
                                <span>Заказ #{order.id}</span>
                                <span className={`${styles.status} ${styles[order.status?.replace(/\s/g,'')]}`}>{order.status}</span>
                                <span className={styles.orderDate}>{new Date(order.created_at).toLocaleDateString('ru-RU')}</span>
                            </div>
                            <div className={styles.orderTotal}>Сумма: <b>{Number(order.total).toLocaleString('ru-RU')} ₽</b></div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default UserAccount;
