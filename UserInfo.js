async function fetchUserInfo() {
  const jwt = localStorage.getItem("jwt");
  console.log("Retrieved Token:", jwt);

  if (!jwt || jwt.split(".").length !== 3) {
    console.error("Invalid Token");
    return null;
}

  try {
      const response = await fetch(
          "https://learn.reboot01.com/api/graphql-engine/v1/graphql",
          {
              method: "POST",
              headers: {
                  Authorization: `Bearer ${jwt}`,
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({
                  query: `
                      {
                          user {
                              firstName
                              lastName
                              id
                              login
                              email
                          }
                      }
                  `,
              }),
          }
      );

      if (!response.ok) {
          document.getElementById("error-message").textContent = "Failed to fetch user data.";
          return null;
      }

      const result = await response.json();
      console.log("User Info:", JSON.stringify(result, null, 2));

      if (result.errors) {
          console.error("GraphQL Errors:", result.errors);
          document.getElementById("error-message").textContent = "GraphQL Errors: " + result.errors.map(error => error.message).join(", ");
          return null;
      }

      const userInfoArr = result.data?.user;

      if (Array.isArray(userInfoArr) && userInfoArr.length > 0) {
          const userData = userInfoArr[0]; 
          document.getElementById("name").textContent = `Welcome, ${userData.firstName || 'N/A'} ${userData.lastName || 'N/A'}!`;
          document.getElementById("username").textContent = `Username: ${userData.login || 'N/A'}`;
          document.getElementById("userid").textContent = `ID: ${userData.id || 'N/A'}`;
          document.getElementById("email").textContent = `Email: ${userData.email || 'N/A'}`;
      } else {
          document.getElementById("error-message").textContent = "No user info";
      }

  } catch (error) {
      document.getElementById("error-message").textContent = "Error fetching user info";
  }
}

window.onload = fetchUserInfo;
