async function login(username, password) {
  const response = await fetch('https://((DOMAIN))/api/graphql-engine/v1/graphql', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(username + ':' + password),
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (response.ok) {
    localStorage.setItem('token', data.token);
  } else {
    console.error('Login failed:', data.message);
  }
}
