async function fetchAllUserXps() {
    const jwt = localStorage.getItem("jwt");

    if (!jwt || jwt.split(".").length !== 3) {
        console.error("Invalid Token");
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
                                xps {
                                    path
                                    amount
                                }
                            }
                        }
                    `,
                }),
            }
        );

        const result = await response.json();

        if (result.errors) {
            console.error("GraphQL Errors:", result.errors);
            document.getElementById("xp-project-name").textContent = "Error";
            return;
        }

        const user = result.data?.user;

        if (user && Array.isArray(user[0]?.xps) && user[0]?.xps.length > 0) {
            const xps = user[0].xps;
            let currentIndex = 0;

            function getPathName(path) {
                // Extract the last segment after the last slash
                const segments = path.split('/');
                let lastSegment = segments[segments.length - 1];

                // Remove date-like patterns (e.g., "deprecated-24-01-2024-", "2024-08-19-")
                lastSegment = lastSegment.replace(/^\d{2}-\d{2}-\d{4}-|^\d{4}-\d{2}-\d{2}-/, '');

                // Remove other unwanted prefixes (e.g., "deprecated-", "archive-")
                lastSegment = lastSegment.replace(/^(deprecated-|archive-)/, '');

                // Remove any leading or trailing dashes
                lastSegment = lastSegment.replace(/^-+|-+$/g, '');

                return lastSegment;
            }

            function displayXP(index) {
                const xp = xps[index];
                const svg = document.getElementById("xp-bar-chart");
                const projectName = document.getElementById("xp-project-name");

                // Clear previous SVG content
                svg.innerHTML = "";

                // Create the bar
                const barWidth = 50; // Adjust as needed for a thin appearance
                const barHeight = xp.amount; // Dynamic height based on XP amount
                const maxBarHeight = 250; // Max height for scaling

                // Scale the bar height if needed
                const scaledHeight = Math.min(barHeight, maxBarHeight);

                // Create the bar
                const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                bar.setAttribute("x", 25); // Center alignment
                bar.setAttribute("y", 300 - scaledHeight); // Bottom alignment
                bar.setAttribute("width", barWidth);
                bar.setAttribute("height", scaledHeight);
                bar.setAttribute("fill", "#4b749b");
                svg.appendChild(bar);

                // Add XP amount text above the bar with specified styling
                const amountText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                amountText.setAttribute("x", 50);
                amountText.setAttribute("y", 300 - scaledHeight - 10); // Position above the bar
                amountText.setAttribute("text-anchor", "middle");
                amountText.setAttribute("fill", "white"); // Color
                amountText.setAttribute("font-family", "IBM Plex Mono, monospace"); // Font family
                amountText.setAttribute("font-weight", "300"); // Font weight
                amountText.setAttribute("font-size", "12.5px"); // Font size
                amountText.textContent = xp.amount;
                svg.appendChild(amountText);

                // Set project name below the SVG
                projectName.textContent = getPathName(xp.path);
            }

            // Display the first XP by default
            displayXP(currentIndex);

            // Handle navigation button clicks
            document.getElementById("prev-xp-btn").addEventListener("click", function() {
                currentIndex = (currentIndex > 0) ? currentIndex - 1 : xps.length - 1;
                displayXP(currentIndex);
            });

            document.getElementById("next-xp-btn").addEventListener("click", function() {
                currentIndex = (currentIndex < xps.length - 1) ? currentIndex + 1 : 0;
                displayXP(currentIndex);
            });

        } else {
            document.getElementById("xp-project-name").textContent = "No XP data available";
        }

    } catch (error) {
        console.error("Error fetching XP data:", error);
        document.getElementById("xp-project-name").textContent = "Error";
    }
}

