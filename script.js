// URL to your AWS CSV file
const csvUrl = "https://mediclinicmiddleeast.s3.eu-north-1.amazonaws.com/Leaderboards.csv";

let currentLeaderboard = 'facility';  // Keep track of the current leaderboard

// Function to fetch and parse the CSV file
function fetchCSVAndRenderLeaderboards() {
    Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete: function(results) {
            let data = results.data;

            // Filter out undefined or empty rows (rows without Facility, Cluster, Score, or Month)
            data = data.filter(row => row.Facility && row.Score && row.Cluster && row.Month);

            // Populate the month dropdown dynamically
            populateMonthDropdown(data);

            // Get the initial month from the dropdown
            const selectedMonth = document.getElementById("month-selector").value;
            let filteredData = filterByMonth(data, selectedMonth);

            // Initially render the facility leaderboard with top 3
            renderFacilityLeaderboard(filteredData);

            // Add event listeners to the buttons
            document.getElementById("facility-btn").addEventListener("click", function () {
                toggleActiveButton("facility-btn");
                currentLeaderboard = 'facility';
                renderFacilityLeaderboard(filteredData);
            });

            document.getElementById("cluster-btn").addEventListener("click", function () {
                toggleActiveButton("cluster-btn");
                currentLeaderboard = 'cluster';
                renderClusterLeaderboard(filteredData);
            });

            // Add event listener for month change
            document.getElementById("month-selector").addEventListener("change", function() {
                const selectedMonth = this.value;
                filteredData = filterByMonth(data, selectedMonth);

                // Re-render the currently active leaderboard when month changes
                if (currentLeaderboard === 'facility') {
                    renderFacilityLeaderboard(filteredData);
                } else if (currentLeaderboard === 'cluster') {
                    renderClusterLeaderboard(filteredData);
                }
            });
        },
        error: function(err) {
            console.error('Error fetching or parsing the CSV:', err);
        }
    });
}

// Helper function to populate the month dropdown dynamically
function populateMonthDropdown(data) {
    const monthSelector = document.getElementById("month-selector");
    const uniqueMonths = [...new Set(data.map(row => row.Month.trim()))]; // Get unique months

    // Clear existing options
    monthSelector.innerHTML = '';

    // Populate the dropdown with available months
    uniqueMonths.forEach(month => {
        const option = document.createElement("option");
        option.value = month;
        option.textContent = month;
        monthSelector.appendChild(option);
    });

    // Set the first month as selected by default
    monthSelector.value = uniqueMonths[0];
}

// Helper function to filter data by month
function filterByMonth(data, selectedMonth) {
    return data.filter(row => row.Month.trim() === selectedMonth); // Filter by the selected month
}

// The rest of the facility and cluster rendering functions remain unchanged

// Helper function to toggle active button
function toggleActiveButton(activeButtonId) {
    document.getElementById("facility-btn").classList.remove("active");
    document.getElementById("cluster-btn").classList.remove("active");
    document.getElementById(activeButtonId).classList.add("active");
}

// Function to render the facility leaderboard (with top 3)
function renderFacilityLeaderboard(data) {
    const topThreeContainer = document.getElementById("top-three");
    const leaderboardBody = document.getElementById("leaderboard-body");
    leaderboardBody.innerHTML = ""; // Clear any existing content
    topThreeContainer.innerHTML = ""; // Clear the top 3 content

    if (data.length === 0) {
        console.error('No data to display for the selected month.');
        return;
    }

    // Sort data by facility score in descending order
    data.sort((a, b) => parseFloat(b.Score) - parseFloat(a.Score));

    // Display top 3 facilities
    const topThree = data.slice(0, 3);
    topThree.forEach((row, index) => {
        const topPlayerDiv = document.createElement("div");
        topPlayerDiv.classList.add("top-player");

        const placeImage = index === 0 ? "https://mediclinicmiddleeast.s3.eu-north-1.amazonaws.com/1st.png" :
                           index === 1 ? "https://mediclinicmiddleeast.s3.eu-north-1.amazonaws.com/2nd.png" :
                           "https://mediclinicmiddleeast.s3.eu-north-1.amazonaws.com/3rd.png";

        topPlayerDiv.innerHTML = `
            <div class="image-container">
                <img src="${placeImage}" alt="${index + 1}st Place">
            </div>
            <p class="name">${row.Facility}</p>
            <p class="score" style="color: ${index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'};">
                ${row.Score}
            </p>
        `;
        topThreeContainer.appendChild(topPlayerDiv);
    });

    // Populate the facility leaderboard for remaining ranks
    data.forEach((row, index) => {
        if (index >= 3) {  // Only show rows after top 3
            const tableRow = document.createElement("tr");
            tableRow.innerHTML = `
                <td>${index + 1}</td>
                <td>${row.Facility}</td>
                <td>${row.Score}</td>
            `;
            leaderboardBody.appendChild(tableRow);
        }
    });
}

// Function to render the cluster leaderboard (with top 3 clusters)
function renderClusterLeaderboard(data) {
    const topThreeContainer = document.getElementById("top-three");
    const leaderboardBody = document.getElementById("leaderboard-body");
    leaderboardBody.innerHTML = ""; // Clear any existing content
    topThreeContainer.innerHTML = ""; // Clear the top 3 content

    if (data.length === 0) {
        console.error('No data to display for the selected month.');
        return;
    }

    // Group facilities by cluster and calculate average score for each cluster
    const clusterScores = {};
    data.forEach(row => {
        const cluster = row.Cluster;
        const score = parseFloat(row.Score);
        
        if (!clusterScores[cluster]) {
            clusterScores[cluster] = { totalScore: 0, count: 0 };
        }
        clusterScores[cluster].totalScore += score;
        clusterScores[cluster].count += 1;
    });

    // Calculate the average score for each cluster
    const clusters = Object.keys(clusterScores).map(cluster => ({
        cluster: cluster,
        averageScore: (clusterScores[cluster].totalScore / clusterScores[cluster].count).toFixed(2)
    }));

    // Sort clusters by average score in descending order
    clusters.sort((a, b) => parseFloat(b.averageScore) - parseFloat(a.averageScore));

    // Display top 3 clusters
    const topThree = clusters.slice(0, 3);
    topThree.forEach((row, index) => {
        const topPlayerDiv = document.createElement("div");
        topPlayerDiv.classList.add("top-player");

        const placeImage = index === 0 ? "https://mediclinicmiddleeast.s3.eu-north-1.amazonaws.com/1st.png" :
                           index === 1 ? "https://mediclinicmiddleeast.s3.eu-north-1.amazonaws.com/2nd.png" :
                           "https://mediclinicmiddleeast.s3.eu-north-1.amazonaws.com/3rd.png";

        topPlayerDiv.innerHTML = `
            <div class="image-container">
                <img src="${placeImage}" alt="${index + 1}st Place">
            </div>
            <p class="name">${row.cluster}</p>
            <p class="score" style="color: ${index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'};">
                ${row.averageScore}
            </p>
        `;
        topThreeContainer.appendChild(topPlayerDiv);
    });

    // Populate the cluster leaderboard for remaining ranks
    clusters.forEach((cluster, index) => {
        if (index >= 3) {  // Only show rows after top 3
            const tableRow = document.createElement("tr");
            tableRow.innerHTML = `
                <td>${index + 1}</td>
                <td>${cluster.cluster}</td>
                <td>${cluster.averageScore}</td>
            `;
            leaderboardBody.appendChild(tableRow);
        }
    });
}

// Fetch and render leaderboards when the page loads
fetchCSVAndRenderLeaderboards();