const BASE = 'http://localhost:5000';

async function main(){
  // ensure user exists: try register (ignore errors)
  try {
    await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'E2E Test', email: 'e2e_test+1@example.com', password: 'Password123!' })
    });
    console.log('register attempted');
  } catch (e) { console.warn('register may have failed', e.message); }

  // login
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'e2e_test+1@example.com', password: 'Password123!' })
  });
  const login = await loginRes.json();
  console.log('login response', JSON.stringify(login));
  const token = login?.data?.token;
  if (!token) {
    throw new Error('Login failed - no token');
  }
  console.log('token obtained');

  // get history to find latest analysisId
  const histRes = await fetch(`${BASE}/api/resume/history`, { headers: { Authorization: `Bearer ${token}` } });
  const hist = await histRes.json();
  console.log('history count', hist.data.length);
  const analysisId = hist.data[0]._id;
  console.log('using analysis', analysisId);

  // call job search
  const jobsRes = await fetch(`${BASE}/api/jobs/search?analysisId=${analysisId}`, { headers: { Authorization: `Bearer ${token}` } });
  const jobsJson = await jobsRes.json();
  console.log(JSON.stringify(jobsJson, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
