const fetch = require('node-fetch'); // If node version < 18, but windows Node is probably recent enough to have global fetch

async function run() {
  try {
    const res = await fetch('http://localhost:8000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@mediclime.com',
        password: 'MediclimeAdmin2026!'
      })
    });
    
    console.log("Status:", res.status);
    const data = await res.text();
    console.log("Body:", data);
  } catch (e) {
    console.error("Error:", e);
  }
}

run();
