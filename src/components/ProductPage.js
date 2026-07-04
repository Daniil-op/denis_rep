import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API from '../api';
import Nav from './Nav';
import Footer from './Footer';
import styles from './ProductPage.module.css';

const ProductPage = ({ token }) => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${API}/api/houses/${id}`)
            .then(r => { setProduct(r.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [id]);

    const addToCart = async () => {
        if (!token) { navigate('/login'); return; }
        try {
            await axios.post(`${API}/api/cart`, { productId: id }, { headers: { Authorization: `Bearer ${token}` } });
            setMsg('✅ Добавлено в корзину');
        } catch { setMsg('❌ Ошибка'); }
    };

    const addToCompare = async () => {
        if (!token) { navigate('/login'); return; }
        try {
            await axios.post(`${API}/api/compare`, { productId: id }, { headers: { Authorization: `Bearer ${token}` } });
            setMsg('✅ Добавлено в сравнение');
        } catch { setMsg('❌ Ошибка'); }
    };

    if (loading) return <div><Nav token={token} /><div className={styles.loading}>Загрузка...</div></div>;
    if (!product) return <div><Nav token={token} /><div className={styles.loading}>Дом не найден</div></div>;

    return (
        <div>
            <Nav token={token} />
            <div className={styles.main}>
                <div className={styles.imgWrap}>
                    <img src={product.image_url} alt={product.name} />
                </div>
                <div className={styles.info}>
                    <h1>{product.name}</h1>
                    <p className={styles.desc}>{product.description}</p>
                    <div className={styles.price}>от {Number(product.price).toLocaleString('ru-RU')} ₽</div>
                    <div className={styles.specs}>
                        <div className={styles.spec}><span>Площадь</span><b>{product.area} м²</b></div>
                        <div className={styles.spec}><span>Участок</span><b>{product.plotArea} м²</b></div>
                        <div className={styles.spec}><span>Этажей</span><b>{product.floors}</b></div>
                        <div className={styles.spec}><span>Спален</span><b>{product.bedrooms}</b></div>
                        <div className={styles.spec}><span>Санузлов</span><b>{product.bathrooms}</b></div>
                        <div className={styles.spec}><span>Срок</span><b>от 4 мес.</b></div>
                    </div>
                    {msg && <div className={styles.msg}>{msg}</div>}
                    <div className={styles.actions}>
                        <button className={styles.btnPrimary} onClick={addToCart}>В корзину</button>
                        <button className={styles.btnSecondary} onClick={addToCompare}>Сравнить</button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ProductPage;
