const core = require("@actions/core");
// const github = require("@actions/github");

try {
    const cp = require("child_process");

    cp.execSync("git config --local user.email \"41898282+github-actions[bot]@users.noreply.github.com\"");
    cp.execSync("git config --local user.name \"github-actions[bot]\"");

    cp.execSync(`git add ${core.getInput("files")}`);
    cp.execSync(`git commit -m "${core.getInput("message")}" ${core.getInput("commit-flags")}`);
    cp.execSync(`git push origin ${core.getInput("branch")} ${core.getInput("push-flags")}`);
} catch (error) {
    core.setFailed(error.message);
}