const fs = require('fs');
const admin = require('firebase-admin');
const path = require('path');

// Cria o arquivo de credenciais a partir da variável de ambiente (Cyclic/Railway)
if (process.env.FIREBASE_CREDENTIALS_JSON) {
  fs.writeFileSync(
    path.join(process.cwd(), 'firebase_credentials.json'),
    process.env.FIREBASE_CREDENTIALS_JSON
  );
}

const serviceAccount = require(path.join(process.cwd(), 'firebase_credentials.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

module.exports = { admin, db }; 