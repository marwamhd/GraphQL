async function login(event) {
  event.preventDefault();

  const usernameOrEmail = document.getElementById("username-or-email").value;
  const password = document.getElementById("password").value;
  const credentials = `${usernameOrEmail}:${password}`;

  const encodedCredentials = btoa(credentials);

  try {
    const response = await fetch("https://learn.reboot01.com/api/auth/signin", {
      method: "POST",
      headers: {
        Authorization: `Basic ${encodedCredentials}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("jwt", data.jwt);
      window.location.href = "profile.html";
    } else {
      const errorMessage = await response.text();
      alert(errorMessage);
    }
  } catch (error) {
    console.error("Error during login:", error);
    document.getElementById("error-message").innerText =
      "An error occurred. Please try again.";
  }
}

