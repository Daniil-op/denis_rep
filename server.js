const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
    credentials: false
}));
app.use(bodyParser.json());

// Пул соединений — автоматически переподключается при разрыве
const db = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'house_sales',
    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
});

// Автоматическое создание таблиц при запуске (если их нет)
function initTables() {
    const tables = [
        `CREATE TABLE IF NOT EXISTS users (
            id INT NOT NULL AUTO_INCREMENT,
            username VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            email VARCHAR(255) DEFAULT NULL,
            phone VARCHAR(255) DEFAULT NULL,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        )`,
        `CREATE TABLE IF NOT EXISTS admins (
            id INT NOT NULL AUTO_INCREMENT,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY email (email)
        )`,
        `CREATE TABLE IF NOT EXISTS houses (
            id INT NOT NULL AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(12,2) NOT NULL,
            image_url VARCHAR(500) NOT NULL,
            area DECIMAL(10,2) DEFAULT NULL,
            plotArea DECIMAL(10,2) DEFAULT NULL,
            floors INT DEFAULT NULL,
            bedrooms INT DEFAULT NULL,
            bathrooms INT DEFAULT NULL,
            PRIMARY KEY (id)
        )`,
        `CREATE TABLE IF NOT EXISTS orders (
            id INT NOT NULL AUTO_INCREMENT,
            userId INT NOT NULL,
            items TEXT NOT NULL,
            total DECIMAL(12,2) NOT NULL,
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            email VARCHAR(255) NOT NULL,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(50) DEFAULT 'В обработке',
            PRIMARY KEY (id)
        )`,
        `CREATE TABLE IF NOT EXISTS cart (
            id INT NOT NULL AUTO_INCREMENT,
            userId INT NOT NULL,
            productId INT NOT NULL,
            PRIMARY KEY (id)
        )`,
        `CREATE TABLE IF NOT EXISTS compare (
            id INT NOT NULL AUTO_INCREMENT,
            userId INT NOT NULL,
            productId INT NOT NULL,
            PRIMARY KEY (id)
        )`,
        `CREATE TABLE IF NOT EXISTS notifications (
            id INT NOT NULL AUTO_INCREMENT,
            message TEXT NOT NULL,
            user_id INT DEFAULT NULL,
            is_admin TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        )`,
    ];

    // Выполняем последовательно — Filess.io имеет лимит 5 соединений
    let idx = 0;
    function nextTable() {
        if (idx >= tables.length) {
            afterTables();
            return;
        }
        db.query(tables[idx], (err) => {
            if (err) console.error('Ошибка создания таблицы:', err.message);
            idx++;
            setTimeout(nextTable, 200);
        });
    }
    nextTable();

    function afterTables() {
        const adminPass = bcrypt.hashSync('admin123', 8);
        db.query(
            'INSERT IGNORE INTO admins (email, password) VALUES (?, ?)',
            ['admin@example.com', adminPass],
            (err) => {
                if (err) console.error('Ошибка админа:', err.message);
                db.query('SELECT COUNT(*) as n, COUNT(DISTINCT image_url) as imgs FROM houses', (err, r) => {
                    if (err) { console.error('Ошибка проверки houses:', err.message); return; }
                    if (r[0].n === 0) {
                        console.log('Таблица houses пустая, заполняю...');
                        seedHouses();
                    } else if (r[0].imgs <= 1 && r[0].n > 1) {
                        console.log('У всех домов одинаковые картинки, обновляю...');
                        fixImages();
                    } else {
                        console.log(`Таблица houses: ${r[0].n} записей`);
                    }
                });
            }
        );
    }
    console.log('Инициализация таблиц запущена');
}

