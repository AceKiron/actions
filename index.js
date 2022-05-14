const core = require("@actions/core");
const github = require("@actions/github");

const cp = require("child_process");
cp.execSync("npm install");

const fs = require("fs");
const GIFEncoder = require("gifencoder");
const { createCanvas } = require("canvas");
const axios = require("axios");

let username, usernameLowercase;

try {
    username = core.getInput("username");
    usernameLowercase = username.toLowerCase();
} catch (error) {
    core.setFailed(error.message);
}

section2 = ({ totalStars, totalCommits, totalPRs, totalIssues, contributedTo, followers }) => {
    const width = 450;
    const height = 338;

    class TerminalCanvas {
        constructor(width, height) {
            this.fontSize = 12;
            this.padding = 7;

            this.ctx = createCanvas(width, height).getContext("2d");
            this.ctx.font = this.fontSize + 'px "Consolas"';

            this.lines = [];

            this.width = width;
            this.height = height;

            this.maxLines = Math.floor((height - this.padding * 4) / this.fontSize);

            this.renderCount = 0;
        }

        addLine(text) {
            this.lines.push(text);
            if (this.lines.length > this.maxLines) {
                this.lines.shift();
            }
        }

        editLine(cb) {
            let line = this.lines.pop();
            this.lines.push(cb(line));
        }

        removeLine() {
            this.lines.pop();
        }

        clear() {
            this.lines = [];
        }

        render() {
            console.log(`Calling render() for the ${this.renderCount}th time.`);
            this.renderCount++;

            this.ctx.fillStyle = "#182238";
            this.ctx.fillRect(0, 0, this.width, this.height);

            this.ctx.strokeStyle = "#ff00ff";

            this.ctx.beginPath();

            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = "#ff00ff";
            
            this.ctx.moveTo(this.padding, this.padding);
            this.ctx.lineTo(this.padding, this.height - this.padding);
            this.ctx.lineTo(this.width - this.padding, this.height - this.padding);
            this.ctx.lineTo(this.width - this.padding, this.padding);
            this.ctx.lineTo(this.padding, this.padding);

            this.ctx.stroke();

            this.ctx.fillStyle = "white";

            for (let i = 0; i < this.lines.length; i++) {
                let line = this.lines[i];
                this.ctx.fillText(line, this.padding * 2, this.padding * 2 + (i + 1) * this.fontSize, this.width - this.padding * 4);
            }

            return this.ctx;
        }
    };

    function typeWriter(tc, encoder, originalLine, writingText) {
        tc.addLine(originalLine);
        encoder.addFrame(tc.render());

        while (writingText != "") {
            tc.editLine((line) => {
                return line.replace("_", writingText[0] + "_");
            });
            encoder.addFrame(tc.render());

            writingText = writingText.slice(1);
        }

        tc.editLine((line) => {
            return line.replace("_", "");
        });
    }

    const tc = new TerminalCanvas(width, height);

    const encoder = new GIFEncoder(width, height);
    // encoder.createReadStream().pipe(fs.createWriteStream(core.getInput("output-path")));

    const stream = encoder.createWriteStream({ repeat: 0, delay: 125, quality: 10})
                .pipe(fs.createWriteStream(core.getInput("output-path")));
    
    stream.on("finish", function () {
        // Upload to GitHub
        cp.execSync("git add assets/animated-terminal.gif");
        cp.execSync("git config --local user.email \"41898282+github-actions[bot]@users.noreply.github.com\"");
        cp.execSync("git config --local user.name \"github-actions[bot]\"");
        cp.execSync("git commit -m \"Animated terminal updated\" -a --alow-empty");
        cp.execSync("git push");
    });

    encoder.start();

    function addFrameLooped(encoder, frame, count) {
        for (let i = 0; i < count; i++) {
            encoder.addFrame(frame);
        }
    }

    tc.addLine("Release gitBIOS v2022.3 - Build date May 14th 2022");
    tc.addLine("(C) AceKiron 2022");
    tc.addLine("");
    addFrameLooped(encoder, tc.render(), 2);

    tc.addLine("WAIT...");
    addFrameLooped(encoder, tc.render(), 6);

    tc.clear();

    tc.addLine("Starting GitHubOS...");
    addFrameLooped(encoder, tc.render(), 2);

    tc.clear();

    typeWriter(tc, encoder, `${usernameLowercase}@127.0.0.1: ~$ _`, `gh stats ${username}`);

    tc.addLine("Fetching data from GitHub APIs...");
    tc.addLine("");
    addFrameLooped(encoder, tc.render(), 13);

    // { totalStars, totalCommits, totalPRs, totalIssues, contributedTo, followers }
    console.log({ totalStars, totalCommits, totalPRs, totalIssues, contributedTo, followers });

    tc.addLine("Total stars earned: " + totalStars);
    encoder.addFrame(tc.render());

    tc.addLine("Total Commits:      " + totalCommits);
    encoder.addFrame(tc.render());

    tc.addLine("Total PRs:          " + totalPRs);
    encoder.addFrame(tc.render());

    tc.addLine("Total Issues:       " + totalIssues);
    encoder.addFrame(tc.render());

    tc.addLine("Contributed to:     " + contributedTo);
    encoder.addFrame(tc.render());

    tc.addLine("Followers:          " + followers);
    addFrameLooped(encoder, tc.render(), 3);

    tc.addLine(`${usernameLowercase}@127.0.0.1: ~$ _`);
    addFrameLooped(encoder, tc.render(), 4);

    tc.removeLine();
    
    typeWriter(tc, encoder, `${usernameLowercase}@127.0.0.1: ~$ _`, `gh userdata ${username}`);

    tc.addLine("Fetching data from GitHub APIs...");
    tc.addLine("");
    addFrameLooped(encoder, tc.render(), 5);

    const userdata = {
        company: core.getInput("company"),
        country: core.getInput("country"),
        website: core.getInput("website"),
        pronouns: core.getInput("pronouns")
    };

    if (userdata.company) { tc.addLine("Company:  " + userdata.company); encoder.addFrame(tc.render()); }
    if (userdata.country) { tc.addLine("Country:  " + userdata.country); encoder.addFrame(tc.render()); }
    if (userdata.website) { tc.addLine("Website:  " + userdata.website); encoder.addFrame(tc.render()); }
    if (userdata.pronouns) { tc.addLine("Pronouns: " + userdata.pronouns); encoder.addFrame(tc.render()); }

    tc.addLine(`${usernameLowercase}@127.0.0.1: ~$ _`);
    addFrameLooped(encoder, tc.render(), 24);

    encoder.finish();
}

