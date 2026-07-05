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
    const [sort, setSort] = useState('default');

    useEffect(() => {
        axios.get(`${API}/api/houses`).then(r => {
            setHouses(r.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    let filtered = houses.filter(h => {
        const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) ||
            h.description?.toLowerCase().includes(search.toLowerCase());
        const price = parseFloat(h.price);
        const matchPrice = priceFilter === 'all' ||
            (priceFilter === 'low' && price < 3000000) ||
            (priceFilter === 'mid' && price >= 3000000 && price < 8000000) ||
            (priceFilter === 'high' && price >= 8000000);
        return matchSearch && matchPrice;
    });

    if (sort === 'price_asc') filtered = [...filtered].sort((a,b) => a.price - b.price);
    if (sort === 'price_desc') filtered = [...filtered].sort((a,b) => b.price - a.price);
    if (sort === 'area') filtered = [...filtered].sort((a,b) => b.area - a.area);

    return (
        <div className={styles.page}>
            <Nav token={token} />

            {/* Hero */}
            <section className={styles.hero}>
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <div className={styles.heroBadge}>🏆 Более 20 проектов домов</div>
                    <h1>Найдите дом<br/><span>своей мечты</span></h1>
                    <p>Широкий выбор проектов от 1 млн рублей. Строим быстро и качественно.</p>
                    <div className={styles.searchRow}>
                        <div className={styles.searchBox}>
                            <span className={styles.searchIcon}>🔍</span>
                            <input
                                type="text"
                                placeholder="Поиск по названию или описанию..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <Link to="/compare" className={styles.compareBtn}>Сравнить дома</Link>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className={styles.stats}>
                {[
                    ['20+', 'Проектов домов'],
                    ['500+', 'Довольных клиентов'],
                    ['4 мес', 'Средний срок строительства'],
                    ['10 лет', 'Опыт работы'],
                ].map(([n, l]) => (
                    <div key={l} className={styles.stat}>
                        <b>{n}</b>
                        <span>{l}</span>
                    </div>
                ))}
            </section>

            {/* Catalog */}
            <section className={styles.catalog}>
                <div className={styles.catalogHeader}>
                    <h2>Каталог домов</h2>
                    <div className={styles.controls}>
                        <div className={styles.filters}>
                            {[['all','Все'],['low','до 3 млн'],['mid','3–8 млн'],['high','от 8 млн']].map(([val,label]) => (
                                <button key={val}
                                    className={priceFilter === val ? styles.filterActive : styles.filter}
                                    onClick={() => setPriceFilter(val)}>{label}</button>
                            ))}
                        </div>
                        <select className={styles.sort} value={sort} onChange={e => setSort(e.target.value)}>
                            <option value="default">По умолчанию</option>
                            <option value="price_asc">Цена ↑</option>
                            <option value="price_desc">Цена ↓</option>
                            <option value="area">По площади</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner}/>
                        <p>Загружаем каталог...</p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {filtered.map(h => (
                            <Link to={`/product/${h.id}`} key={h.id} className={styles.card}>
                                <div className={styles.cardImg}>
                                    <img src={h.image_url} alt={h.name} />
                                    <div className={styles.cardOverlay}>
                                        <span>Подробнее →</span>
                                    </div>
                                    <div className={styles.badge}>{h.floors} эт.</div>
                                </div>
                                <div className={styles.cardBody}>
                                    <h3>{h.name}</h3>
                                    <p className={styles.cardDesc}>{h.description?.slice(0,70)}...</p>
                                    <div className={styles.specs}>
                                        <div className={styles.specItem}>
                                            <span>📐</span>
                                            <b>{h.area} м²</b>
                                        </div>
                                        <div className={styles.specItem}>
                                            <span>🛏</span>
                                            <b>{h.bedrooms}</b>
                                        </div>
                                        <div className={styles.specItem}>
                                            <span>🚿</span>
                                            <b>{h.bathrooms}</b>
                                        </div>
                                        <div className={styles.specItem}>
                                            <span>🏢</span>
                                            <b>{h.floors} эт.</b>
                                        </div>
                                    </div>
                                    <div className={styles.cardFooter}>
                                        <div className={styles.price}>
                                            <span>от</span>
                                            <b>{Number(h.price).toLocaleString('ru-RU')} ₽</b>
                                        </div>
                                        <div className={styles.cardBtn}>В каталог</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {filtered.length === 0 && (
                            <div className={styles.empty}>
                                <div>🏠</div>
                                <p>По вашему запросу ничего не найдено</p>
                                <button onClick={() => { setSearch(''); setPriceFilter('all'); }}>Сбросить фильтры</button>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Why us */}
            <section className={styles.why}>
                <div className={styles.whyInner}>
                    <h2>Почему выбирают нас</h2>
                    <div className={styles.whyGrid}>
                        {[
                            ['🏗️', 'Качественное строительство', 'Используем только проверенные материалы и технологии'],
                            ['💰', 'Прозрачные цены', 'Никаких скрытых платежей — фиксированная стоимость'],
                            ['⚡', 'Быстрые сроки', 'Средний срок строительства от 4 месяцев'],
                            ['🛡️', 'Гарантия 5 лет', 'Полная гарантия на все конструктивные элементы'],
                        ].map(([icon, title, desc]) => (
                            <div key={title} className={styles.whyCard}>
                                <div className={styles.whyIcon}>{icon}</div>
                                <h4>{title}</h4>
                                <p>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Steps */}
            <section className={styles.steps}>
                <div className={styles.stepsInner}>
                    <h2>Как сделать заказ?</h2>
                    <div className={styles.stepsRow}>
                        {[
                            ['1', 'Выберите проект', 'Просмотрите каталог и выберите подходящий проект дома'],
                            ['2', 'Добавьте в корзину', 'Нажмите кнопку и сохраните выбранный проект'],
                            ['3', 'Оформите заявку', 'Укажите контактные данные для связи'],
                            ['4', 'Получите звонок', 'Менеджер свяжется с вами в течение часа'],
                        ].map(([n, title, desc], i) => (
                            <React.Fragment key={n}>
                                <div className={styles.step}>
                                    <div className={styles.stepNum}>{n}</div>
                                    <h4>{title}</h4>
                                    <p>{desc}</p>
                                </div>
                                {i < 3 && <div className={styles.stepArrow}>→</div>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className={styles.cta}>
                <div className={styles.ctaInner}>
                    <h2>Готовы начать строительство?</h2>
                    <p>Оставьте заявку и мы поможем подобрать идеальный проект</p>
                    <div className={styles.ctaBtns}>
                        <Link to={token ? '/cart' : '/register'} className={styles.ctaBtn}>
                            {token ? 'Перейти в корзину' : 'Зарегистрироваться'}
                        </Link>
                        <Link to="/compare" className={styles.ctaBtnOutline}>Сравнить проекты</Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Home;
