const http = require('http');

const data = JSON.stringify({
  first_name: 'Test',
  last_name: 'User',
  email: 'test@example.com',
  company: 'Test Co',
  job_title: 'Tester',
  phone: '123',
  org_type: 'Other',
  country: 'India',
  marketing_opt_in: false
});

const req = http.request('http://localhost:3000/api/contact/demo', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log(res.statusCode, body));
});
req.write(data);
req.end();
