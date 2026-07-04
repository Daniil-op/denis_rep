import React from 'react';
import styles from './Footer.module.css';

const Footer = () => (
    <footer className={styles.footer}>
        <div className={styles.inner}>
            <div className={styles.brand}>🏠 ДомСтрой</div>
            <div className={styles.contacts}>
                <span>📞 8 (800) 355-20-20</span>
                <span>✉️ zakaz@domstroy.ru</span>
                <span>ВКонтакте</span>
                <span>Telegram</span>
            </div>
            <p className={styles.copy}>© 2024 ДомСтрой. Все права защищены.</p>
        </div>
    </footer>
);

export default Footer;
