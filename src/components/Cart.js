import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API from '../api';
import Nav from './Nav';
import Footer from './Footer';
import styles from './Cart.module.css';

const Cart = ({ token }) => {
    const [cart, setCart] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', email: '' });
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) { setLoading(false); return; }
        axios.get(`${API}/api/cart`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => { setCart(r.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [token]);

    const remove = async (productId, cartIndex) => {
        await axios.delete(`${API}/api/cart/${productId}`, { headers: { Authorization: `Bearer ${token}` } });
        // Удаляем только конкретный элемент по индексу, а не все с таким id
        setCart(prev => prev.filter((_, i) => i !== cartIndex));
    };

    const order = async (e) => {
        e.preventDefault();
        const total = cart.reduce((s, i) => s + parseFloat(i.price), 0);
        try {
            await axios.post(`${API}/api/orders`, { items: cart, total, ...form }, { headers: { Authorization: `Bearer ${token}` } });
            setSuccess(true);
            setCart([]);
            setShowForm(false);
        } catch (err) { alert('Ошибка оформления: ' + (err.response?.data?.error || err.message)); }
    };

    const total = cart.reduce((s, i) => s + parseFloat(i.price), 0);

    return (
        <div>
            <Nav token={token} />
            <div className={styles.main}>
                <h1>Корзина {cart.length > 0 && <span className={styles.count}>{cart.length}</span>}</h1>
                {success && <div className={styles.success}>✅ Заказ оформлен! Менеджер свяжется с вами.</div>}
                {!token && <p className={styles.hint}>Войдите в аккаунт чтобы добавлять товары в корзину.</p>}
                {loading ? <p>Загрузка...</p> : cart.length === 0 && !success ? (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>🏠</div>
                        <p>Корзина пуста</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.items}>
                            {cart.map((item, idx) => (
                                <div key={item.id} className={styles.item}>
                                    <img src={item.image_url} alt={item.name} />
                                    <div className={styles.itemInfo}>
                                        <h3>{item.name}</h3>
                                        <div className={styles.itemSpecs}>
                                            <span>🏠 {item.area} м²</span>
                                            <span>🏢 {item.floors} эт.</span>
                                            <span>🛏 {item.bedrooms} спал.</span>
                                        </div>
                                        <div className={styles.itemPrice}>{Number(item.price).toLocaleString('ru-RU')} ₽</div>
                                    </div>
                                    <button className={styles.removeBtn} onClick={() => remove(item.id, idx)}>✕</button>
                                </div>
                            ))}
                        </div>
                        <div className={styles.summary}>
                            <div className={styles.total}>Итого: <b>{total.toLocaleString('ru-RU')} ₽</b></div>
                            <button className={styles.orderBtn} onClick={() => setShowForm(true)}>Оформить заказ</button>
                        </div>
                    </>
                )}
                {showForm && (
                    <div className={styles.overlay}>
                        <div className={styles.modal}>
                            <h2>Оформление заказа</h2>
                            <form onSubmit={order}>
                                {[['name','ФИО','text'],['phone','Телефон','text'],['email','Email','email']].map(([key,ph,type]) => (
                                    <input key={key} type={type} placeholder={ph} required
                                        value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} />
                                ))}
                                <div className={styles.modalActions}>
                                    <button type="submit" className={styles.orderBtn}>Подтвердить</button>
                                    <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>Отмена</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Cart;
