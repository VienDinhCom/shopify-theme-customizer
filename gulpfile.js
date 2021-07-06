const gulp = require("gulp");
const envKit = require("env-kit");
const { execSync, spawnSync } = require("child_process");

const { STORE } = envKit.get();

gulp.task("serve", async () => {
  while (true) {
    spawnSync("shopify", ["switch", `--store=${STORE}`], {
      stdio: "inherit",
    });

    const { status } = spawnSync("shopify", ["theme", "serve"], {
      cwd: "src",
      stdio: "inherit",
    });

    if (status === 1) execSync("shopify logout");
  }
});
