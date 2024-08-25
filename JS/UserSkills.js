async function fetchSkills() {
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
                        query skills {
                            transaction(
                                where: {
                                    _and: [
                                        {type: { _iregex: "(^|[^[:alnum:]_])[[:alnum:]_]*skill_[[:alnum:]_]*($|[^[:alnum:]_])" }},
                                        {type: {_like: "%skill%"}},
                                        {object: {type: {_eq: "project"}}},
                                        {type: {_in: [
                                            "skill_prog", "skill_algo", "skill_sys-admin", "skill_front-end", "skill_back-end", "skill_stats", "skill_ai", "skill_game", "skill_tcp"
                                        ]}}
                                    ]
                                }
                                order_by: [{type: asc}, {createdAt: desc}]
                                distinct_on: type
                            ) {
                                amount
                                type
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

        const skillsData = result.data?.transaction || [];
        const amountElement = document.getElementById("skills-amount");

        if (Array.isArray(skillsData) && skillsData.length > 0) {
            const amounts = skillsData.map(skill => `${skill.type}: ${skill.amount}%`).join("<br>");
            amountElement.innerHTML = amounts; 
            drawSkillsChart(skillsData); // the chart
        } else {
            amountElement.textContent = "No skills data available";
        }

    } catch (error) {
        console.error("Error fetching skills data:", error);
    }
}




function drawSkillsChart(data) {
    const svg = document.getElementById('skills-chart');
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const levels = 4; // Number of concentric circles
    const maxValue = Math.max(...data.map(d => d.amount));

    // Adjust radius for a slightly smaller chart width
    const radius = (Math.min(width, height) / 3.5) - 10; // Subtract 10px for left and right margin
    const angleSlice = (Math.PI * 2) / data.length;
    const scale = 0.75; // Adjusted scale for better fit

    svg.innerHTML = '';

    // Draw circles
    for (let i = 1; i <= levels; i++) {
        const levelRadius = (i / levels) * radius;
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute('cx', centerX);
        circle.setAttribute('cy', centerY);
        circle.setAttribute('r', levelRadius);
        circle.setAttribute('stroke', '#ddd');
        circle.setAttribute('fill', 'none');
        svg.appendChild(circle);
    }

    // Draw skill axes & labels
    data.forEach((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        // Draw axis lines
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute('x1', centerX);
        line.setAttribute('y1', centerY);
        line.setAttribute('x2', x);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', '#bbb');
        svg.appendChild(line);

        // Adjust label position and alignment
        const labelX = centerX + Math.cos(angle) * (radius + 15);
        const labelY = centerY + Math.sin(angle) * (radius + 15);
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute('x', labelX);
        label.setAttribute('y', labelY);
        label.setAttribute('dy', y > centerY ? "1em" : "-0.5em");
        label.setAttribute('text-anchor', x > centerX ? "start" : "end");
        label.setAttribute('fill', '#ffffff');
        label.setAttribute('font-family', '"IBM Plex Mono", monospace');
        label.setAttribute('font-weight', '300');
        label.setAttribute('font-size', '10px');
        label.textContent = d.type.replace("skill_", "").replace("-", " ");
        svg.appendChild(label);
    });

    // Draw spiderweb path
    let points = '';
    data.forEach((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const valueRadius = (d.amount / maxValue) * radius * scale;
        const x = centerX + Math.cos(angle) * valueRadius;
        const y = centerY + Math.sin(angle) * valueRadius;
        points += `${x},${y} `;
    });

    const path = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    path.setAttribute('points', points.trim());
    path.setAttribute('fill', 'rgba(0, 128, 255, 0.4)');
    path.setAttribute('stroke', '#007bff');
    path.setAttribute('stroke-width', 2);
    svg.appendChild(path);
}
