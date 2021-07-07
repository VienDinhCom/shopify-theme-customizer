const os = require('os');
const fs = require('fs');
const gulp = require('gulp');
const yargs = require('yargs');
const Bundler = require('parcel-bundler');
const themekit = require('@shopify/themekit');
const path = require('path');
const plugins = require('gulp-load-plugins')();

/* Options
----------------------------------------------------*/
const options = (() => {
  const { argv } = yargs(process.argv);

  return {
    dir: 'dist',
    env: argv.env || 'development',
    'no-theme-kit-access-notifier': true,
  };
})();

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

/* Sync
----------------------------------------------------*/
gulp.task(
  'sync',
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
gulp.task('bundle', async ({ watch }) => {
  const entry = 'src/main.js';

  if (fs.existsSync(entry)) {
    process.env.NODE_ENV = watch ? 'development' : 'production';

    const bundler = new Bundler(entry, {
      hmr: false,
      watch: watch,
      minify: !watch,
      sourceMaps: false,
      outDir: 'dist/assets',
    });

    await bundler.bundle();
  }
});

/* Clean
----------------------------------------------------*/
gulp.task('clean', () => {
  return gulp.src(['dist/*', '.cache/*']).pipe(plugins.clean({ force: true }));
});

/* Watch
----------------------------------------------------*/
gulp.task(
  'watch',
  gulp.series('clean', 'sync', async function proceeding() {
    // Sync
    gulp.watch(theme.sources.assets, theme.tasks.assets);
    gulp.watch(theme.sources.config, theme.tasks.config);
    gulp.watch(theme.sources.layout, theme.tasks.layout);
    gulp.watch(theme.sources.locales, theme.tasks.locales);
    gulp.watch(theme.sources.sections, theme.tasks.sections);
    gulp.watch(theme.sources.snippets, theme.tasks.snippets);
    gulp.watch(theme.sources.templates, theme.tasks.templates);

    // Bundle
    gulp.task('bundle')({ watch: true });

    // ThemeKit
    const notify = path.join(__dirname, 'notify');

    themekit.command('watch', { ...options, notify });

    // LiveReload
    plugins.livereload.listen({ quiet: true });

    gulp.watch(notify, function reload() {
      return gulp.src(notify).pipe(plugins.wait(1500)).pipe(plugins.livereload());
    });

    // Open
    setTimeout(() => themekit.command('open', { ...options }), 3000);
  })
);

/* Deploy
----------------------------------------------------*/
gulp.task(
  'deploy',
  gulp.series('clean', 'sync', 'bundle', function proceeding() {
    return themekit.command('deploy', { ...options, allowLive: true });
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
