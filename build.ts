// Builds the project, then tests it:
//   1. type checks src/ and tests/
//   2. bundles src/main.ts + everything it imports -> dist/app.js   (ONE plain script, no server needed)
//   3. copies public/**/*                           -> dist/**/*    (HTML, CSS, images, as-is)
//   4. removes anything in dist/ that no longer comes from public/
//   5. runs every test in tests/ and writes a readable report to test_output/
//
// Run once:                         deno task build
// Rebuild and retest on every save: deno task dev   (terminal.console starts this for you)
//
// You never need to edit this file.

import { runTests, typeCheck } from "./tools/test_report.ts";

const ROOT_DIR = new URL("./", import.meta.url);
const PUBLIC_DIR = new URL("./public/", ROOT_DIR);
const DIST_DIR = new URL("./dist/", ROOT_DIR);
const WATCHED_DIRS = ["src/", "public/", "tests/"];

// Runs "deno <args>" in the project folder, and waits for it to finish.
// When `quiet` is true the output is only shown if the command fails.
async function deno(args: string[], quiet = false): Promise<boolean> {
  const result = await new Deno.Command(Deno.execPath(), {
    args,
    cwd: ROOT_DIR,
    stdout: quiet ? "piped" : "inherit",
    stderr: quiet ? "piped" : "inherit",
  }).output();

  if (quiet && !result.success) {
    await Deno.stdout.write(result.stdout);
    await Deno.stderr.write(result.stderr);
  }
  return result.success;
}

// Copies every file under public/ (HTML, CSS, images, ...) as-is. Returns how many were copied.
async function copyFolder(from: URL, to: URL): Promise<number> {
  let copied = 0;
  await Deno.mkdir(to, { recursive: true });
  for await (const entry of Deno.readDir(from)) {
    if (entry.isDirectory) {
      copied += await copyFolder(new URL(entry.name + "/", from), new URL(entry.name + "/", to));
    } else if (entry.name !== ".DS_Store" && !entry.name.endsWith(".cel")) { // .cel = Celbridge editor settings
      await Deno.copyFile(new URL(entry.name, from), new URL(entry.name, to));
      copied++;
    }
  }
  return copied;
}

// Removes anything in dist/ that no longer comes from public/ (e.g. a deleted image).
async function removeOldFiles(dist: URL, from: URL, prefix = ""): Promise<void> {
  for await (const entry of Deno.readDir(dist)) {
    if (prefix + entry.name === "app.js" || entry.name === ".DS_Store") continue;
    const name = entry.name + (entry.isDirectory ? "/" : "");
    const inPublic = await Deno.stat(new URL(name, from)).then(() => true, () => false);
    if (!inPublic) {
      await Deno.remove(new URL(name, dist), { recursive: true });
      console.log(`Removed dist/${prefix}${name} (no longer in public/)`);
    } else if (entry.isDirectory) {
      await removeOldFiles(new URL(name, dist), new URL(name, from), prefix + name);
    }
  }
}

async function build(): Promise<void> {
  const started = performance.now();
  console.log(`\n=== Build started at ${new Date().toLocaleTimeString()} ===`);

  // dist/ is updated in place (not deleted and recreated), so a preview that has dist/index.html open
  // keeps working across rebuilds. Old files are cleaned up at the end instead (step 4).
  await Deno.mkdir(DIST_DIR, { recursive: true });

  // 1. Type check (bundling only strips the types, it doesn't check them).
  //    Errors are reported, but the page is still built so you can keep experimenting.
  const checked = await typeCheck(ROOT_DIR);
  if (!checked.ok) {
    console.log(checked.text);
    console.log("TypeScript found errors (see above) - the page was still built, but may not work");
  }

  // 2. Bundle src/main.ts, and every file it imports, into dist/app.js.
  //    --format=iife makes a plain <script>, so dist/index.html works opened straight from the disk.
  const bundled = await deno(
    ["bundle", "--quiet", "--platform=browser", "--format=iife", "--output=dist/app.js", "src/main.ts"],
    true,
  );
  if (bundled) {
    console.log("Built dist/app.js from src/main.ts (and the files it imports)");
  } else {
    console.log("The page could not be built (see above)");
  }

  // 3. Copy public/ into dist/.
  const copied = await copyFolder(PUBLIC_DIR, DIST_DIR);
  console.log(`Copied ${copied} file(s) from public/ to dist/`);

  // 4. Clean up dist/.
  await removeOldFiles(DIST_DIR, PUBLIC_DIR);

  const builtIn = ((performance.now() - started) / 1000).toFixed(1);
  console.log(`dist/ is up to date (${builtIn}s) - press refresh on the dist/index.html preview`);

  // 5. Test, and write test_output/index.html + test_output/summary.md.
  await runTests(ROOT_DIR, checked);
}

// Rebuilds whenever a file in src/, public/ or tests/ changes.
//
// This watcher is written by hand (rather than using "deno run --watch") so that only ONE build ever runs at
// a time: "deno run --watch" restarts this script part-way through a build, leaving the deno processes it
// had already started (check, bundle, test, lint) still running - and a burst of saves piles them up until
// the computer grinds to a halt. Here, a save during a build just means "build again once this one is done".
async function watch(): Promise<void> {
  let building = false;
  let changedDuringBuild = false;
  let timer: number | undefined;

  async function rebuild(): Promise<void> {
    if (building) {
      changedDuringBuild = true; // picked up when the current build finishes
      return;
    }
    building = true;
    do {
      changedDuringBuild = false;
      try {
        await build();
      } catch (error) {
        console.log(`The build failed: ${error instanceof Error ? error.message : error}`);
      }
    } while (changedDuringBuild);
    building = false;
    console.log("\nWatching src/, public/ and tests/ - save a file to rebuild and retest (Ctrl+C to stop)");
  }

  await rebuild();

  // One save often fires several events (and editors may write several files at once), so wait until
  // things have been quiet for a moment before building.
  const paths = WATCHED_DIRS.map((dir) => decodeURIComponent(new URL(dir, ROOT_DIR).pathname));
  for await (const event of Deno.watchFs(paths)) {
    if (event.kind === "access" || event.paths.every((path) => path.endsWith(".DS_Store"))) continue;
    clearTimeout(timer);
    timer = setTimeout(rebuild, 300);
  }
}

// "deno task dev" passes --watch.
if (Deno.args.includes("--watch")) {
  await watch();
} else {
  await build();
}
