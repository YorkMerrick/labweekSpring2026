import { Octokit } from "octokit";
import process from "process";
import dotenv from "dotenv";

dotenv.config();

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

type SimplePr = {
  number: number;
  title: string;
  author: string;
  url: string;
  createdAt: string;
}

type RepoData = {
  owner: string;
  repo: string;
}

type Comment = {
  body: string;
  prNumber: number;
  author: string;
}

async function main() {
  console.log('Hello, world!');
  const octoResponse = await getPRs({ owner: "sky-uk", repo: "sky-sport-group-android" }).then((response) => {
    return response;
  });
  console.log(octoResponse);


  octoResponse.forEach(async (pr) => {
    console.log(`PR #${pr.number}: ${pr.title} by ${pr.author}`);
    const comments = await getComments(pr.number).then((response) => {
      return response.filter(comment => comment.author.includes("copilot"));
    });
    console.log(`Comments for PR #${pr.number}:`, comments);
  });
}

main()

async function getPRs(repoData: RepoData) {
  const res = await octokit.rest.pulls.list({
    owner: repoData.owner,
    repo: repoData.repo,
    state: "closed",
    sort: "updated",
    direction: "desc",
    per_page: 3,
  }).then((response) => {
    return response.data;
  });

  const simplePrs: SimplePr[] = res.map(pr => ({
    number: pr.number,
    title: pr.title,
    author: pr.user?.login ?? "unknown",
    url: pr.html_url,
    createdAt: pr.created_at,
  }));
  return simplePrs;
};

async function getComments(prNumber: number) {
  const res = await octokit.rest.pulls.listReviews({
    owner: "sky-uk",
    repo: "sky-sport-group-android",
    pull_number: prNumber,
  })

  const comments: Comment[] = res.data.map(comment => ({
    body: comment.body ?? "",
    prNumber: prNumber,
    author: comment.user?.login ?? "unknown",
  }));

  return comments;
}
