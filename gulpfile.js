const fs = require('fs');
const gulp = require('gulp');
const yargs = require('yargs');
const Bundler = require('parcel-bundler');
const themekit = require('@shopify/themekit');
const plugins = require('gulp-load-plugins')();

/* Environment
----------------------------------------------------*/
const { argv } = yargs(process.argv);
const environment = argv.env || 'development';

/* Theme
----------------------------------------------------*/
const theme = {
  sources: {
    assets: 'src/assets/*.*',
    config: 'src/config/*.json',
    layout: 'src/layout/*.liquid',
    locales: 'src/locales/*.json',
    sections: 'src/sections/*.liquid',
    snippets: 'src/snippets/*.liquid',
    templates: 'src/templates/**/*.liquid',
  },
  tasks: {
    assets: () => {
      return gulp.src(theme.sources.assets).pipe(gulp.dest('dist/assets'));
    },
    config: () => {
      return gulp.src(theme.sources.config).pipe(gulp.dest('dist/config'));
    },
    layout: () => {
      return gulp.src(theme.sources.layout).pipe(gulp.dest('dist/layout'));
    },
    locales: () => {
      return gulp.src(theme.sources.locales).pipe(gulp.dest('dist/locales'));
    },
    sections: () => {
      return gulp.src(theme.sources.sections).pipe(gulp.dest('dist/sections'));
    },
    snippets: () => {
      return gulp.src(theme.sources.snippets).pipe(gulp.dest('dist/snippets'));
    },
    templates: () => {
      return gulp.src(theme.sources.templates).pipe(gulp.dest('dist/templates'));
    },
  },
};

/* Copy
----------------------------------------------------*/
gulp.task(
  'copy',
  gulp.parallel(
    theme.tasks.assets,
    theme.tasks.config,
    theme.tasks.layout,
    theme.tasks.locales,
    theme.tasks.sections,
    theme.tasks.snippets,
    theme.tasks.templates
  )
);

/* Bundle
----------------------------------------------------*/
gulp.task('bundle', async (options) => {
  const entry = 'src/main.js';

  if (fs.existsSync(entry)) {
    const bundler = new Bundler(entry, {
      hmr: false,
      minify: true,
      watch: false,
      sourceMaps: false,
      outDir: 'dist/assets',
      ...options,
    });

    bundler.bundle();
  }
});

/* Clean
----------------------------------------------------*/
gulp.task('clean', () => {
  return gulp.src(['dist/*', '.cache/*']).pipe(plugins.clean({ force: true }));
});

gulp.task(
  'watch',
  gulp.series('clean', 'copy', async function proceeding() {
    gulp.watch(theme.sources.assets, theme.tasks.assets);
    gulp.watch(theme.sources.config, theme.tasks.config);
    gulp.watch(theme.sources.layout, theme.tasks.layout);
    gulp.watch(theme.sources.locales, theme.tasks.locales);
    gulp.watch(theme.sources.sections, theme.tasks.sections);
    gulp.watch(theme.sources.snippets, theme.tasks.snippets);
    gulp.watch(theme.sources.templates, theme.tasks.templates);

    gulp.task('bundle')({ minify: false, watch: true });

    themekit.command('watch', { dir: 'dist', env: environment });
  })
);

gulp.task(
  'deploy',
  gulp.series('clean', 'copy', 'bundle', async function proceeding() {
    themekit.command('deploy', {
      dir: 'dist',
      env: environment,
      allowLive: true,
    });
  })
);

/* Serve
----------------------------------------------------*/
// gulp.task('serve', async () => {
//   while (true) {
//     const { STORE } = envKit.get();

//     spawnSync('shopify', ['switch', `--store=${STORE}`], {
//       stdio: 'inherit',
//     });

//     const { status } = spawnSync('shopify', ['theme', 'serve'], {
//       cwd: 'dist',
//       stdio: 'inherit',
//     });

//     if (status === 1) execSync('shopify logout');
//   }
// });
