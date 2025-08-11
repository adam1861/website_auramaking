import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.log('Usage: node scripts/generate-hash.js <your-password>');
  console.log('Example: node scripts/generate-hash.js myadminpassword');
  process.exit(1);
}

const saltRounds = 10;
const hash = bcrypt.hashSync(password, saltRounds);

console.log('\n=== Admin Password Hash Generator ===');
console.log(`Password: ${password}`);
console.log(`Hash: ${hash}`);
console.log('\nAdd this to your .env file:');
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log('\nMake sure to also set:');
console.log('ADMIN_EMAIL=your-email@example.com');
console.log('\nThen restart your server!');
