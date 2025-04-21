import React, { useEffect, useState } from 'react';
import styles from './AdminAccount.module.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminAccount = ({ handleLogout }) => {
    const [products, setProducts] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await axios.get('http://localhost:5000/api/houses', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setProducts(response.data);
            } catch (error) {
                console.error('Failed to fetch products', error);
            }
        };

        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await axios.get('http://localhost:5000/api/admin/notifications', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setNotifications(response.data);
            } catch (error) {
                console.error('Failed to fetch notifications', error);
            }
        };

        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await axios.get('http://localhost:5000/api/admin/orders', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setOrders(response.data);
            } catch (error) {
                console.error('Failed to fetch orders', error);
            }
        };

        fetchProducts();
        fetchNotifications();
        fetchOrders();
    }, []);

    const handleAddProduct = async (product) => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.post('http://localhost:5000/api/houses', product, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setProducts([...products, product]);
        } catch (error) {
            console.error('Failed to add product', error);
        }
    };

    const handleEditProduct = async (product) => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(`http://localhost:5000/api/houses/${product.id}`, product, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setProducts(products.map(p => p.id === product.id ? product : p));
        } catch (error) {
            console.error('Failed to edit product', error);
        }
    };

    const handleDeleteProduct = async (productId) => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`http://localhost:5000/api/houses/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setProducts(products.filter(p => p.id !== productId));
        } catch (error) {
            console.error('Failed to delete product', error);
        }
    };

    const handleSendNotification = async (notification) => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.post('http://localhost:5000/api/admin/notifications', notification, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setNotifications([...notifications, notification]);
        } catch (error) {
            console.error('Failed to send notification', error);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logoPlaceholder}>
                    {/* Placeholder for logo */}
                </div>
                <div className={styles.searchBar}>
                    <input type="text" placeholder="Поиск по названию дома" />
                    <button>Поиск</button>
                </div>
                <div className={styles.headerButtons}>
                    <Link to="/">Главная</Link>
                    <Link to="/admin/reports">Отчёты</Link>
                    <button onClick={handleLogout}>Выйти</button>
                </div>
            </header>
            <div className={styles.adminSection}>
                <h1>Администратор</h1>
                <div className={styles.products}>
                    <h2>Товары</h2>
                    {products.map(product => (
                        <div key={product.id} className={styles.product}>
                            <img src={product.image_url} alt={product.name} className={styles.productImage} />
                            <div className={styles.productDetails}>
                                <h3>{product.name}</h3>
                                <p>{product.description}</p>
                                <p>Цена: {product.price} руб.</p>
                                <button onClick={() => handleEditProduct(product)}>Редактировать</button>
                                <button onClick={() => handleDeleteProduct(product.id)}>Удалить</button>
                            </div>
                        </div>
                    ))}
                    <button onClick={() => handleAddProduct({ name: 'New Product', description: 'Description', price: '1000000', image_url: 'image_url' })}>Добавить товар</button>
                </div>
                <div className={styles.notifications}>
                    <h2>Уведомления</h2>
                    {notifications.map((notification, index) => (
                        <div key={index} className={styles.notification}>
                            <p>{notification.message}</p>
                        </div>
                    ))}
                    <button onClick={() => handleSendNotification({ message: 'New Notification' })}>Отправить уведомление</button>
                </div>
                <div className={styles.orders}>
                    <h2>Заказы</h2>
                    {orders.map(order => (
                        <div key={order.id} className={styles.order}>
                            <p>Пользователь: {order.username}</p>
                            <p>Товары: {order.items.map(item => item.name).join(', ')}</p>
                            <p>Сумма: {order.totalPrice} руб.</p>
                        </div>
                    ))}
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

export default AdminAccount;
