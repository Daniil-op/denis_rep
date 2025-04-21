const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Purple0457.',
    database: 'house_sales'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database');
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
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, result) => {
        if (err) {
            console.error('Error finding user:', err);
            res.status(500).send('Error finding user');
            return;
        }
        if (result.length > 0) {
            const user = result[0];
            const isPasswordCorrect = bcrypt.compareSync(password, user.password);
            if (isPasswordCorrect) {
                const token = jwt.sign({ id: user.id }, 'secretkey', { expiresIn: '1h' });
                res.json({ token, user: { username: user.username, email: user.email, phone: user.phone } });
            } else {
                res.status(400).send('Invalid password');
            }
        } else {
            res.status(400).send('User not found');
        }
    });
});

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

app.get('/api/houses', (req, res) => {
    const sql = 'SELECT id, name, description, price, image_url FROM houses';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching houses:', err);
            res.status(500).send('Error fetching houses');
            return;
        }
        res.json(result);
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
            const house = result[0];
            res.json(house);
        } else {
            res.status(400).send('House not found');
        }
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
        if (err) {
            res.status(401).send('Unauthorized');
            return;
        }
        const sql = 'SELECT h.id, h.name, h.description, h.price, h.image_url FROM houses h JOIN compare c ON h.id = c.productId WHERE c.userId = ?';
        db.query(sql, [decoded.id], (err, result) => {
            if (err) {
                console.error('Error fetching compare list:', err);
                res.status(500).send('Error fetching compare list');
                return;
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
    const { items, name, phone, email } = req.body;
    jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) {
            res.status(401).send('Unauthorized');
            return;
        }
        const sql = 'INSERT INTO orders (userId, items, name, phone, email) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [decoded.id, JSON.stringify(items), name, phone, email], (err, result) => {
            if (err) {
                console.error('Error placing order:', err);
                res.status(500).send('Error placing order');
                return;
            }
            res.send('Order placed successfully');
        });
    });
});

app.get('/api/admin/orders', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    jwt.verify(token, 'adminsecretkey', (err, decoded) => {
        if (err) {
            res.status(401).send('Unauthorized');
            return;
        }
        const sql = 'SELECT o.id, o.items, o.name, o.phone, o.email, u.username FROM orders o JOIN users u ON o.userId = u.id';
        db.query(sql, (err, result) => {
            if (err) {
                console.error('Error fetching orders:', err);
                res.status(500).send('Error fetching orders');
                return;
            }
            res.json(result);
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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});