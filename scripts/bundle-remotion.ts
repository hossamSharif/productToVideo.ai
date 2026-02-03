import { bundle } from "@remotion/bundler";
import path from "path";

async function main() {
  const bundleLocation = await bundle({
    entryPoint: path.resolve("./src/remotion/index.ts"),
    outDir: path.resolve("./remotion-bundle"),
  });

  console.log(`Bundle created at: ${bundleLocation}`);
}

main().catch((err) => {
  console.error("Bundle failed:", err);
  process.exit(1);
});
