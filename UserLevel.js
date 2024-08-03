async function fetchUserLevel() {
    const jwt = localStorage.getItem("jwt");
    console.log("Retrieved Token:", jwt);

    if (!jwt || jwt.split(".").length !== 3) {
        console.error("Invalid Token");
        document.getElementById("level").textContent = "Error: Invalid Token";
        return;
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
                        query {
                            transaction(
                                order_by: {amount: desc}
                                limit: 1
                                where: {
                                    type: {_eq: "level"},
                                    path: {_like: "/bahrain/bh-module%"}
                                }
                            ) {
                                amount
                            }
                        }
                    `,
                }),
            }
        );

        if (!response.ok) {
            document.getElementById("level").textContent = "Failed to fetch level data.";
            return;
        }

        const result = await response.json();
        console.log("User Level:", JSON.stringify(result, null, 2));

        if (result.errors) {
            console.error("GraphQL Errors:", result.errors);
            document.getElementById("level").textContent = "GraphQL Errors: " + result.errors.map(error => error.message).join(", ");
            return;
        }

        const levelData = result.data?.transaction[0];

        if (levelData) {
            document.getElementById("level").textContent = `${levelData.amount || 'N/A'}`;
        } else {
            document.getElementById("level").textContent = "No level info available";
        }

    } catch (error) {
        document.getElementById("level").textContent = "Error fetching level info";
        console.error("Fetch error:", error);
    }
}

