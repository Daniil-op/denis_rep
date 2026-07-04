import React, { useState, useEffect } from 'react';
import styles from './Compare.module.css';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../images/logo.png';

const Compare = ({ token }) => {
    const [compareList, setCompareList] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCompareList = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/compare', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setCompareList(response.data);
            } catch (error) {
                console.error('Failed to fetch compare list', error);
            }
        };

        fetchCompareList();
    }, [token]);

    const handleRemoveFromCompare = (productId) => {
        const updatedCompareList = compareList.filter(item => item.id !== productId);
        setCompareList(updatedCompareList);

        const removeFromCompare = async () => {
            try {
                const response = await axios.delete(`http://localhost:5000/api/compare/${productId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                alert('Product removed from compare list');
            } catch (error) {
                console.error('Failed to remove product from compare list', error);
            }
        };

        removeFromCompare();
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link to="/">
                    <img src={logo} alt="Logo" className={styles.logo} />
                </Link>
                
                <div className={styles.headerButtons}>
                    <Link to="/">Главная</Link>
                    <Link to="/cart">Корзина</Link>
                    {token ? (
                        <Link to="/account">Аккаунт</Link>
                    ) : (
                        <>
                            <Link to="/login">Вход</Link>
                            <Link to="/register">Регистрация</Link>
                        </>
                    )}
                </div>
            </header>
            <div className={styles.compareSection}>
                <h1>Список сравнения</h1>
                {compareList.length > 0 ? (
                    compareList.map(item => (
                        <div key={item.id} className={styles.compareItem}>
                            <img src={item.image_url} alt={item.name} className={styles.compareImage} />
                            <div className={styles.compareDetails}>
                                <h2>{item.name}</h2>
                                <p>Общая площадь: {item.area} м²</p>
                                <p>Площадь застройки: {item.plotArea} м²</p>
                                <p>Этажей: {item.floors}</p>
                                <p>Спален: {item.bedrooms}</p>
                                <p>Санузлов: {item.bathrooms}</p>
                            </div>
                            <button onClick={() => handleRemoveFromCompare(item.id)} className={styles.removeButton}>Удалить</button>
                        </div>
                    ))
                ) : (
                    <p>Ваш список сравнения пуст.</p>
                )}
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

export default Compare;
