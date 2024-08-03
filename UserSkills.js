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

        if (skillsData.length > 0) {
            createSpiderwebChart(skillsData);
        } else {
            console.log("No skills data available");
        }

    } catch (error) {
        console.error("Error fetching skills data:", error);
    }
}

function createSpiderwebChart(data) {
    const svg = document.getElementById('chart');
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const levels = 5; // concentric circles
    const maxValue = Math.max(...data.map(d => d.amount));
    const radius = Math.min(width, height) / 3; // spiderweb size
    const angleSlice = (Math.PI * 2) / data.length;

    svg.innerHTML = '';

    // draw concentric circles
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

    // draw skill axes and labels
    data.forEach((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        // draw axis lines
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute('x1', centerX);
        line.setAttribute('y1', centerY);
        line.setAttribute('x2', x);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', '#bbb');
        svg.appendChild(line);

        // draw skill labels outside the chart
        const labelX = centerX + Math.cos(angle) * (radius + 20); // Position labels outside the chart
        const labelY = centerY + Math.sin(angle) * (radius + 20);
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute('x', labelX);
        label.setAttribute('y', labelY);
        label.setAttribute('dy', y > centerY ? "1em" : "-0.5em");
        label.setAttribute('text-anchor', x > centerX ? "start" : "end");
        label.textContent = d.type.replace("skill_", "").replace("-", " ");
        svg.appendChild(label);

        // draw skill amounts inside the chart
        const valueRadius = (d.amount / maxValue) * radius;
        const valueX = centerX + Math.cos(angle) * valueRadius;
        const valueY = centerY + Math.sin(angle) * valueRadius;
        const valueLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        valueLabel.setAttribute('x', valueX);
        valueLabel.setAttribute('y', valueY);
        valueLabel.setAttribute('dy', "0.3em"); // Adjust the position slightly
        valueLabel.setAttribute('text-anchor', "middle");
        valueLabel.setAttribute('fill', '#333');
        valueLabel.textContent = d.amount;
        svg.appendChild(valueLabel);
    });

    // draw spiderweb path
    let points = '';
    data.forEach((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const valueRadius = (d.amount / maxValue) * radius;
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

