const core = require("@actions/core");
const github = require("@actions/github");

try {
  core.setOutput("time", new Date().toTimeString());

  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`The event payload: ${payload}`);
  console.log(process.env);
} catch (error) {
  core.setFailed(error.message);
}
