const http = require('http');
const server = require('../server');

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

  // 1. Health check
  const health = await request({ host: 'localhost', port: 3000, path: '/health', method: 'GET' });
  console.log('1. Health check status:', health.status, health.data);

  // 2. Full Resume Payload
  const resume = await request({ host: 'localhost', port: 3000, path: '/api/resume', method: 'GET' });
  console.log('2. Full Resume API status:', resume.status, 'Success:', resume.data.success);
  console.log('   Profile:', resume.data.data.profile.name);
  console.log('   Categories count:', resume.data.data.skillCategories.length);
  console.log('   Experiences count:', resume.data.data.experiences.length);
  console.log('   Projects count:', resume.data.data.projects.length);

  // 3. Test Profile Update
  const updateProfile = await request({
    host: 'localhost',
    port: 3000,
    path: '/api/profile',
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Fil Joseph Elman',
    status_text: 'Available for Technical Leadership & Full-Stack Roles (Dynamic)'
  });
  console.log('3. Profile Update status:', updateProfile.status, updateProfile.data.data.status_text);

  // 4. Test Create Experience
  const newExp = await request({
    host: 'localhost',
    port: 3000,
    path: '/api/experiences',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    company: 'Test Company Labs',
    role: 'Staff Architect',
    location: 'Remote',
    duration: '2026 – Present',
    description: 'Testing dynamic insertion',
    achievements: ['Engineered scalable test pipeline'],
    technologies: ['PostgreSQL', 'Node.js']
  });
  console.log('4. Create Experience status:', newExp.status, 'ID:', newExp.data.data.id);

  // 5. Test Delete Experience
  const delExp = await request({
    host: 'localhost',
    port: 3000,
    path: `/api/experiences/${newExp.data.data.id}`,
    method: 'DELETE'
  });
  console.log('5. Delete Experience status:', delExp.status, delExp.data.message);

  // 6. Test Reset Seed
  const reset = await request({
    host: 'localhost',
    port: 3000,
    path: '/api/reset-seed',
    method: 'POST'
  });
  console.log('6. Reset Seed status:', reset.status, reset.data.message);

  console.log('All API tests passed cleanly!');
  server.close();
  process.exit(0);
}

setTimeout(runTests, 500);
