import fs from "fs";

console.log("env:", process.env.VERCEL_ENV);

const accessToken = process.env.GITHUB_ACCESS_TOKEN;
const username = "la55u";

const headers = {
  Authorization: `Bearer ${accessToken}`,
  "User-Agent": "Node.js",
};

async function fetchData() {
  try {
    // Fetch repositories contributed to
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?type=all&per_page=100`,
      { headers }
    );
    const repositories = await reposResponse.json();

    let totalStars = 0;
    repositories.forEach((repo) => {
      totalStars += repo.stargazers_count;
    });

    // Calculate total commits count
    let totalCommits = 0;
    for (const repo of repositories) {
      const commitsResponse = await fetch(
        `https://api.github.com/repos/${username}/${repo.name}/commits`,
        { headers }
      );
      const commitsData = await commitsResponse.json();
      totalCommits += commitsData.length;
    }

    // Fetch issues opened
    const issuesResponse = await fetch(
      `https://api.github.com/search/issues?q=author:${username}+type:issue`,
      { headers }
    );
    const issuesData = await issuesResponse.json();
    const issuesOpened = issuesData.total_count;

    // Fetch merge requests (pull requests) opened
    const pullRequestsResponse = await fetch(
      `https://api.github.com/search/issues?q=author:${username}+type:pr&sort=created&order=asc`,
      { headers }
    );
    const pullRequestsData = await pullRequestsResponse.json();
    const pullRequestsOpened = pullRequestsData.total_count;
    const firstPullRequestDate = pullRequestsData.items[0].created_at;

    // Fetch merge requests merged
    const mergedPullRequestsResponse = await fetch(
      `https://api.github.com/search/issues?q=author:${username}+type:pr+is:merged`,
      { headers }
    );
    const mergedPullRequestsData = await mergedPullRequestsResponse.json();
    const pullRequestsMerged = mergedPullRequestsData.total_count;

    // Fetch comments made on issues
    const commentsOnIssuesResponse = await fetch(
      `https://api.github.com/search/issues?q=commenter:${username}`,
      { headers }
    );
    const commentsOnIssuesData = await commentsOnIssuesResponse.json();
    const commentsOnIssues = commentsOnIssuesData.total_count;

    // Fetch user data
    const userResponse = await fetch(`https://api.github.com/user`, { headers });
    const userData = await userResponse.json();

    const registeredDate = userData.created_at;
    const publicRepoCount = userData.public_repos;
    const followers = userData.followers;

    // Prepare data object
    const data = {
      issuesOpened,
      pullRequestsOpened,
      pullRequestsMerged,
      commentsOnIssues,
      publicRepoCount,
      totalStars,
      totalCommits,
      registeredDate,
      firstPullRequestDate,
      sponsoredAccounts: 3, // TODO
      statUpdated: new Date().toISOString(),
      followers,
    };

    // Write data to JSON file
    fs.writeFileSync("github_stats.json", JSON.stringify(data, null, 2));
    console.log("Data has been written to github_stats.json");
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

fetchData();
