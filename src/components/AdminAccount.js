import React, { useEffect, useState } from 'react';
import styles from './AdminAccount.module.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../images/logo.png';

const AdminAccount = ({ handleLogout }) => {
    // Все состояния перенесены внутрь компонента
    const [reports, setReports] = useState({
        summary: {},
        productsStats: [],
        usersActivity: []
    });

    const [reportsLoading, setReportsLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('products');
    const [statusUpdates, setStatusUpdates] = useState({});
    const [editingProduct, setEditingProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        image_url: '',
        area: '',
        plotArea: '',
        floors: '',
        bedrooms: '',
        bathrooms: ''
    });
    const [isLoading, setIsLoading] = useState({
        products: true,
        orders: true,
        users: true
    });

    // Функция для загрузки отчетов (перенесена внутрь компонента)
    const loadReports = async () => {
        setReportsLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            
            // Загрузка всех отчетов параллельно
            const [summaryRes, productsRes, usersRes] = await Promise.all([
                axios.get('/api/admin/reports/summary', 
                    { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/admin/reports/products-stats', 
                    { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/admin/reports/users-activity', 
                    { headers: { Authorization: `Bearer ${token}` } })
            ]);
            
            setReports({
                summary: summaryRes.data,
                productsStats: productsRes.data,
                usersActivity: usersRes.data
            });
        } catch (error) {
            console.error('Ошибка загрузки отчетов:', error);
            alert(`Ошибка загрузки отчетов: ${error.response?.data?.error || error.message}`);
        } finally {
            setReportsLoading(false);
        }
    };

    // Обработчик изменения статуса заказа
    const handleStatusChange = (orderId, newStatus) => {
        setStatusUpdates(prev => ({ ...prev, [orderId]: newStatus }));
    };

    // Сохранение статуса заказа
    const saveStatus = async (orderId) => {
        try {
            const token = localStorage.getItem('adminToken');
            const newStatus = statusUpdates[orderId];
            
            await axios.put(
                `/api/admin/orders/${orderId}/status`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            setOrders(orders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
            setStatusUpdates(prev => ({ ...prev, [orderId]: undefined }));
            
            alert('Статус заказа успешно обновлен!');
        } catch (error) {
            console.error('Ошибка обновления статуса:', error);
            alert(`Ошибка обновления статуса: ${error.response?.data?.error || error.message}`);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            window.location.href = '/login';
            return;
        }
        
        const fetchData = async () => {
            try {
                setIsLoading({
                    products: true,
                    orders: true,
                    users: true
                });
                
                const token = localStorage.getItem('adminToken');
                
                // Загрузка товаров
                const productsResponse = await axios.get(
                    '/api/houses',
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setProducts(productsResponse.data);
                setIsLoading(prev => ({ ...prev, products: false }));
                
                // Загрузка пользователей
                const usersResponse = await axios.get(
                    '/api/admin/users',
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setUsers(usersResponse.data);
                setIsLoading(prev => ({ ...prev, users: false }));
                
                // Загрузка заказов
                const ordersResponse = await axios.get(
                    '/api/admin/orders',
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setOrders(ordersResponse.data);
                setIsLoading(prev => ({ ...prev, orders: false }));
                
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
                alert(`Ошибка загрузки данных: ${error.response?.data?.error || error.message}`);
                
                setIsLoading({
                    products: false,
                    orders: false,
                    users: false
                });
            }
        };

        fetchData();
    }, []);

    // Обработчики для товаров
    const handleAddProduct = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            // Преобразуем числовые поля
            const productToSend = {
                ...newProduct,
                price: parseFloat(newProduct.price) || 0,
                area: parseFloat(newProduct.area) || 0,
                plotArea: parseFloat(newProduct.plotArea) || 0,
                floors: parseInt(newProduct.floors) || 0,
                bedrooms: parseInt(newProduct.bedrooms) || 0,
                bathrooms: parseInt(newProduct.bathrooms) || 0
            };
            
            const response = await axios.post(
                '/api/houses', 
                productToSend,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setProducts([...products, response.data]);
            setNewProduct({
                name: '',
                description: '',
                price: '',
                image_url: '',
                area: '',
                plotArea: '',
                floors: '',
                bedrooms: '',
                bathrooms: ''
            });
            
            alert('Товар успешно добавлен!');
        } catch (error) {
            console.error('Ошибка добавления товара:', error);
            alert(`Ошибка добавления товара: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleEditProduct = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            // Преобразуем числовые поля
            const productToSend = {
                ...editingProduct,
                price: parseFloat(editingProduct.price) || 0,
                area: parseFloat(editingProduct.area) || 0,
                plotArea: parseFloat(editingProduct.plotArea) || 0,
                floors: parseInt(editingProduct.floors) || 0,
                bedrooms: parseInt(editingProduct.bedrooms) || 0,
                bathrooms: parseInt(editingProduct.bathrooms) || 0
            };
            
            await axios.put(
                `/api/houses/${editingProduct.id}`, 
                productToSend,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setProducts(products.map(p => 
                p.id === editingProduct.id ? productToSend : p
            ));
            setEditingProduct(null);
            
            alert('Товар успешно обновлен!');
        } catch (error) {
            console.error('Ошибка редактирования товара:', error);
            alert(`Ошибка редактирования товара: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleDeleteProduct = async (productId) => {
        try {
            if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) return;
            
            const token = localStorage.getItem('adminToken');
            await axios.delete(
                `/api/houses/${productId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setProducts(products.filter(p => p.id !== productId));
            alert('Товар успешно удален!');
        } catch (error) {
            console.error('Ошибка удаления товара:', error);
            alert(`Ошибка удаления товара: ${error.response?.data?.error || error.message}`);
        }
    };

    // Обработчики для пользователей
    const handleDeleteUser = async (userId) => {
        try {
            if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) return;
            
            const token = localStorage.getItem('adminToken');
            await axios.delete(
                `/api/admin/users/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setUsers(users.filter(u => u.id !== userId));
            alert('Пользователь успешно удален!');
        } catch (error) {
            console.error('Ошибка удаления пользователя:', error);
            alert(`Ошибка удаления пользователя: ${error.response?.data?.error || error.message}`);
        }
    };

    // Обработчик изменения полей нового товара
    const handleNewProductChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({ ...prev, [name]: value }));
    };

    // Обработчик изменения полей редактируемого товара
    const handleEditProductChange = (e) => {
        const { name, value } = e.target;
        setEditingProduct(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link to="/">
                    <img src={logo} alt="Logo" className={styles.logo} />
                </Link>
                <div className={styles.headerButtons}>
                    <Link to="/">Главная</Link>
                    <button onClick={handleLogout}>Выйти</button>
                </div>
            </header>
    
            <div className={styles.adminSection}>
                <div className={styles.tabs}>
                    <button 
                        onClick={() => setActiveTab('products')}
                        className={activeTab === 'products' ? styles.activeTab : ''}
                    >
                        Товары
                    </button>
                    <button 
                        onClick={() => setActiveTab('orders')}
                        className={activeTab === 'orders' ? styles.activeTab : ''}
                    >
                        Заказы
                    </button>
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={activeTab === 'users' ? styles.activeTab : ''}
                    >
                        Пользователи
                    </button>
                    <button 
                        onClick={() => {
                            setActiveTab('reports');
                            if (!reports.summary) loadReports();
                        }}
                        className={activeTab === 'reports' ? styles.activeTab : ''}
                    >
                        Отчеты
                    </button>
                </div>
    
                {/* Вкладка товаров */}
                {activeTab === 'products' && (
                    <div className={styles.tabContent}>
                        <h2>Управление товарами</h2>
                        
                        {/* Форма добавления/редактирования товара */}
                        {editingProduct ? (
                            <div className={styles.productForm}>
                                <h3>Редактировать товар</h3>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Название"
                                    value={editingProduct.name}
                                    onChange={handleEditProductChange}
                                />
                                <textarea
                                    name="description"
                                    placeholder="Описание"
                                    value={editingProduct.description}
                                    onChange={handleEditProductChange}
                                />
                                <input
                                    type="number"
                                    name="price"
                                    placeholder="Цена"
                                    value={editingProduct.price}
                                    onChange={handleEditProductChange}
                                />
                                <input
                                    type="text"
                                    name="image_url"
                                    placeholder="URL изображения"
                                    value={editingProduct.image_url}
                                    onChange={handleEditProductChange}
                                />
                                <div className={styles.specsGrid}>
                                    <input
                                        type="number"
                                        name="area"
                                        placeholder="Общая площадь"
                                        value={editingProduct.area}
                                        onChange={handleEditProductChange}
                                    />
                                    <input
                                        type="number"
                                        name="plotArea"
                                        placeholder="Площадь застройки"
                                        value={editingProduct.plotArea}
                                        onChange={handleEditProductChange}
                                    />
                                    <input
                                        type="number"
                                        name="floors"
                                        placeholder="Этажи"
                                        value={editingProduct.floors}
                                        onChange={handleEditProductChange}
                                    />
                                    <input
                                        type="number"
                                        name="bedrooms"
                                        placeholder="Спальни"
                                        value={editingProduct.bedrooms}
                                        onChange={handleEditProductChange}
                                    />
                                    <input
                                        type="number"
                                        name="bathrooms"
                                        placeholder="Санузлы"
                                        value={editingProduct.bathrooms}
                                        onChange={handleEditProductChange}
                                    />
                                </div>
                                <div className={styles.formButtons}>
                                    <button onClick={handleEditProduct}>Сохранить</button>
                                    <button onClick={() => setEditingProduct(null)}>Отмена</button>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.productForm}>
                                <h3>Добавить новый товар</h3>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Название"
                                    value={newProduct.name}
                                    onChange={handleNewProductChange}
                                />
                                <textarea
                                    name="description"
                                    placeholder="Описание"
                                    value={newProduct.description}
                                    onChange={handleNewProductChange}
                                />
                                <input
                                    type="number"
                                    name="price"
                                    placeholder="Цена"
                                    value={newProduct.price}
                                    onChange={handleNewProductChange}
                                />
                                <input
                                    type="text"
                                    name="image_url"
                                    placeholder="URL изображения"
                                    value={newProduct.image_url}
                                    onChange={handleNewProductChange}
                                />
                                <div className={styles.specsGrid}>
                                    <input
                                        type="number"
                                        name="area"
                                        placeholder="Общая площадь"
                                        value={newProduct.area}
                                        onChange={handleNewProductChange}
                                    />
                                    <input
                                        type="number"
                                        name="plotArea"
                                        placeholder="Площадь застройки"
                                        value={newProduct.plotArea}
                                        onChange={handleNewProductChange}
                                    />
                                    <input
                                        type="number"
                                        name="floors"
                                        placeholder="Этажи"
                                        value={newProduct.floors}
                                        onChange={handleNewProductChange}
                                    />
                                    <input
                                        type="number"
                                        name="bedrooms"
                                        placeholder="Спальни"
                                        value={newProduct.bedrooms}
                                        onChange={handleNewProductChange}
                                    />
                                    <input
                                        type="number"
                                        name="bathrooms"
                                        placeholder="Санузлы"
                                        value={newProduct.bathrooms}
                                        onChange={handleNewProductChange}
                                    />
                                </div>
                                <button onClick={handleAddProduct}>Добавить товар</button>
                            </div>
                        )}
                        
                        {/* Список товаров */}
                        <div className={styles.productsList}>
                            {isLoading.products ? (
                                <p>Загрузка товаров...</p>
                            ) : products.length > 0 ? products.map(product => (
                                <div key={product.id} className={styles.productCard}>
                                    <img src={product.image_url} alt={product.name} className={styles.productImage} />
                                    <div className={styles.productInfo}>
                                        <h3>{product.name}</h3>
                                        <p>{product.description}</p>
                                        <p>Цена: {product.price} руб.</p>
                                        <div className={styles.productSpecs}>
                                            <span>Площадь: {product.area} м²</span>
                                            <span>Этажи: {product.floors}</span>
                                            <span>Спальни: {product.bedrooms}</span>
                                        </div>
                                    </div>
                                    <div className={styles.productActions}>
                                        <button onClick={() => setEditingProduct(product)}>Редактировать</button>
                                        <button onClick={() => handleDeleteProduct(product.id)}>Удалить</button>
                                    </div>
                                </div>
                            )) : (
                                <p>Товаров не найдено</p>
                            )}
                        </div>
                    </div>
                )}
    
                {/* Вкладка заказов */}
                {activeTab === 'orders' && (
                    <div className={styles.tabContent}>
                        <h2>Управление заказами</h2>
                        <div className={styles.ordersList}>
                            {isLoading.orders ? (
                                <p>Загрузка заказов...</p>
                            ) : orders.length > 0 ? orders.map(order => (
                                <div key={order.id} className={styles.orderCard}>
                                    <div className={styles.orderHeader}>
                                        <div>
                                            <strong>Заказ #{order.id}</strong>
                                            <span>Статус: {order.status}</span>
                                        </div>
                                        <div>
                                            <span>Дата: {new Date(order.created_at).toLocaleDateString()}</span>
                                            <span>Клиент: {order.name}</span>
                                        </div>
                                    </div>
                                    
                                    <div className={styles.orderDetails}>
                                        <h4>Товары:</h4>
                                        <div className={styles.orderItems}>
                                            {Array.isArray(order.items) ? 
                                                order.items.map((item, index) => (
                                                    <div key={index} className={styles.orderItem}>
                                                        <span>{item.name}</span>
                                                        <span>{item.price} руб.</span>
                                                    </div>
                                                ))
                                                : <div>Невозможно отобразить товары в заказе</div>
                                            }
                                        </div>
                                        <div className={styles.orderTotal}>
                                            <strong>Итого:</strong>
                                            <span>{order.total} руб.</span>
                                        </div>
                                    </div>
                                    
                                    <div className={styles.orderActions}>
                                        <select 
                                            value={statusUpdates[order.id] || order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        >
                                            <option value="В обработке">В обработке</option>
                                            <option value="Собирается">Собирается</option>
                                            <option value="В пути">В пути</option>
                                            <option value="Доставлен">Доставлен</option>
                                            <option value="Отменен">Отменен</option>
                                        </select>
                                        <button 
                                            onClick={() => saveStatus(order.id)}
                                            disabled={!statusUpdates[order.id] || statusUpdates[order.id] === order.status}
                                        >
                                            Обновить статус
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <p>Заказов не найдено</p>
                            )}
                        </div>
                    </div>
                )}
    
                {/* Вкладка пользователей */}
                {activeTab === 'users' && (
                    <div className={styles.tabContent}>
                        <h2>Управление пользователями</h2>
                        <div className={styles.usersList}>
                            {isLoading.users ? (
                                <p>Загрузка пользователей...</p>
                            ) : users.length > 0 ? users.map(user => (
                                <div key={user.id} className={styles.userCard}>
                                    <div className={styles.userInfo}>
                                        <h3>{user.username}</h3>
                                        <p>Email: {user.email}</p>
                                        <p>Телефон: {user.phone || 'Не указан'}</p>
                                        <p>Зарегистрирован: {new Date(user.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className={styles.userActions}>
                                        <button onClick={() => handleDeleteUser(user.id)}>Удалить</button>
                                    </div>
                                </div>
                            )) : (
                                <p>Пользователей не найдено</p>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Вкладка отчетов */}
                {activeTab === 'reports' && (
                    <div className={styles.tabContent}>
                        <h2>Статистические отчеты</h2>
                        <button onClick={loadReports} className={styles.refreshButton}>
                            Обновить отчеты
                        </button>
                        
                        {reportsLoading ? (
                            <p>Загрузка отчетов...</p>
                        ) : (
                            <div className={styles.reportsContainer}>
                                {/* Сводная статистика */}
                                {reports.summary && (
                                    <div className={styles.summaryCard}>
                                        <h3>Сводная статистика</h3>
                                        <div className={styles.summaryGrid}>
                                            <div className={styles.summaryItem}>
                                                <h4>Товары</h4>
                                                <p>
                                                    {reports.summary.totalProducts?.total || 
                                                    reports.summary.totalProducts || 
                                                    0}
                                                </p>
                                            </div>
                                            <div className={styles.summaryItem}>
                                                <h4>Пользователи</h4>
                                                <p>
                                                    {reports.summary.totalUsers?.total || 
                                                    reports.summary.totalUsers || 
                                                    0}
                                                </p>
                                            </div>
                                            <div className={styles.summaryItem}>
                                                <h4>Заказы</h4>
                                                <p>
                                                    {reports.summary.totalOrders?.total || 
                                                    reports.summary.totalOrders || 
                                                    0}
                                                </p>
                                            </div>
                                            <div className={styles.summaryItem}>
                                                <h4>Выручка</h4>
                                                <p>
                                                    {reports.summary.totalRevenue?.total || 
                                                    reports.summary.totalRevenue || 
                                                    0} руб.
                                                </p>
                                            </div>
                                            <div className={styles.summaryItem}>
                                                <h4>Популярный товар</h4>
                                                <p>{reports.summary.popularProduct?.name || 'Нет данных'}</p>
                                                <p>
                                                    {(reports.summary.popularProduct?.orders_count?.total || 
                                                    reports.summary.popularProduct?.orders_count || 
                                                    0)} заказов
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Статистика по товарам */}
                                <div className={styles.reportSection}>
                                    <h3>Статистика по товарам</h3>
                                    {reports.productsStats.length > 0 ? (
                                        <>
                                            <div className={styles.tableContainer}>
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th>Товар</th>
                                                            <th>Заказов</th>
                                                            <th>Выручка</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {reports.productsStats.map((product, index) => {
                                                            const safeOrderCount = product.order_count?.total || 0;
                                                            const safeRevenue = product.total_revenue?.total || 0;

                                                            return (
                                                                <tr key={index}>
                                                                    <td>{product.name}</td>
                                                                    <td>{safeOrderCount}</td>
                                                                    <td>{safeRevenue} руб.</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </>
                                    ) : (
                                        <p>Нет данных о товарах</p>
                                    )}
                                </div>
                                
                                {/* Активность пользователей */}
                                <div className={styles.reportSection}>
                                    <h3>Активность пользователей</h3>
                                    {reports.usersActivity.length > 0 ? (
                                        <div className={styles.tableContainer}>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Пользователь</th>
                                                        <th>Email</th>
                                                        <th>Заказов</th>
                                                        <th>Потрачено</th>
                                                        <th>Последний заказ</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reports.usersActivity.map((user, index) => {
                                                        const safeSpentAmount = user.total_spent?.total || 0;
                                                        
                                                        return (
                                                            <tr key={index}>
                                                                <td>{user.username}</td>
                                                                <td>{user.email}</td>
                                                                <td>{user.order_count}</td>
                                                                <td>{safeSpentAmount} руб.</td>
                                                                <td>{user.last_order_date ? new Date(user.last_order_date).toLocaleDateString() : 'Нет заказов'}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p>Нет данных о пользователях</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
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

export default AdminAccount;