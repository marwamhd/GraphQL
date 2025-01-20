function logout() {
  localStorage.removeItem("jwt");

  fetch('https://learn.reboot01.com/api/auth/signout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem("jwt")}` 
    }
  })
  .then(response => {
    if (response.ok) {
      window.location.href = "index.html";
    } else {
      console.error('Logout failed:', response.statusText);
      alert('Logout failed, please try again.');
    }
  })
  .catch(error => {
    console.error('Network error:', error);
    alert('There was a problem logging out. Please try again later.');
  });
}
