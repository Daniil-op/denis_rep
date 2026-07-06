import React, { useEffect, useState } from 'react';
import styles from './ProductPage.module.css';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../images/logo.png';

const ProductPage = ({ token }) => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const config = token ? {
                    headers: { Authorization: `Bearer ${token}` }
                } : {};
                
                const response = await axios.get(
                    `/api/houses/${id}`,
                    config
                );
                
                setProduct(response.data);
            } catch (error) {
                console.error('Failed to fetch product', error);
                if (error.response?.status === 401) {
                    navigate('/login');
                } else {
                    setError('Ошибка загрузки. Попробуйте позже');
                }
            }
        };
    
        fetchProduct();
    }, [id, token, navigate]);

    const handleAddToCart = async () => {
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            await axios.post('/api/cart', { productId: id }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            alert('Product added to cart');
        } catch (error) {
            console.error('Failed to add product to cart', error);
            setError('Failed to add product to cart. Please try again later.');
        }
    };

    const handleCompare = async () => {
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            await axios.post('/api/compare', { productId: id }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            alert('Product added to compare list');
        } catch (error) {
            console.error('Failed to add product to compare list', error);
            setError('Failed to add product to compare list. Please try again later.');
        }
    };

    if (error) {
        return <div>{error}</div>;
    }

    if (!product) {
        return <div>Loading...</div>;
    }

    
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link to="/">
                    <img src={logo} alt="Logo" className={styles.logo} />
                </Link>

                <div className={styles.headerButtons}>
                    <Link to="/">Главная</Link>
                    <Link to="/compare">Сравнение</Link>
                    <Link to="/cart">Корзина</Link>
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
            <div className={styles.productSection}>
                <div className={styles.productImages}>
                    <img src={product.image_url} className={styles.mainImage} />
                </div>
                <div className={styles.productInfo}>
                    <h1>{product.name}</h1>
                    <p>{product.description}</p>
                    <p>Стоимость дома под ключ от {product.price} руб.</p>
                    <p>Срок строительства – от 4 месяцев</p>
                    <button onClick={handleAddToCart} className={styles.addToCartButton}>Добавить в корзину</button>
                    <button onClick={handleCompare} className={styles.compareButton}>Сравнить</button>
                </div>
            </div>
            <div className={styles.productDetails}>
                <div className={styles.detailsSection}>
                    <h2>Основные характеристики</h2>
                    <ul>
                        <li>Общая площадь: {product.area} м²</li>
                        <li>Площадь застройки: {product.plotArea} м²</li>
                        <li>Этажей: {product.floors}</li>
                        <li>Спален: {product.bedrooms}</li>
                        <li>Санузлов: {product.bathrooms}</li>
                    </ul>
                </div>
                <div className={styles.detailsSection}>
                    <h2>Характеристики планировки</h2>
                    <div className={styles.floorPlans}>
                        <div className={styles.floorPlan}>
                            <h3>1 этаж</h3>
                            <ul>
                                <li>Тамбур: 5.56 м²</li>
                                <li>Биллиардная: 8.41 м²</li>
                                <li>Холл: 7.13 м²</li>
                                <li>Кинозал: 2.56 м²</li>
                                <li>Гостиная: 23.18 м²</li>
                                <li>Кухня: 10.64 м²</li>
                                <li>Парилка: 5.30 м²</li>
                                <li>Сан.узел: 10.55 м²</li>
                            </ul>
                        </div>
                        <div className={styles.floorPlan}>
                            <h3>2 этаж</h3>
                            <ul>
                                <li>Холл: 6.34 м²</li>
                                <li>Спальни: 14.45 м²</li>
                                <li>Спальни: 18.43 м²</li>
                                <li>Гардероб: 3.38 м²</li>
                                <li>Сан.узел: 3.54 м²</li>
                                <li>Спальни: 13.67 м²</li>
                                <li>Спальни: 10.89 м²</li>
                            </ul>
                        </div>
                    </div>
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

export default ProductPage;
