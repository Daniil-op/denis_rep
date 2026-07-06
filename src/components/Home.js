import React, { useState, useEffect } from 'react';
import styles from './Home.module.css';
import logo from '../images/logo.png'; // Путь к вашему логотипу
import banner1 from '../images/banner1.png'; // Путь к вашему первому баннеру
import banner2 from '../images/banner2.png'; // Путь к вашему второму баннеру
import { Link } from 'react-router-dom';
import axios from 'axios';
import specialistImage from '../images/specialist.png'; // Путь к изображению специалиста
import step1 from '../images/step1.png';
import step2 from '../images/step2.png';
import step3 from '../images/step3.png';
import step4 from '../images/step4.png';

const Home = ({ token }) => {
    const ITEMS_PER_PAGE = 6;

    const [currentBanner, setCurrentBanner] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    
    const banners = [banner1, banner2];
    const [houses, setHouses] = useState([]); // Добавлено состояние для домов
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleBannerChange = (index) => {
        setCurrentBanner(index);
    };

    console.log('Состояние:', {
        housesCount: houses.length,
        currentPage,
        visible: currentPage * ITEMS_PER_PAGE,
        hasMore: currentPage * ITEMS_PER_PAGE < houses.length
    });

    useEffect(() => {
        const fetchHouses = async () => {
            try {
                const response = await axios.get('/api/houses');
                console.log('Ответ API:', response.data); // Проверка данных с сервера
                setHouses(response.data);
            } catch (err) {
                setError('Ошибка загрузки');
                console.error('Ошибка API:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHouses();
    }, []);

    const visibleHouses = houses.slice(0, currentPage * ITEMS_PER_PAGE);
    const hasMore = currentPage * ITEMS_PER_PAGE < houses.length;

    const handleShowMore = () => {
        hasMore ? setCurrentPage(p => p + 1) : setCurrentPage(1);
    };

    // 4. Условия отображения
    if (loading) return <div className={styles.loading}>Загрузка...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

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
            <div className={styles.houseCards}>
                {visibleHouses.map(house => (
                    <div key={house.id} className={styles.houseCard}>
                        <Link to={`/products/${house.id}`}>
                            <img 
                                src={house.image_url} 
                                alt={house.name}
                                className={styles.houseImage}
                            />
                        </Link>
                        <h3>{house.name}</h3>
                        <div className={styles.houseSpecs}>
                            <p>Цена: {new Intl.NumberFormat('ru-RU').format(house.price)} руб.</p>
                            <p>Площадь: {house.area} м²</p>
                            <p>Этажей: {house.floors}</p>
                        </div>
                    </div>
                ))}
            </div>

            {houses.length > 0 && (
                <div className={styles.pagination}>
                    <button 
                        onClick={handleShowMore}
                        className={styles.showMoreButton}
                    >
                        {hasMore ? 'Показать ещё' : 'Скрыть'}
                    </button>
                    <span>
                        Страница {currentPage} | 
                        Показано {visibleHouses.length} из {houses.length}
                    </span>
                </div>
            )}
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
                            <img src={step1} alt="Шаг 1 - Выбор дома"/>
                        </div>
                        <div className={styles.stepNumber}>1</div>
                        <p>Первым шагом определитесь с выбором дома, по желанию посоветуйтесь с нашим консультантом</p>
                    </div>
                    <div className={styles.instructionStep}>
                        <div className={styles.instructionIcon}>
                            <img src={step2} alt="Шаг 2 - Добавление в корзину"/>
                        </div>
                        <div className={styles.stepNumber}>2</div>
                        <p>Вторым шагом добавьте понравившийся дом в корзину</p>
                    </div>
                    <div className={styles.instructionStep}>
                        <div className={styles.instructionIcon}>
                            <img src={step3} alt="Шаг 3 - Оплата"/>
                        </div>
                        <div className={styles.stepNumber}>3</div>
                        <p>Третьим шагом оплатите заказ, выбрав один из нескольких вариантов оплаты</p>
                    </div>
                    <div className={styles.instructionStep}>
                        <div className={styles.instructionIcon}>
                            <img src={step4} alt="Шаг 4 - Подтверждение"/>
                            
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
