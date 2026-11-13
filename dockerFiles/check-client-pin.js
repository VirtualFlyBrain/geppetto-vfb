/*
 * Fail the image build when package-lock.json doesn't install the
 * geppetto-client that package.json asks for, rather than silently shipping an
 * older client.
 *
 * Reads both lockfile formats: v1 (npm 6, "dependencies") and v2/v3 (npm 7+,
 * "packages"), since running npm install with a newer npm rewrites the lock to
 * v3. The locked commit is compared with the commit the package.json tag
 * points to on GitHub, so a lock that kept an old commit after the tag was
 * bumped is caught too (npm ci alone would install the old commit).
 */
const { execFileSync } = require("child_process");

const NAME = "@geppettoengine/geppetto-client";

function fail (message) {
  console.error("package-lock.json: " + message);
  process.exit(1);
}

const want = require("../package.json").dependencies[NAME];
const lock = require("../package-lock.json");

// e.g. "VirtualFlyBrain/geppetto-client#VFBv2.5.0.2"
const spec = /^(?:github:)?([\w.-]+\/[\w.-]+)#(.+)$/.exec(want || "");
if (!spec) {
  fail("package.json " + NAME + " is not a GitHub repo#ref: " + want);
}
const [, repo, ref] = spec;

let locked;
if (lock.packages) {
  const entry = lock.packages["node_modules/" + NAME];
  locked = entry && entry.resolved;
} else if (lock.dependencies) {
  const entry = lock.dependencies[NAME];
  if (entry && entry.from !== "github:" + want) {
    fail("pins " + entry.from + ", package.json wants " + want);
  }
  locked = entry && entry.version;
}
const lockedCommit = /#([0-9a-f]{40})$/.exec(locked || "");
if (!lockedCommit) {
  fail("no commit pinned for " + NAME + " (lockfileVersion " + lock.lockfileVersion + ")");
}

let target;
if (/^[0-9a-f]{7,40}$/.test(ref)) {
  // package.json pins a commit itself
  target = lockedCommit[1].startsWith(ref) ? lockedCommit[1] : ref;
} else {
  // Annotated tags list their commit as "<tag>^{}"; prefer it when present
  const remote = execFileSync("git", ["ls-remote", "https://github.com/" + repo + ".git", ref, ref + "^{}"], { encoding: "utf8" });
  const lines = remote.trim().split("\n").filter(Boolean).map(line => line.split("\t"));
  const peeled = lines.find(([, name]) => name.endsWith("^{}"));
  target = (peeled || lines[0] || [])[0];
  if (!target) {
    fail(repo + "#" + ref + " not found on GitHub");
  }
}

console.log(NAME + ": package.json " + want + " -> " + target + ", lock (v" + lock.lockfileVersion + ") " + lockedCommit[1]);
if (target !== lockedCommit[1]) {
  fail("pins " + lockedCommit[1] + " but " + ref + " is " + target + "; run npm install to update the lock");
}
