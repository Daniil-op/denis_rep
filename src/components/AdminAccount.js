import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API from '../api';
import styles from './AdminAccount.module.css';

const AdminAccount = ({ handleLogout }) => {
    const [tab, setTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [editProduct, setEditProduct] = useState(null);
    const [newProduct, setNewProduct] = useState(null);
    const token = localStorage.getItem('adminToken');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        axios.get(`${API}/api/houses`, { headers }).then(r => setProducts(r.data));
        axios.get(`${API}/api/admin/orders`, { headers }).then(r => setOrders(r.data));
        axios.get(`${API}/api/admin/users`, { headers }).then(r => setUsers(r.data));
    }, []);

    const deleteProduct = async (id) => {
        if (!window.confirm('Удалить?')) return;
        await axios.delete(`${API}/api/houses/${id}`, { headers });
        setProducts(products.filter(p => p.id !== id));
    };

    const saveProduct = async (p) => {
        if (p.id) {
            const r = await axios.put(`${API}/api/houses/${p.id}`, p, { headers });
            setProducts(products.map(x => x.id === p.id ? r.data : x));
        } else {
            const r = await axios.post(`${API}/api/houses`, p, { headers });
            setProducts([...products, r.data]);
        }
        setEditProduct(null);
        setNewProduct(null);
    };

    const updateStatus = async (id, status) => {
        await axios.put(`${API}/api/admin/orders/${id}/status`, { status }, { headers });
        setOrders(orders.map(o => o.id === id ? {...o, status} : o));
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Удалить пользователя?')) return;
        await axios.delete(`${API}/api/admin/users/${id}`, { headers });
        setUsers(users.filter(u => u.id !== id));
    };

    const ProductForm = ({ p, onSave, onCancel }) => {
        const [form, setForm] = useState(p || { name:'',description:'',price:'',image_url:'',area:'',plotArea:'',floors:'',bedrooms:'',bathrooms:'' });
        return (
            <div className={styles.formCard}>
                <h3>{p?.id ? 'Редактировать' : 'Новый товар'}</h3>
                <div className={styles.formGrid}>
                    {[['name','Название'],['description','Описание'],['price','Цена'],['image_url','URL фото'],['area','Площадь м²'],['plotArea','Участок м²'],['floors','Этажей'],['bedrooms','Спален'],['bathrooms','Санузлов']].map(([k,l]) => (
                        <div key={k} className={styles.formField}>
                            <label>{l}</label>
                            <input value={form[k] || ''} onChange={e => setForm({...form,[k]:e.target.value})} />
                        </div>
                    ))}
                </div>
                <div className={styles.formActions}>
                    <button className={styles.saveBtn} onClick={() => onSave(form)}>Сохранить</button>
                    <button className={styles.cancelBtn} onClick={onCancel}>Отмена</button>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.brand}>🏠 ДомСтрой — Админ</div>
                <button className={styles.logoutBtn} onClick={handleLogout}>Выйти</button>
            </header>
            <div className={styles.main}>
                <aside className={styles.sidebar}>
                    {[['products','🏠 Товары'],['orders','📦 Заказы'],['users','👥 Пользователи']].map(([t,l]) => (
                        <button key={t} className={tab === t ? styles.tabActive : styles.tab} onClick={() => setTab(t)}>{l}</button>
                    ))}
                </aside>
                <div className={styles.content}>
                    {tab === 'products' && <>
                        <div className={styles.contentHeader}>
                            <h2>Товары ({products.length})</h2>
                            <button className={styles.addBtn} onClick={() => setNewProduct({})}>+ Добавить</button>
                        </div>
                        {newProduct && <ProductForm p={null} onSave={saveProduct} onCancel={() => setNewProduct(null)} />}
                        {editProduct && <ProductForm p={editProduct} onSave={saveProduct} onCancel={() => setEditProduct(null)} />}
                        <div className={styles.productList}>
                            {products.map(p => (
                                <div key={p.id} className={styles.productRow}>
                                    <img src={p.image_url} alt={p.name} />
                                    <div className={styles.productInfo}>
                                        <h4>{p.name}</h4>
                                        <p>{Number(p.price).toLocaleString('ru-RU')} ₽ · {p.area} м²</p>
                                    </div>
                                    <div className={styles.rowActions}>
                                        <button onClick={() => setEditProduct(p)}>✏️</button>
                                        <button onClick={() => deleteProduct(p.id)}>🗑️</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>}
                    {tab === 'orders' && <>
                        <h2>Заказы ({orders.length})</h2>
                        {orders.map(o => (
                            <div key={o.id} className={styles.orderCard}>
                                <div className={styles.orderTop}>
                                    <span>Заказ #{o.id}</span>
                                    <span>{o.name} · {o.phone}</span>
                                    <span>{Number(o.total).toLocaleString('ru-RU')} ₽</span>
                                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} className={styles.statusSelect}>
                                        {['В обработке','Собирается','В пути','Доставлен','Отменен'].map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </>}
                    {tab === 'users' && <>
                        <h2>Пользователи ({users.length})</h2>
                        <table className={styles.table}>
                            <thead><tr><th>ID</th><th>Имя</th><th>Email</th><th>Телефон</th><th>Дата</th><th></th></tr></thead>
                            <tbody>{users.map(u => (
                                <tr key={u.id}>
                                    <td>{u.id}</td><td>{u.username}</td><td>{u.email}</td><td>{u.phone}</td>
                                    <td>{u.created_at?.split(' ')[0]}</td>
                                    <td><button className={styles.delBtn} onClick={() => deleteUser(u.id)}>Удалить</button></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </>}
                </div>
            </div>
        </div>
    );
};

export default AdminAccount;
