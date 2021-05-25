const os = require('os');
const gulp = require('gulp');
const path = require('path');
const readYaml = require('read-yaml-file');
const { exec } = require('child_process');
const browserSync = require('browser-sync');
const themekit = require('@shopify/themekit');
const plugins = require('gulp-load-plugins')();

const { NODE_ENV } = process.env;
const config = readYaml.sync('config.yml')[NODE_ENV];
const watch = path.join(os.tmpdir(), `${config.theme_id}.theme`);

gulp.task('watch', () => {
  themekit.command('watch', {
    dir: 'src',
    env: NODE_ENV,
    allowLive: true,
    notify: watch,
  });
});

gulp.task('serve', () => {
  browserSync({
    port: 8080,
    open: false,
    https: true,
    notify: false,
    reloadDelay: 1500,
    proxy: `https://${config.store}/?preview_theme_id=${config.theme_id}`,
    files: watch,
    snippetOptions: {
      rule: {
        match: /<\/body>/i,
        fn: (snippet, match) => snippet + match,
      },
    },
  });
});

gulp.task('test', (callback) => {
  exec('theme-check src', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    callback(err);
  });
});

gulp.task('clean', () => {
  return gulp.src(['src/*']).pipe(plugins.clean({ force: true }));
});

gulp.task(
  'get',
  gulp.series('clean', function process() {
    return themekit.command('get', {
      dir: 'src',
      env: NODE_ENV,
      allowLive: true,
    });
  })
);

gulp.task('deploy', () => {
  return themekit.command('deploy', {
    dir: 'src',
    env: NODE_ENV,
    allowLive: true,
  });
});

gulp.task('dev', gulp.series('deploy', gulp.parallel('watch', 'serve')));