function seedHouses() {
    const base = 'https://m-strana.ru/upload/resize_cache/sprint.editor/';
    const houses = [
        ['Прованс', 'Уютный дом в стиле Прованс для тех, кто ценит комфорт.', 1000000, base+'ce4/830_830_1/ce4547fce3a063d5b6ea6f6f27becce7.webp', 135, 193, 2, 3, 2],
        ['Классический', 'Классический дом с элегантным дизайном и просторными комнатами.', 1700000, base+'64d/830_830_1/64dfc1e8d8847c01fd12a55d69b30139.webp', 127, 184, 2, 3, 2],
        ['Маяк', 'Дом в стиле Маяк с современным дизайном.', 1000000, base+'54c/830_830_1/54ca31043ec6734085d2c69daae85372.webp', 100, 150, 2, 2, 1],
        ['Шале', 'Уютный дом в стиле Шале.', 8000000, base+'84c/830_830_1/84cb06d25c1f0e5300dba0d695335672.webp', 150, 200, 2, 3, 2],
        ['Русский', 'Дом в русском стиле с традиционным дизайном.', 1000000, base+'f52/830_830_1/f5214aea51ff423dcda692cf60195f35.webp', 140, 180, 2, 3, 2],
        ['Романский', 'Дом в романском стиле с романтическим дизайном.', 7000000, base+'dfa/830_830_1/dfa4940cd7839424567a46fc2f432f10.webp', 160, 210, 2, 3, 2],
        ['Скандинавский', 'Дом в скандинавском стиле с минималистичным дизайном.', 7000000, base+'86c/830_830_1/86c6415f385b4c93c02f645a0c3f71a0.webp', 170, 220, 2, 3, 2],
        ['Фахверк', 'Дом в стиле Фахверк с традиционным дизайном.', 6000000, base+'196/830_830_1/196f21a43b7bb11516f841a11efbd9bf.webp', 180, 230, 2, 3, 2],
        ['Модерн', 'Современная архитектура с панорамными окнами.', 12500000, base+'196/830_830_1/196f21a43b7bb11516f841a11efbd9bf.webp', 220, 180, 2, 4, 3],
        ['Ранчо', 'Одноэтажный дом с просторной планировкой.', 5500000, base+'196/830_830_1/196f21a43b7bb11516f841a11efbd9bf.webp', 150, 130, 1, 3, 2],
    ];
    let i = 0;
    function nextHouse() {
        if (i >= houses.length) { console.log('Демо-дома добавлены'); return; }
        db.query(
            'INSERT INTO houses (name, description, price, image_url, area, plotArea, floors, bedrooms, bathrooms) VALUES (?,?,?,?,?,?,?,?,?)',
            houses[i], (err) => {
                if (err) console.error('Ошибка seed:', err.message);
                i++;
                setTimeout(nextHouse, 150);
            }
        );
    }
    nextHouse();
}

function fixImages() {
    // Обновляем картинки существующих домов по названию
    const base = 'https://m-strana.ru/upload/resize_cache/sprint.editor/';
    const imgMap = {
        'Прованс': base+'ce4/830_830_1/ce4547fce3a063d5b6ea6f6f27becce7.webp',
        'Классический': base+'64d/830_830_1/64dfc1e8d8847c01fd12a55d69b30139.webp',
        'Маяк': base+'54c/830_830_1/54ca31043ec6734085d2c69daae85372.webp',
        'Шале': base+'84c/830_830_1/84cb06d25c1f0e5300dba0d695335672.webp',
        'Русский': base+'f52/830_830_1/f5214aea51ff423dcda692cf60195f35.webp',
        'Романский': base+'dfa/830_830_1/dfa4940cd7839424567a46fc2f432f10.webp',
        'Скандинавский': base+'86c/830_830_1/86c6415f385b4c93c02f645a0c3f71a0.webp',
        'Фахверк': base+'196/830_830_1/196f21a43b7bb11516f841a11efbd9bf.webp',
    };
    const names = Object.keys(imgMap);
    let j = 0;
    function nextFix() {
        if (j >= names.length) { console.log('Картинки обновлены'); return; }
        db.query('UPDATE houses SET image_url = ? WHERE name = ?', [imgMap[names[j]], names[j]], (err) => {
            if (err) console.error('Ошибка fixImages:', err.message);
            j++;
            setTimeout(nextFix, 150);
        });
    }
    nextFix();
}

