#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");
const indexPath = path.join(distDir, "index.html");
const webBundleDir = path.join(distDir, "_expo", "static", "js", "web");
const headersSourcePath = path.join(projectRoot, "public", "_headers");
const headersOutputPath = path.join(distDir, "_headers");

const bundleFile = fs
  .readdirSync(webBundleDir)
  .find((fileName) => fileName.endsWith(".js"));

if (!bundleFile) {
  throw new Error(`Could not find the web JS bundle in ${webBundleDir}`);
}

const bundle = fs.readFileSync(path.join(webBundleDir, bundleFile), "utf8");
const ioniconsFontMatch = bundle.match(
  /["'](\/assets\/node_modules\/@expo\/vector-icons\/build\/vendor\/react-native-vector-icons\/Fonts\/Ionicons\.[^"']+\.ttf)["']/,
);

if (!ioniconsFontMatch) {
  throw new Error("Could not find the exported Ionicons font URL.");
}

const ioniconsFontUrl = ioniconsFontMatch[1];
const ioniconsHeadTags = [
  `<link rel="preload" href="${ioniconsFontUrl}" as="font" type="font/ttf" crossorigin="anonymous" />`,
  `<style id="ionicons-font-face">@font-face{font-family:"ionicons";src:url("${ioniconsFontUrl}") format("truetype");font-display:block}</style>`,
].join("\n  ");

let indexHtml = fs.readFileSync(indexPath, "utf8");

if (!indexHtml.includes('id="ionicons-font-face"')) {
  indexHtml = indexHtml.replace("</head>", `  ${ioniconsHeadTags}\n</head>`);
  fs.writeFileSync(indexPath, indexHtml);
}

if (fs.existsSync(headersSourcePath)) {
  fs.copyFileSync(headersSourcePath, headersOutputPath);
}

console.log(`Prepared web export with Ionicons font preload: ${ioniconsFontUrl}`);
