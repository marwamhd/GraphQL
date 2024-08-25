async function fetchUserAudits() {
    const jwt = localStorage.getItem("jwt");

    if (!jwt || jwt.split(".").length !== 3) {
        console.error("Invalid Token");
        document.getElementById("auditsTableBody").innerHTML = "<tr><td colspan='3'>Error: Invalid Token</td></tr>";
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
                                validAudits: audits_aggregate(where: {grade: {_gte: 1}}) {
                                    nodes {
                                        group {
                                            captainLogin
                                            path
                                        }
                                    }
                                }
                                failedAudits: audits_aggregate(where: {grade: {_lt: 1}}) {
                                    nodes {
                                        group {
                                            captainLogin
                                            path
                                        }
                                    }
                                }
                            }
                        }
                    `,
                }),
            }
        );

        if (!response.ok) {
            document.getElementById("auditsTableBody").innerHTML = "<tr><td colspan='3'>Failed to fetch audits info</td></tr>";
            console.error("Failed to fetch audits info:", response.statusText);
            return;
        }

        const result = await response.json();
        console.log("GraphQL Result:", JSON.stringify(result, null, 2));

        if (result.errors) {
            console.error("GraphQL Errors:", result.errors);
            document.getElementById("auditsTableBody").innerHTML = "<tr><td colspan='3'>GraphQL Errors: " + result.errors.map(error => error.message).join(", ") + "</td></tr>";
            return;
        }

        const userData = result.data?.user[0];

        if (!userData) {
            document.getElementById("auditsTableBody").innerHTML = "<tr><td colspan='3'>No user data found</td></tr>";
            console.error("No user data found");
            return;
        }

        const validAuditNodes = userData.validAudits?.nodes || [];
        const failedAuditNodes = userData.failedAudits?.nodes || [];
        const allAuditNodes = [...validAuditNodes.map(node => ({
            captainLogin: node.group.captainLogin,
            projectName: node.group.path.split("/").pop(),
            status: "Pass"
        })), ...failedAuditNodes.map(node => ({
            captainLogin: node.group.captainLogin,
            projectName: node.group.path.split("/").pop(),
            status: "Fail"
        }))];

        const tableBody = document.getElementById("auditsTableBody");
        tableBody.innerHTML = allAuditNodes.map(audit => `
            <tr>
                <td colspan="2">${audit.captainLogin} - ${audit.projectName}</td>
                <td class="${audit.status === 'Pass' ? 'pass' : 'fail'}">${audit.status}</td>
            </tr>
        `).join("");

    } catch (error) {
        document.getElementById("auditsTableBody").innerHTML = "<tr><td colspan='3'>Error fetching audits</td></tr>";
        console.error("Fetch error:", error);
    }
}
