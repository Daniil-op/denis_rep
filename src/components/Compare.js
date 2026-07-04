import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API from '../api';
import Nav from './Nav';
import Footer from './Footer';
import styles from './Compare.module.css';

const Compare = ({ token }) => {
    const [list, setList] = useState([]);

    useEffect(() => {
        if (!token) return;
        axios.get(`${API}/api/compare`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => setList(r.data)).catch(() => {});
    }, [token]);

    const remove = async (id) => {
        await axios.delete(`${API}/api/compare/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setList(list.filter(i => i.id !== id));
    };

    const fields = [
        ['Площадь', i => `${i.area} м²`],
        ['Участок', i => `${i.plotArea} м²`],
        ['Этажей', i => i.floors],
        ['Спален', i => i.bedrooms],
        ['Санузлов', i => i.bathrooms],
        ['Цена', i => `${Number(i.price).toLocaleString('ru-RU')} ₽`],
    ];

    return (
        <div>
            <Nav token={token} />
            <div className={styles.main}>
                <h1>Сравнение домов</h1>
                {!token && <p className={styles.hint}>Войдите чтобы использовать сравнение.</p>}
                {list.length === 0 && token && <div className={styles.empty}><div>⚖️</div><p>Список сравнения пуст</p></div>}
                {list.length > 0 && (
                    <div className={styles.table}>
                        <div className={styles.headers}>
                            <div className={styles.labelCol}></div>
                            {list.map(item => (
                                <div key={item.id} className={styles.col}>
                                    <img src={item.image_url} alt={item.name} />
                                    <h3>{item.name}</h3>
                                    <button onClick={() => remove(item.id)}>Удалить</button>
                                </div>
                            ))}
                        </div>
                        {fields.map(([label, fn]) => (
                            <div key={label} className={styles.row}>
                                <div className={styles.labelCol}>{label}</div>
                                {list.map(item => <div key={item.id} className={styles.col}>{fn(item)}</div>)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Compare;
