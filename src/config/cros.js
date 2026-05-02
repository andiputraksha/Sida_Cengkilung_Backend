const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      /\.ngrok-free\.app$/ // ✅ izinkan semua domain ngrok
    ];

    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(o => {
      if (o instanceof RegExp) return o.test(origin);
      return o === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },

  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // ✅ tambah OPTIONS
  allowedHeaders: ['Content-Type', 'Authorization', 'x-device-info']
};

module.exports = corsOptions;