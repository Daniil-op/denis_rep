import React, { useState, useEffect } from 'react';
import styles from './Cart.module.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Cart = ({ token }) => {
    const [cart, setCart] = useState([]);
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [orderDetails, setOrderDetails] = useState({
        name: '',
        phone: '',
        email: ''
    });

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/cart', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setCart(response.data);
            } catch (error) {
                console.error('Failed to fetch cart', error);
            }
        };

        fetchCart();
    }, [token]);

    const handleRemoveFromCart = async (productId) => {
        try {
            await axios.delete(`http://localhost:5000/api/cart/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCart(cart.filter(item => item.id !== productId));
        } catch (error) {
            console.error('Failed to remove product from cart', error);
        }
    };

    const handleOrder = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/orders', {
                items: cart,
                ...orderDetails
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            alert('Заказ оформлен успешно!');
            setShowOrderForm(false);
        } catch (error) {
            console.error('Failed to place order', error);
        }
    };

    const totalPrice = cart.reduce((total, item) => total + parseFloat(item.price), 0);

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
                    <Link to="/instructions">Инструкции</Link>
                    <Link to="/compare">Сравнение</Link>
                    {token ? (
                        <Link to="/account">Аккаунт</Link>
                    ) : (
                        <>
                            <Link to="/login">Войти</Link>
                            <Link to="/register">Зарегистрироваться</Link>
                        </>
                    )}
                </div>
            </header>
            <div className={styles.cartSection}>
                <h1>Корзина</h1>
                {cart.length > 0 ? (
                    cart.map(item => (
                        <div key={item.id} className={styles.cartItem}>
                            <img src={item.image_url} alt={item.name} className={styles.cartImage} />
                            <div className={styles.cartDetails}>
                                <h2>{item.name}</h2>
                                <p>Общая площадь: {item.area} м²</p>
                                <p>Площадь застройки: {item.plotArea} м²</p>
                                <p>Этажей: {item.floors}</p>
                                <p>Спален: {item.bedrooms}</p>
                                <p>Санузлов: {item.bathrooms}</p>
                            </div>
                            <button onClick={() => handleRemoveFromCart(item.id)} className={styles.removeButton}>Удалить</button>
                        </div>
                    ))
                ) : (
                    <p>Ваша корзина пуста.</p>
                )}
            </div>
            <div className={styles.cartSummary}>
                <h2>Итоговая стоимость</h2>
                <p>{totalPrice.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</p>
                <button onClick={() => setShowOrderForm(true)}>Оформить заказ</button>
            </div>
            {showOrderForm && (
                <div className={styles.orderForm}>
                    <h2>Оформление заказа</h2>
                    <form onSubmit={handleOrder}>
                        <input
                            type="text"
                            placeholder="ФИО"
                            value={orderDetails.name}
                            onChange={(e) => setOrderDetails({ ...orderDetails, name: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Номер телефона"
                            value={orderDetails.phone}
                            onChange={(e) => setOrderDetails({ ...orderDetails, phone: e.target.value })}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={orderDetails.email}
                            onChange={(e) => setOrderDetails({ ...orderDetails, email: e.target.value })}
                            required
                        />
                        <button type="submit">Отправить</button>
                        <button type="button" onClick={() => setShowOrderForm(false)}>Отмена</button>
                    </form>
                </div>
            )}
            <div className={styles.cartHelp}>
                <h2>Мы подскажем с чего начать</h2>
                <select>
                    <option value="Город">Город</option>
                    <option value="Барнаул">Барнаул</option>
                </select>
                <button>Продолжить</button>
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

export default Cart;
