import React, { useState } from 'react';
import styles from './Home.module.css';
import logo from '../images/logo.png'; // Путь к вашему логотипу
import banner1 from '../images/banner1.png'; // Путь к вашему первому баннеру
import banner2 from '../images/banner2.png'; // Путь к вашему второму баннеру
import { Link } from 'react-router-dom';
import specialistImage from '../images/specialist.png'; // Путь к изображению специалиста
import house1 from '../images/houseim_1.jpg';
import house2 from '../images/houseim_2.jpg';
import house3 from '../images/houseim_3.jpg';
import house4 from '../images/houseim_4.jpg';
import house5 from '../images/houseim_5.jpg';
import house6 from '../images/houseim_6.jpg';
import house7 from '../images/houseim_7.jpg';
import house8 from '../images/houseim_8.jpg';
import step1 from '../images/step1.png';
import step2 from '../images/step2.png';
import step3 from '../images/step3.png';
import step4 from '../images/step4.png';

const Home = ({ token }) => {
    const [currentBanner, setCurrentBanner] = useState(0);
    const banners = [banner1, banner2];

    const handleBannerChange = (index) => {
        setCurrentBanner(index);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link to="/">
                    <img src={logo} alt="Logo" className={styles.logo} />
                </Link>
                
                <div className={styles.headerButtons}>
                    <Link to="/cart">Корзина</Link>
                    <Link to="/compare">Сравнение</Link>
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
            <div className={styles.bannerSlider}>
                <img src={banners[currentBanner]} alt={`Banner ${currentBanner + 1}`} className={styles.bannerImage} />
                <div className={styles.bannerControls}>
                    {banners.map((_, index) => (
                        <button key={index} onClick={() => handleBannerChange(index)} className={currentBanner === index ? styles.active : ''}>
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>
            <div className={styles.filters}>
                <button className={styles.filterButton}>Размер</button>
                <button className={styles.filterButton}>Вид</button>
                <button className={styles.filterButton}>Материал</button>
                <button className={styles.filterButton}>Цена</button>
            </div>
            <div className={styles.houseCards}>
                <div className={styles.houseCard}>
                    <Link to="/product/1">
                        <img src={house1} alt="House 1" className={styles.houseImage} />
                    </Link>
                    <h3>Прованс</h3>
                    <p>1 000 000 руб. 100 м²</p>
                </div>
                <div className={styles.houseCard}>
                    <Link to="/product/2">
                        <img src={house2} alt="House 2" className={styles.houseImage} />
                    </Link>
                    <h3>Классический</h3>
                    <p>1 000 000 руб. 100 м²</p>
                </div>
                <div className={styles.houseCard}>
                    <Link to="/product/3">
                        <img src={house3} alt="House 3" className={styles.houseImage} />
                    </Link>
                    <h3>Маяк</h3>
                    <p>1 000 000 руб. 100 м²</p>
                </div>
                <div className={styles.houseCard}>
                    <Link to="/product/4">
                        <img src={house4} alt="House 4" className={styles.houseImage} />
                    </Link>
                    <h3>Шале</h3>
                    <p>8 000 000 руб. 100 м²</p>
                </div>
                <div className={styles.houseCard}>
                    <Link to="/product/5">
                        <img src={house5} alt="House 5" className={styles.houseImage} />
                    </Link>
                    <h3>Русский</h3>
                    <p>1 000 000 руб. 100 м²</p>
                </div>
                <div className={styles.houseCard}>
                    <Link to="/product/6">
                        <img src={house6} alt="House 6" className={styles.houseImage} />
                    </Link>
                    <h3>Романский</h3>
                    <p>7 000 000 руб. 400 м²</p>
                </div>
                <div className={styles.houseCard}>
                    <Link to="/product/7">
                        <img src={house7} alt="House 7" className={styles.houseImage} />
                    </Link>
                    <h3>Скандинавский</h3>
                    <p>7 000 000 руб. 100 м²</p>
                </div>
                <div className={styles.houseCard}>
                    <Link to="/product/8">
                        <img src={house8} alt="House 8" className={styles.houseImage} />
                    </Link>
                    <h3>Фахверк</h3>
                    <p>6 000 000 руб. 100 м²</p>
                </div>
            </div>
            <button className={styles.showMoreButton}>Показать ещё</button>
            <div className={styles.specialistCard}>
                <div className={styles.specialistImageWrapper}>
                    <img src={specialistImage} alt="Specialist" className={styles.specialistImage} />
                    <h3>Максим Сурдин</h3>
                </div>
                <div className={styles.specialistInfo}>
                    <p>Руководитель отдела продаж</p>
                    <ul className={styles.contactList}>
                        <li>+7 485 383 10 52</li>
                        <li>zakaz@stroi.ru</li>
                        <li>г. Новосибирск, ул. Советская, д. 23, оф. 401</li>
                    </ul>
                </div>
            </div>
            <div className={styles.instructionSection}>
                <h2>Как сделать заказ?</h2>
                <div className={styles.instructionSteps}>
                    <div className={styles.instructionStep}>
                        <div className={styles.instructionIcon}>
                            <img src={step1} />
                        </div>
                        <div className={styles.stepNumber}>1</div>
                        <p>Первым шагом определитесь с выбором дома, по желанию посоветуйтесь с нашим консультантом</p>
                    </div>
                    <div className={styles.instructionStep}>
                        <div className={styles.instructionIcon}>
                            <img src={step2} />
                        </div>
                        <div className={styles.stepNumber}>2</div>
                        <p>Вторым шагом добавьте понравившийся дом в корзину</p>
                    </div>
                    <div className={styles.instructionStep}>
                        <div className={styles.instructionIcon}>
                            <img src={step3} />
                        </div>
                        <div className={styles.stepNumber}>3</div>
                        <p>Третьим шагом оплатите заказ, выбрав один из нескольких вариантов оплаты</p>
                    </div>
                    <div className={styles.instructionStep}>
                        <div className={styles.instructionIcon}>
                            <img src={step4} />
                        </div>
                        <div className={styles.stepNumber}>4</div>
                        <p>Четвертым шагом ожидайте звонка нашего менеджера, который проведет контрольную явку до покупки завершения</p>
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

export default Home;
