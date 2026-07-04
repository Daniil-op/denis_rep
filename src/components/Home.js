import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Nav from './Nav';
import Footer from './Footer';
import API from '../api';
import styles from './Home.module.css';

const Home = ({ token }) => {
    const [houses, setHouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [priceFilter, setPriceFilter] = useState('all');

    useEffect(() => {
        axios.get(`${API}/api/houses`).then(r => {
            setHouses(r.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const filtered = houses.filter(h => {
        const matchSearch = h.name.toLowerCase().includes(search.toLowerCase());
        const price = parseFloat(h.price);
        const matchPrice = priceFilter === 'all' ||
            (priceFilter === 'low' && price < 3000000) ||
            (priceFilter === 'mid' && price >= 3000000 && price < 8000000) ||
            (priceFilter === 'high' && price >= 8000000);
        return matchSearch && matchPrice;
    });

    return (
        <div>
            <Nav token={token} />
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>Найдите дом своей мечты</h1>
                    <p>Широкий выбор проектов домов от 1 млн рублей</p>
                    <div className={styles.searchBox}>
                        <input
                            type="text"
                            placeholder="Поиск по названию..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.main}>
                <div className={styles.filters}>
                    <span>Цена:</span>
                    {[['all','Все'],['low','до 3 млн'],['mid','3–8 млн'],['high','от 8 млн']].map(([val,label]) => (
                        <button key={val}
                            className={priceFilter === val ? styles.filterActive : styles.filter}
                            onClick={() => setPriceFilter(val)}>{label}</button>
                    ))}
                </div>

                {loading ? <div className={styles.loading}>Загрузка...</div> : (
                    <div className={styles.grid}>
                        {filtered.map(h => (
                            <Link to={`/product/${h.id}`} key={h.id} className={styles.card}>
                                <div className={styles.cardImg}>
                                    <img src={h.image_url} alt={h.name} />
                                    <div className={styles.badge}>{h.floors} эт.</div>
                                </div>
                                <div className={styles.cardBody}>
                                    <h3>{h.name}</h3>
                                    <div className={styles.specs}>
                                        <span>🏠 {h.area} м²</span>
                                        <span>🛏 {h.bedrooms} спал.</span>
                                        <span>🚿 {h.bathrooms} сан.</span>
                                    </div>
                                    <div className={styles.price}>
                                        от {Number(h.price).toLocaleString('ru-RU')} ₽
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {filtered.length === 0 && <p className={styles.empty}>Ничего не найдено</p>}
                    </div>
                )}
            </div>

            <div className={styles.steps}>
                <div className={styles.stepsInner}>
                    <h2>Как сделать заказ?</h2>
                    <div className={styles.stepsGrid}>
                        {[
                            ['1', 'Выберите дом', 'Просмотрите каталог и выберите подходящий проект'],
                            ['2', 'Добавьте в корзину', 'Нажмите кнопку и сохраните дом в корзине'],
                            ['3', 'Оформите заказ', 'Заполните данные и подтвердите заявку'],
                            ['4', 'Ждите звонка', 'Менеджер свяжется с вами в течение часа'],
                        ].map(([n, title, desc]) => (
                            <div key={n} className={styles.step}>
                                <div className={styles.stepNum}>{n}</div>
                                <h4>{title}</h4>
                                <p>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Home;
