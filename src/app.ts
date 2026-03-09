import { Octokit, App } from "octokit";
import process from "process";
import dotenv from "dotenv";

dotenv.config();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const authenticatedUser = await octokit.rest.repos.get({
  owner: "YorkMerrick",
  repo: "labweekSpring2026"
});

function main() {
  console.log(process.env.GITHUB_TOKEN)
  console.log('Hello, world!')
  console.log(authenticatedUser.data)
}

main()
