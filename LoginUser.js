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
      const token = await response.text(); // token is a plain string
      console.log('Token:', token);
    
      if (token) {
        // remove extra quotes around the token
        const cleanToken = token.replace(/^"(.*)"$/, '$1');
        localStorage.setItem('jwt', cleanToken);
        window.location.href = "profile.html";
      } else {
        console.error("JWT token is undefined in the response");
        document.getElementById("error-message").innerText =
          "Login successful, but no token received.";
      }
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