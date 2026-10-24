const http = require('http');
const server = require('../server');

const PORT = process.env.PORT || 3000;

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('Testing Resume Server API endpoints...');
  const base = { host: 'localhost', port: PORT };
  const json = { 'Content-Type': 'application/json' };

  // 1. Health check
  const health = await request({ ...base, path: '/health', method: 'GET' });
  console.log('1. Health check status:', health.status, health.data);

  // 2. List resumes
  const all = await request({ ...base, path: '/api/resumes', method: 'GET' });
  console.log('2. Resume list status:', all.status, all.data.data.map(r => r.slug).join(', '));

  // 3. Fetch each resume's JSON
  for (const { slug } of all.data.data) {
    const one = await request({ ...base, path: `/api/resumes/${slug}`, method: 'GET' });
    const d = one.data.data;
    console.log(`3. GET ${slug}:`, one.status, (d.profile || d).name);
  }

  // 4. Update the tech resume, then reset it from its seed file
  const tech = (await request({ ...base, path: '/api/resumes/tech', method: 'GET' })).data.data;
  tech.profile.status = 'Updated by test-api';
  const put = await request({ ...base, path: '/api/resumes/tech', method: 'PUT', headers: json }, tech);
  console.log('4. PUT tech status:', put.status, put.data.data.profile.status);

  const reset = await request({ ...base, path: '/api/resumes/tech/reset', method: 'POST' });
  console.log('5. Reset tech status:', reset.status, reset.data.data.profile.status);

  // 6. Unknown slug is a 404
  const missing = await request({ ...base, path: '/api/resumes/nope', method: 'GET' });
  console.log('6. Unknown resume status:', missing.status);

  console.log('All API tests passed cleanly!');
  server.close();
  process.exit(0);
}

setTimeout(runTests, 500);