// Проверяем подключение и создаём таблицы
db.getConnection((err, conn) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
        return;
    }
    console.log('Connected to database');
    conn.release();
    initTables();
});

app.post('/api/register', (req, res) => {
    const { username, password, email, phone } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
    const sql = 'INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)';
    db.query(sql, [username, hashedPassword, email, phone], (err, result) => {
        if (err) {
            console.error('Error registering user:', err);
            res.status(500).send('Error registering user');
            return;
        }
        res.send('User registered');
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Заполните все поля" });
    }

    if (username.includes('@')) {
        const sql = 'SELECT * FROM admins WHERE email = ?';
        db.query(sql, [username], async (err, result) => {
            if (err) {
                console.error('Ошибка БД:', err);
                return res.status(500).json({ message: "Ошибка сервера" });
            }

            if (result.length === 0) {
                return res.status(400).json({ message: "Администратор не найден" });
            }

            const admin = result[0];
            try {
                const isPasswordValid = await bcrypt.compare(password, admin.password);

                if (!isPasswordValid) {
                    return res.status(400).json({ message: "Неверный пароль" });
                }

                const token = jwt.sign({ id: admin.id }, 'adminsecretkey', { expiresIn: '1h' });
                res.json({ 
                    token, 
                    isAdmin: true,
                    user: {}
                });
            } catch (error) {
                console.error('Ошибка проверки пароля:', error);
                res.status(500).json({ message: "Ошибка сервера" });
            }
        });
    } else {
        const sql = 'SELECT * FROM users WHERE username = ?';
        db.query(sql, [username], (err, result) => {
            if (err) {
                console.error('Ошибка БД:', err);
                return res.status(500).json({ message: "Ошибка сервера" });
            }

            if (result.length === 0) {
                return res.status(400).json({ message: "Пользователь не найден" });
            }

            const user = result[0];
            const isPasswordValid = bcrypt.compareSync(password, user.password);
            
            if (!isPasswordValid) {
                return res.status(400).json({ message: "Неверный пароль" });
            }

            const token = jwt.sign({ id: user.id }, 'secretkey', { expiresIn: '1h' });
            res.json({ 
                token,
                user: { 
                    username: user.username, 
                    email: user.email, 
                    phone: user.phone 
                }
            });
        });
    }
});

function adminAuth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).send('Доступ запрещен');
    
    jwt.verify(token, 'adminsecretkey', (err, decoded) => {
        if (err) return res.status(401).send('Недействительный токен');
        req.adminId = decoded.id;
        next();
    });
}

function checkUser(username, password, res) {
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, result) => {
        if (err) return res.status(500).send('Ошибка сервера');
        if (result.length === 0) return res.status(400).send('Пользователь не найден');
        
        const user = result[0];
        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(400).send('Неверный пароль');
        }
        
        const token = jwt.sign({ id: user.id }, 'secretkey', { expiresIn: '1h' });
        res.json({ 
            token,
            user: { username: user.username, email: user.email, phone: user.phone } 
        });
    });
}

app.get('/api/user', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).send('Unauthorized');
    }
    jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) {
            return res.status(401).send('Unauthorized');
        }
        const sql = 'SELECT * FROM users WHERE id = ?';
        db.query(sql, [decoded.id], (err, result) => {
            if (err) {
                console.error('Error finding user:', err);
                res.status(500).send('Error finding user');
                return;
            }
            if (result.length > 0) {
                const user = result[0];
                res.json(user);
            } else {
                res.status(400).send('User not found');
            }
        });
    });
});

