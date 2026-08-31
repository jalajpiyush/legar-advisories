const fetch = require('node-fetch');

async function test() {
  const response = await fetch('http://localhost:3000/api/contact/demo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      company: 'Test Co',
      job_title: 'Tester',
      phone: '123',
      org_type: 'Other',
      country: 'India',
      marketing_opt_in: false
    })
  });
  const text = await response.text();
  console.log(response.status, text);
}
test();
