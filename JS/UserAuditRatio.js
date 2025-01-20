async function fetchAuditRatio() {
    const jwt = localStorage.getItem("jwt");

    if (!jwt || jwt.split(".").length !== 3) {
        console.error("Invalid Token");
        document.getElementById("done").textContent = "";
        document.getElementById("received").textContent = "";
        document.getElementById("auditratio").textContent = "Error: Invalid Token";
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
                            user {
                                auditRatio
                                totalUp
                                totalDown
                            }
                        }
                    `,
                }),
            }
        );

        if (!response.ok) {
            console.error("Failed to fetch audit data info:", response.statusText);
            document.getElementById("done").textContent = "";
            document.getElementById("received").textContent = "";
            document.getElementById("auditratio").textContent = "Failed to fetch data";
            return;
        }

        const result = await response.json();
        console.log("GraphQL Result:", JSON.stringify(result, null, 2));

        if (result.errors) {
            console.error("GraphQL Errors:", result.errors);
            document.getElementById("done").textContent = "";
            document.getElementById("received").textContent = "";
            document.getElementById("auditratio").textContent = "GraphQL Errors: " + result.errors.map(error => error.message).join(", ");
            return;
        }

        const userData = result.data.user[0]; // access the first user in the array

        if (!userData) {
            document.getElementById("done").textContent = "";
            document.getElementById("received").textContent = "";
            document.getElementById("auditratio").textContent = "No data available";
            console.error("No user data found");
            return;
        }

        // access and format the data
        const totalUp = Math.round(userData.totalUp / 1000); // rounding
        const totalDown = Math.round(userData.totalDown / 1000); // rounding
        const auditRatio = userData.auditRatio;

        // format auditRatio to one decimal place
        const formattedAuditRatio = auditRatio !== undefined ? auditRatio.toFixed(1) : "No data available";

        document.getElementById("done-value").textContent = totalUp;
        document.getElementById("received-value").textContent = totalDown;
        document.getElementById("auditratio").textContent = `${formattedAuditRatio}`;

        // assuming a max value for scaling
        updateSVG("done-chart", totalUp, 1000);  
        updateSVG("received-chart", totalDown, 1000);  

    } catch (error) {
        console.error("Fetch error:", error);
        document.getElementById("done").textContent = "";
        document.getElementById("received").textContent = "";
        document.getElementById("auditratio").textContent = "Error fetching data";
    }
}


function updateSVG(svgId, value, maxValue) {
    const svg = document.getElementById(svgId);
    const width = svg.getAttribute('width');
    const height = svg.getAttribute('height');

    svg.innerHTML = '';

    let color;
    if (svgId === "done-chart") {
        color = "#92a4d8"; 
    } else if (svgId === "received-chart") {
        color = "#4169E1"; 
    } else {
        color = "#FFFFFF"; 
    }

    const barWidth = (value / maxValue) * width;

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", 0);
    rect.setAttribute("y", height / 3); 
    rect.setAttribute("width", barWidth);
    rect.setAttribute("height", height / 3); 
    rect.setAttribute("rx", height / 6);
    rect.setAttribute("ry", height / 6); 
    rect.setAttribute("fill", color);
    svg.appendChild(rect);
}