app.get('/api/user/orders', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).send('Unauthorized');

    jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) return res.status(401).send('Unauthorized');

        const sql = `SELECT id, items, total, status, created_at FROM orders WHERE userId = ?`;
        
        db.query(sql, [decoded.id], (err, results) => {
            if (err) {
                console.error('Error fetching orders:', err);
                return res.status(500).send('Server error');
            }

            const orders = results.map(order => {
                try {
                    const fixedItems = order.items
                        .replace(/^"+|"+$/g, '')
                        .replace(/\\"/g, '"');
                    
                    return {
                        ...order,
                        items: JSON.parse(fixedItems)
                    };
                } catch (e) {
                    console.error('JSON parse error:', e);
                    return { ...order, items: [] };
                }
            });

            res.json(orders);
        });
    });
});

function safeJsonParse(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        console.error('JSON parse error:', e);
        return [];
    }
}

app.get('/api/houses', (req, res) => {
    const sql = `
        SELECT 
            id, 
            name, 
            description,
            price, 
            image_url, 
            area, 
            plotArea, 
            floors, 
            bedrooms, 
            bathrooms 
        FROM houses
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Ошибка БД:', err);
            return res.status(500).json({ 
                error: 'Ошибка сервера при получении данных' 
            });
        }
        
        res.json(results);
    });
});

app.post('/api/houses', adminAuth, (req, res) => {
    const { name, description, price, image_url, area, plotArea, floors, bedrooms, bathrooms } = req.body;
    
    if (!name || !description || price === undefined) {
        return res.status(400).json({ error: 'Не заполнены обязательные поля: название, описание, цена' });
    }
    
    const sql = `
        INSERT INTO houses 
        (name, description, price, image_url, area, plotArea, floors, bedrooms, bathrooms)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(sql, [
        name, 
        description, 
        parseFloat(price) || 0, 
        image_url || 'https://via.placeholder.com/150', 
        parseFloat(area) || 0, 
        parseFloat(plotArea) || 0, 
        parseInt(floors) || 0, 
        parseInt(bedrooms) || 0, 
        parseInt(bathrooms) || 0
    ], (err, result) => {
        if (err) {
            console.error('Ошибка добавления дома:', err);
            return res.status(500).json({ error: 'Ошибка сервера при добавлении товара' });
        }
        const newHouseId = result.insertId;
        const selectSql = 'SELECT * FROM houses WHERE id = ?';
        db.query(selectSql, [newHouseId], (err, results) => {
            if (err || results.length === 0) {
                return res.status(500).json({ error: 'Ошибка при получении созданного дома' });
            }
            res.json(results[0]);
        });
    });
});

app.get('/api/houses/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT id, name, description, price, image_url, area, plotArea, floors, bedrooms, bathrooms FROM houses WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error finding house:', err);
            res.status(500).send('Error finding house');
            return;
        }
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(400).send('House not found');
        }
    });
});

