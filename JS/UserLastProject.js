async function fetchLastProject() {
    const jwt = localStorage.getItem("jwt");
  
    if (!jwt || jwt.split(".").length !== 3) {
      console.error("Invalid Token");
      return null;
    }
  
    try {
      const response = await fetch("https://learn.reboot01.com/api/graphql-engine/v1/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query {
              transaction(
                where: {
                  type: { _eq: "xp" }
                  _and: [
                    { path: { _like: "/bahrain/bh-module%" } },
                    { path: { _nlike: "/bahrain/bh-module/checkpoint%" } },
                    { path: { _nlike: "/bahrain/bh-module/piscine-js%" } }
                  ]
                }
                order_by: { createdAt: desc }
                limit: 1
              ) {
                amount
                path
                createdAt
                object {
                  name
                  object_type {
                    type
                  }
                }
              }
            }
          `,
        }),
      });
  
      if (!response.ok) {
        document.getElementById("error-message").textContent = "Failed to fetch project data.";
        return null;
      }
  
      const result = await response.json();
      console.log("Project Data:", JSON.stringify(result, null, 2));
  
      if (result.errors) {
        console.error("GraphQL Errors:", result.errors);
        document.getElementById("error-message").textContent = "GraphQL Errors: " + result.errors.map(error => error.message).join(", ");
        return null;
      }
  
      const projectData = result.data?.transaction?.[0];
  
      if (projectData) {
        document.getElementById("project-name").textContent = `🖥️ ${projectData.object.name || 'N/A'}`;
        document.getElementById("submission-date-time").textContent = `🕛 ${new Date(projectData.createdAt).toLocaleString() || 'N/A'}`;
      } else {
        document.getElementById("project-name").textContent = "No project data";
        document.getElementById("submission-date-time").textContent = "";
      }
  
    } catch (error) {
      document.getElementById("error-message").textContent = "Error fetching project data";
    }
  }
  