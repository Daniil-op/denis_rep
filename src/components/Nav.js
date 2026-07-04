import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Nav.module.css';

const Nav = ({ token }) => (
    <header className={styles.nav}>
        <Link to="/" className={styles.logo}>🏠 ДомСтрой</Link>
        <nav className={styles.links}>
            <Link to="/">Главная</Link>
            <Link to="/compare">Сравнение</Link>
            <Link to="/cart">Корзина</Link>
            {token ? <Link to="/account">Аккаунт</Link> : <>
                <Link to="/login" className={styles.btn}>Войти</Link>
                <Link to="/register" className={styles.btnOutline}>Регистрация</Link>
            </>}
        </nav>
    </header>
);

export default Nav;
