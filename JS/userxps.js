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
                const segments = path.split('/');
                let lastSegment = segments[segments.length - 1];

                lastSegment = lastSegment.replace(/^\d{2}-\d{2}-\d{4}-|^\d{4}-\d{2}-\d{2}-/, '');

                lastSegment = lastSegment.replace(/^(deprecated-|archive-)/, '');

                lastSegment = lastSegment.replace(/^-+|-+$/g, '');

                return lastSegment;
            }

            function displayXP(index) {
                const xp = xps[index];
                const svg = document.getElementById("xp-bar-chart");
                const projectName = document.getElementById("xp-project-name");

                svg.innerHTML = "";

                const barWidth = 50;
                const barHeight = xp.amount;
                const maxBarHeight = 250; 

                const scaledHeight = Math.min(barHeight, maxBarHeight);

                const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                bar.setAttribute("x", 25);
                bar.setAttribute("y", 300 - scaledHeight); 
                bar.setAttribute("width", barWidth);
                bar.setAttribute("height", scaledHeight);
                bar.setAttribute("fill", "#4b749b");
                svg.appendChild(bar);

                const amountText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                amountText.setAttribute("x", 50);
                amountText.setAttribute("y", 300 - scaledHeight - 10); 
                amountText.setAttribute("text-anchor", "middle");
                amountText.setAttribute("fill", "white"); 
                amountText.setAttribute("font-family", "IBM Plex Mono, monospace"); 
                amountText.setAttribute("font-weight", "300"); 
                amountText.setAttribute("font-size", "12.5px");
                amountText.textContent = xp.amount;
                svg.appendChild(amountText);

                projectName.textContent = getPathName(xp.path);
            }

            displayXP(currentIndex);

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

