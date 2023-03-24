const fetch = require("node-fetch");
const fs = require("fs");

async function getLastCommitDate() {
  const token = process.env.READ_COMMIT_TOKEN;
  const response = await fetch("https://api.github.com/repos/zissue/zissue.github.io/commits?per_page=1", {
    headers: {
      Authorization: `token ${token}`,
    },
  });
  const data = await response.json();
  return data[0].commit.author.date;
}

async function updateLastUpdated() {
  const lastCommitDate = await getLastCommitDate();
  const lastUpdatedText = `Last updated: ${lastCommitDate}`;
  fs.writeFileSync("../index.html", fs.readFileSync("../index.html", "utf-8").replace(/Last updated: .*<\/span>/, lastUpdatedText));
}

updateLastUpdated();
