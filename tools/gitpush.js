const simpleGit = require("simple-git");
const git = simpleGit();

module.exports = async ({ commitMessage }) => {
  await git.add(".");
  await git.commit(commitMessage);
  await git.push("origin", "main");
  return { success: true, message: "Code pushed to GitHub" };
};
