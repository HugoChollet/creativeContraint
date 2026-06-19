#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const VALID_PLATFORMS = new Set(["android", "ios"]);

const options = parseArgs(process.argv.slice(2));
const platforms =
  !options.platform || options.platform === "all"
    ? ["android", "ios"]
    : [options.platform];
const outputDir = path.resolve(options.outputDir);
const isNonInteractive = options.nonInteractive || process.env.CI === "true";

if (options.help || platforms.some((platform) => !VALID_PLATFORMS.has(platform))) {
  printUsage(options.help ? 0 : 1);
}

fs.mkdirSync(outputDir, { recursive: true });

for (const platform of platforms) {
  const commandArgs = [
    "eas-cli",
    "build",
    "--platform",
    platform,
    "--profile",
    options.profile,
    "--local",
  ];

  if (isNonInteractive) {
    commandArgs.push("--non-interactive");
  }

  console.log(`\nBuilding ${platform} locally with profile "${options.profile}"...`);

  const result = spawnSync("npx", commandArgs, {
    stdio: "inherit",
    env: {
      ...process.env,
      EAS_LOCAL_BUILD_ARTIFACTS_DIR: outputDir,
    },
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`\nBuild artifacts written to ${outputDir}`);

function parseArgs(args) {
  const options = {
    platform: null,
    profile: "preview",
    outputDir: "dist/builds",
    nonInteractive: false,
    help: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    if (arg === "--profile") {
      options.profile = readOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--output-dir") {
      options.outputDir = readOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--non-interactive") {
      options.nonInteractive = true;
      continue;
    }

    if (arg.startsWith("-")) {
      console.error(`Unknown option: ${arg}`);
      printUsage(1);
    }

    if (options.platform) {
      console.error(`Unexpected extra argument: ${arg}`);
      printUsage(1);
    }

    options.platform = arg;
  }

  return options;
}

function readOptionValue(args, optionIndex, optionName) {
  const value = args[optionIndex + 1];

  if (!value || value.startsWith("-")) {
    console.error(`Missing value for ${optionName}`);
    printUsage(1);
  }

  return value;
}

function printUsage(exitCode) {
  console.error(
    "Usage: npm run build:local -- [android|ios|all] [--profile preview] [--output-dir dist/builds] [--non-interactive]",
  );
  process.exit(exitCode);
}