app.delete('/api/houses/:id', adminAuth, (req, res) => {
    const houseId = req.params.id;
    const sql = 'DELETE FROM houses WHERE id = ?';
    
    db.query(sql, [houseId], (err, result) => {
        if (err) {
            console.error('Ошибка удаления дома:', err);
            return res.status(500).json({ error: 'Ошибка сервера при удалении товара' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        res.json({ success: true, message: 'Товар удален' });
    });
});

app.put('/api/houses/:id', adminAuth, (req, res) => {
    const houseId = req.params.id;
    const { name, description, price, image_url, area, plotArea, floors, bedrooms, bathrooms } = req.body;
    
    if (!name || !description || price === undefined) {
        return res.status(400).json({ error: 'Не заполнены обязательные поля: название, описание, цена' });
    }
    
    const sql = `
        UPDATE houses SET 
            name = ?, 
            description = ?, 
            price = ?, 
            image_url = ?, 
            area = ?, 
            plotArea = ?, 
            floors = ?, 
            bedrooms = ?, 
            bathrooms = ?
        WHERE id = ?
    `;
    
    db.query(sql, [
        name, 
        description, 
        parseFloat(price) || 0, 
        image_url || 'https://via.placeholder.com/150', 
        parseFloat(area) || 0, 
        parseFloat(plotArea) || 0, 
        parseInt(floors) || 0, 
        parseInt(bedrooms) || 0, 
        parseInt(bathrooms) || 0,
        houseId
    ], (err, result) => {
        if (err) {
            console.error('Ошибка обновления дома:', err);
            return res.status(500).json({ error: 'Ошибка сервера при обновлении товара' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        const selectSql = 'SELECT * FROM houses WHERE id = ?';
        db.query(selectSql, [houseId], (err, results) => {
            if (err || results.length === 0) {
                return res.status(500).json({ error: 'Ошибка при получении обновленного товара' });
            }
            res.json(results[0]);
        });
    });
});

app.post('/api/cart', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    const { productId } = req.body;
    jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) {
            res.status(401).send('Unauthorized');
            return;
        }
        const sql = 'INSERT INTO cart (userId, productId) VALUES (?, ?)';
        db.query(sql, [decoded.id, productId], (err, result) => {
            if (err) {
                console.error('Error adding product to cart:', err);
                res.status(500).send('Error adding product to cart');
                return;
            }
            res.send('Product added to cart');
        });
    });
});

app.get('/api/cart', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) {
            res.status(401).send('Unauthorized');
            return;
        }
        const sql = 'SELECT h.id, h.name, h.description, h.price, h.image_url, h.area, h.plotArea, h.floors, h.bedrooms, h.bathrooms FROM houses h JOIN cart c ON h.id = c.productId WHERE c.userId = ?';
        db.query(sql, [decoded.id], (err, result) => {
            if (err) {
                console.error('Error fetching cart:', err);
                res.status(500).send('Error fetching cart');
                return;
            }
            res.json(result);
        });
    });
});

app.delete('/api/cart/:productId', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    const { productId } = req.params;
    jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) {
            res.status(401).send('Unauthorized');
            return;
        }
        const sql = 'DELETE FROM cart WHERE userId = ? AND productId = ?';
        db.query(sql, [decoded.id, productId], (err, result) => {
            if (err) {
                console.error('Error removing product from cart:', err);
                res.status(500).send('Error removing product from cart');
                return;
            }
            res.send('Product removed from cart');
        });
    });
});

app.post('/api/compare', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    const { productId } = req.body;
    jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) {
            res.status(401).send('Unauthorized');
            return;
        }
        const sql = 'INSERT INTO compare (userId, productId) VALUES (?, ?)';
        db.query(sql, [decoded.id, productId], (err, result) => {
            if (err) {
                console.error('Error adding product to compare list:', err);
                res.status(500).send('Error adding product to compare list');
                return;
            }
            res.send('Product added to compare list');
        });
    });
});

app.get('/api/compare', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) return res.status(401).send('Unauthorized');
        
        const sql = `
            SELECT 
                h.id,
                h.name,
                h.description,
                h.price,
                h.image_url,
                h.area,
                h.plotArea,
                h.floors,
                h.bedrooms,
                h.bathrooms
            FROM houses h
            JOIN compare c ON h.id = c.productId
            WHERE c.userId = ?
        `;
        
        db.query(sql, [decoded.id], (err, result) => {
            if (err) {
                console.error('Error fetching compare list:', err);
                return res.status(500).send('Error fetching compare list');
            }
            res.json(result);
        });
    });
});

app.delete('/api/compare/:productId', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    const { productId } = req.params;
    jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) {
            res.status(401).send('Unauthorized');
            return;
        }
        const sql = 'DELETE FROM compare WHERE userId = ? AND productId = ?';
        db.query(sql, [decoded.id, productId], (err, result) => {
            if (err) {
                console.error('Error removing product from compare list:', err);
                res.status(500).send('Error removing product from compare list');
                return;
            }
            res.send('Product removed from compare list');
        });
    });
});

