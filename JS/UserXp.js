async function fetchUserXp() {
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
                            transaction_aggregate(
                                where: {
                                    event: { path: { _eq: "/bahrain/bh-module" } }
                                    type: { _eq: "xp" }
                                }
                            ) {
                                aggregate {
                                    sum {
                                        amount
                                    }
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
      return;
    }

    const totalXp =
      result.data?.transaction_aggregate?.aggregate?.sum?.amount || 0;
    const xpAmountElement = document.getElementById("xp-total-amount");
    const pieProgress = document.getElementById("pie-progress");

    xpAmountElement.innerHTML = `<tspan x="50%" dy="-0.3em" text-anchor="middle">${totalXp}</tspan><tspan x="50%" dy="1.2em" text-anchor="middle">KB</tspan>`;

    const maxXp = 10000; 
    const progress = (totalXp / maxXp) * 500; 
    pieProgress.setAttribute(
      "stroke-dasharray",
      `${progress} ${500 - progress}`
    );
  } catch (error) {
    console.error("Error fetching XP data:", error);
  }
}
