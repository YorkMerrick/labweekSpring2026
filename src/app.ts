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

async function main() {
  console.log('Hello, world!');
  const octoResponse = await getPRs().then((response) => {
    return response;
  });
  console.log(octoResponse);
}

main()

async function getPRs() {
  const res = await octokit.rest.pulls.list({
    owner: "sky-uk",
    repo: "sky-sport-group-android",
    state: "closed",
    sort: "updated",
    direction: "desc",
    per_page: 1,
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
