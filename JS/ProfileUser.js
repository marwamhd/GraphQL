function logout() {
  localStorage.removeItem("jwt");

  window.location.replace("index.html");
}