app.post('/api/orders', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    const { items, total, name, phone, email } = req.body;

    if (!name || !phone || !email) {
        return res.status(400).json({ error: "Заполните все обязательные поля" });
    }

    jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) return res.status(401).send('Unauthorized');

        const numericTotal = parseFloat(total);
        if (isNaN(numericTotal)) {
            return res.status(400).json({ error: "Неверная сумма заказа" });
        }

        const sql = `
            INSERT INTO orders 
                (userId, items, total, name, phone, email) 
            VALUES 
                (?, ?, ?, ?, ?, ?)
        `;
        
        db.query(sql, [
            decoded.id,
            JSON.stringify(items),
            numericTotal.toFixed(2),
            name,
            phone,
            email
        ], (err, result) => {
            if (err) {
                console.error('Error creating order:', err);
                return res.status(500).send('Ошибка создания заказа');
            }
            res.json({ success: true });
        });
    });
});

app.get('/api/admin/users', adminAuth, (req, res) => {
    const sql = 'SELECT id, username, email, phone, DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:%s") as created_at FROM users';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Ошибка получения пользователей:', err);
            return res.status(500).json({ error: 'Ошибка сервера при получении пользователей' });
        }
        res.json(results);
    });
});

app.delete('/api/admin/users/:id', adminAuth, (req, res) => {
    const userId = req.params.id;
    const sql = 'DELETE FROM users WHERE id = ?';
    
    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error('Ошибка удаления пользователя:', err);
            return res.status(500).json({ error: 'Ошибка сервера при удалении пользователя' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        res.json({ success: true, message: 'Пользователь удален' });
    });
});

app.get('/api/admin/reports/summary', adminAuth, (req, res) => {
    const queries = {
        totalProducts: 'SELECT COUNT(*) AS count FROM houses',
        totalUsers: 'SELECT COUNT(*) AS count FROM users',
        totalOrders: 'SELECT COUNT(*) AS count FROM orders',
        totalRevenue: 'SELECT SUM(total) AS revenue FROM orders WHERE status = "Доставлен"'
    };
    
    const results = {};
    const promises = Object.keys(queries).map(key => {
        return new Promise((resolve, reject) => {
            db.query(queries[key], (err, result) => {
                if (err) {
                    console.error(`Ошибка при выполнении запроса ${key}:`, err);
                    results[key] = null;
                } else {
                    results[key] = result[0].count || result[0].revenue || 0;
                }
                resolve();
            });
        });
    });

    Promise.all(promises)
        .then(() => res.json(results))
        .catch(error => {
            console.error('Ошибка при формировании отчета:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        });
});

app.get('/api/admin/reports/products-stats', adminAuth, (req, res) => {
    const sql = `
        SELECT
            h.name,
            COUNT(DISTINCT o.id) AS order_count,
            SUM(o.total) AS total_revenue
        FROM houses h
        JOIN orders o ON JSON_SEARCH(o.items, 'one', CAST(h.id AS CHAR)) IS NOT NULL
        WHERE o.status IN ('В обработке', 'Собирается', 'В пути', 'Доставлен')
        GROUP BY h.id
        ORDER BY order_count DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Ошибка получения статистики по товарам:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
        res.json(results);
    });
});

app.get('/api/admin/reports/users-activity', adminAuth, (req, res) => {
    const sql = `
        SELECT
            u.username,
            u.email,
            COUNT(DISTINCT o.id) AS order_count,
            SUM(o.total) AS total_spent,
            MAX(o.created_at) AS last_order_date
        FROM users u
        JOIN orders o ON u.id = o.userId
        WHERE o.status IN ('В обработке', 'Собирается', 'В пути', 'Доставлен')
        GROUP BY u.id
        ORDER BY total_spent DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Ошибка получения статистики по пользователям:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
        res.json(results);
    });
});

app.get('/api/admin/reports/orders', (req, res) => {
    const sql = `
        SELECT o.*, u.username 
        FROM orders o 
        JOIN users u ON o.userId = u.id
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).send('Ошибка сервера');
        res.json(result);
    });
});

app.get('/api/admin/reports/products', (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) as total_products,
            SUM(price) as total_revenue,
            AVG(price) as avg_price
        FROM houses
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).send('Ошибка сервера');
        res.json(result[0]);
    });
});

app.get('/api/admin/reports/users', adminAuth, (req, res) => {
    const sql = 'SELECT id, username, email FROM users';
    db.query(sql, (err, result) => {
        if (err) return res.status(500).send('Ошибка сервера');
        res.json(result);
    });
});

app.get('/api/admin/orders', adminAuth, (req, res) => {
    const sql = `
        SELECT 
            o.id, 
            o.items, 
            o.total, 
            o.status, 
            DATE_FORMAT(o.created_at, "%Y-%m-%d %H:%i:%s") as created_at,
            o.name,
            o.phone,
            o.email
        FROM orders o
        ORDER BY o.created_at DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Ошибка получения заказов:', err);
            return res.status(500).json({ error: 'Ошибка сервера при получении заказов' });
        }
        
        const orders = results.map(order => {
            try {
                const items = typeof order.items === 'string' 
                    ? JSON.parse(order.items) 
                    : order.items;
                
                return {
                    ...order,
                    items: Array.isArray(items) ? items : []
                };
            } catch (e) {
                console.error('Ошибка парсинга items:', e);
                return { ...order, items: [] };
            }
        });
        
        res.json(orders);
    });
});

