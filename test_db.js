const mysql = require('mysql2/promise');

async function testDatabase() {
  try {
    console.log('=== DATABASE CONNECTION TEST ===');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'db_desa_adat_cengkilung'
    });

    console.log('✅ Connected to database');
    
    // Test query tb_pengguna
    const [users] = await connection.execute('SELECT * FROM tb_pengguna');
    console.log(`✅ Found ${users.length} users in tb_pengguna`);
    
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role}): ${user.password}`);
    });
    
    // Test login query
    const [admin] = await connection.execute(
      'SELECT * FROM tb_pengguna WHERE email = ?',
      ['admin@cengkilung.id']
    );
    
    console.log('✅ Admin user found:', admin.length > 0);
    if (admin.length > 0) {
      console.log('  Admin password hash:', admin[0].password);
      console.log('  Expected MD5 of "admin123":', require('crypto').createHash('md5').update('admin123').digest('hex'));
    }
    
    await connection.end();
    console.log('✅ Database test completed');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
}

testDatabase();