axios({
    url: process.env.GITHUB_GRAPHQL_URL,
    method: "post",
    headers: {
        Authorization: `token ${ACTIONS_RUNTIME_TOKEN}`
    },
    data: {
        login: {
            username: username
        },
        query: `
        {
          user(login: "${username}") {
            contributionsCollection {
              totalCommitContributions
            }
            repositoriesContributedTo(first: 1, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) {
              totalCount
            }
            pullRequests(first: 1) {
              totalCount
            }
            openIssues: issues(states: OPEN) {
              totalCount
            }
            closedIssues: issues(states: CLOSED) {
              totalCount
            }
            followers {
              totalCount
            }
            repositories(first: 100, ownerAffiliations: OWNER, orderBy: {direction: DESC, field: STARGAZERS}) {
              totalCount
              nodes {
                stargazers {
                  totalCount
                }
              }
            }
          }
        }
        `
    }
}).then((res) => {
    const user = res.data.data.user;

    const totalStars = user.repositories.nodes.map((val) => val.stargazers.totalCount).reduce((partialSum, a) => partialSum + a, 0);
    const totalCommits = user.contributionsCollection.totalCommitContributions;
    const totalPRs = user.pullRequests.totalCount;
    const totalIssues = user.openIssues.totalCount + user.closedIssues.totalCount;
    const contributedTo = user.repositoriesContributedTo.totalCount;
    const followers = user.followers.totalCount;
    
    console.log("API response received");
    
    section2({ totalStars, totalCommits, totalPRs, totalIssues, contributedTo, followers });
}).catch((err) => {
    core.setFailed(err.message);
});