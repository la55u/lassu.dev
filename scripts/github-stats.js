import fs from "fs";

const accessToken = process.env.GITHUB_ACCESS_TOKEN;
const username = "la55u";

/**
 * Fetches a GitHub API URL
 * @param {string} path The URL to fetch
 * @returns {object} Response JSON object
 */
async function getUrl(path) {
  try {
    const response = await fetch(`https://api.github.com/` + path, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "Node.js",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!response.ok) {
      // parse error body
      const err = await response.json();
      throw new Error(`${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Error fetching path \`${path}\``, { cause: error });
  }
}

async function fetchData() {
  try {
    // Fetch repositories contributed to
    const repositories = await getUrl(`users/${username}/repos?type=all&per_page=100`);

    let totalStars = 0;
    repositories.forEach((repo) => {
      totalStars += repo.stargazers_count;
    });

    // Calculate total commits count
    let totalCommits = 0;
    for (const repo of repositories) {
      const commitsData = await getUrl(`repos/${username}/${repo.name}/commits`);
      totalCommits += commitsData.length;
    }

    // Fetch issues opened
    const issuesData = await getUrl(`search/issues?q=author:${username}+type:issue`);
    const issuesOpened = issuesData.total_count;

    // Fetch merge requests (pull requests) opened
    const prs = await getUrl(
      `search/issues?q=author:${username}+type:pr&sort=created&order=asc`
    );
    const pullRequestsOpened = prs.total_count;
    const firstPullRequestDate = prs.items[0].created_at;

    // Fetch merge requests merged
    const mergedPRs = await getUrl(
      `search/issues?q=author:${username}+type:pr+is:merged`
    );
    const pullRequestsMerged = mergedPRs.total_count;

    // Fetch comments made on issues
    const commentsOnIssuesData = await getUrl(`search/issues?q=commenter:${username}`);
    const commentsOnIssues = commentsOnIssuesData.total_count;

    // Fetch user data
    const userData = await getUrl(`user`);

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
    console.error("Something went wrong:", error);
  }
}

fetchData();