app.put('/api/admin/orders/:id/status', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    const { id } = req.params;
    const { status } = req.body;

    jwt.verify(token, 'adminsecretkey', (err) => {
        if (err) return res.status(401).send('Unauthorized');
        
        const validStatuses = ['В обработке', 'Собирается', 'В пути', 'Доставлен', 'Отменен'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Неверный статус заказа" });
        }

        const sql = 'UPDATE orders SET status = ? WHERE id = ?';
        db.query(sql, [status, id], (err) => {
            if (err) {
                console.error('Error updating order status:', err);
                return res.status(500).send('Ошибка обновления статуса');
            }
            res.json({ success: true, message: 'Статус обновлен' });
        });
    });
});

app.get('/api/admin/notifications', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    jwt.verify(token, 'adminsecretkey', (err, decoded) => {
        if (err) {
            res.status(401).send('Unauthorized');
            return;
        }
        const sql = 'SELECT * FROM notifications';
        db.query(sql, (err, result) => {
            if (err) {
                console.error('Error fetching notifications:', err);
                res.status(500).send('Error fetching notifications');
                return;
            }
            res.json(result);
        });
    });
});

app.post('/api/admin/notifications', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    const { userId, message } = req.body;
    jwt.verify(token, 'adminsecretkey', (err, decoded) => {
        if (err) {
            res.status(401).send('Unauthorized');
            return;
        }
        const sql = 'INSERT INTO notifications (userId, message) VALUES (?, ?)';
        db.query(sql, [userId, message], (err, result) => {
            if (err) {
                console.error('Error sending notification:', err);
                res.status(500).send('Error sending notification');
                return;
            }
            res.send('Notification sent successfully');
        });
    });
});

app.get('/api/notifications', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) {
            res.status(401).send('Unauthorized');
            return;
        }
        const sql = 'SELECT * FROM notifications WHERE userId = ?';
        db.query(sql, [decoded.id], (err, result) => {
            if (err) {
                console.error('Error fetching notifications:', err);
                res.status(500).send('Error fetching notifications');
                return;
            }
            res.json(result);
        });
    });
});

const path = require('path');
app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});