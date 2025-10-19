const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(cors());
app.use(express.json());

// Защита от перегрузки
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100 // максимум 100 запросов
});
app.use(limiter);

// Получение данных товара
app.get('/api/product/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        
        const response = await axios.get(
            `https://kaspi.kz/yml/offer-view/offers/${productId}`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json',
                    'Referer': 'https://kaspi.kz/'
                },
                timeout: 10000
            }
        );

        const productData = response.data;
        
        // Форматируем ответ
        const formattedData = {
            name: productData.product?.name || 'Неизвестно',
            price: productData.offer?.price ? `${productData.offer.price} ₸` : 'Не указана',
            rating: productData.product?.rating || 0,
            reviews: productData.product?.reviewsCount || 0,
            category: productData.product?.category?.name || 'Не указана',
            seller: productData.offer?.merchant?.name || 'Не указан',
            availability: productData.offer?.available ? 'В наличии' : 'Нет в наличии',
            image: productData.product?.pictures?.[0] || '',
            views: productData.stats?.views || 0,
            favorites: productData.stats?.favorites || 0
        };

        res.json({
            success: true,
            data: formattedData,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error fetching product:', error.message);
        res.status(500).json({
            success: false,
            error: 'Не удалось получить данные товара',
            details: error.message
        });
    }
});

// Статус сервера
app.get('/status', (req, res) => {
    res.json({
        status: 'active',
        server: 'Kaspi Product API',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Status: http://localhost:${PORT}/status`);
});
