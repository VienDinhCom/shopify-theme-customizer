const gulp = require('gulp');
const envKit = require('env-kit');
const merge = require('merge-stream');
const path = require('path');
const plugins = require('gulp-load-plugins')();
const { execSync, spawnSync } = require('child_process');

const { STORE } = envKit.get();

/* Tasks
----------------------------------------------------*/
const sources = {
  assets: 'src/assets/*.*',
  config: 'src/config/*.json',
  layout: 'src/layout/*.liquid',
  locales: 'src/locales/*.json',
  sections: 'src/sections/*.liquid',
  snippets: 'src/snippets/*.liquid',
  templates: ['src/templates/**/*.liquid', 'src/templates/**/*.json'],
};

const tasks = {
  assets: () => {
    return gulp.src(sources.assets).pipe(gulp.dest('dist/assets'));
  },
  config: () => {
    return gulp.src(sources.config).pipe(gulp.dest('dist/config'));
  },
  layout: () => {
    return gulp.src(sources.layout).pipe(gulp.dest('dist/layout'));
  },
  locales: () => {
    return gulp.src(sources.locales).pipe(gulp.dest('dist/locales'));
  },
  sections: () => {
    return gulp.src(sources.sections).pipe(gulp.dest('dist/sections'));
  },
  snippets: () => {
    return gulp.src(sources.snippets).pipe(gulp.dest('dist/snippets'));
  },
  templates: () => {
    return gulp.src(sources.templates).pipe(gulp.dest('dist/templates'));
  },
};

/* Copy
----------------------------------------------------*/
gulp.task(
  'copy',
  gulp.parallel(
    tasks.assets,
    tasks.config,
    tasks.layout,
    tasks.locales,
    tasks.sections,
    tasks.snippets,
    tasks.templates
  )
);

/* Bundle
----------------------------------------------------*/
const Bundler = require('parcel-bundler');

gulp.task('bundle', (options) => {
  return new Bundler('src/main.js', {
    outDir: 'dist/assets',
    hmr: false,
    watch: false,
    minify: false,
    sourceMaps: false,
    ...options,
  }).bundle();
});

/* Watch
----------------------------------------------------*/
gulp.task('watch', () => {
  gulp.task('bundle')({ watch: true });

  gulp.watch(sources.assets, tasks.assets);
  gulp.watch(sources.config, tasks.config);
  gulp.watch(sources.layout, tasks.layout);
  gulp.watch(sources.locales, tasks.locales);
  gulp.watch(sources.sections, tasks.sections);
  gulp.watch(sources.snippets, tasks.snippets);
  gulp.watch(sources.templates, tasks.templates);
});

/* Serve
----------------------------------------------------*/
gulp.task('serve', async () => {
  for (let index = 0; index < 3; index++) {
    spawnSync('shopify', ['switch', `--store=${STORE}`], {
      stdio: 'inherit',
    });

    const { status } = spawnSync('shopify', ['theme', 'serve'], {
      cwd: 'dist',
      stdio: 'inherit',
    });

    if (status === 1) execSync('shopify logout');
  }
});

/* Clean
----------------------------------------------------*/
gulp.task('clean', () => {
  return gulp.src(['dist/*', '.cache/*']).pipe(plugins.clean({ force: true }));
});

gulp.task('build', gulp.series('clean', gulp.parallel('copy', 'bundle')));

gulp.task('dev', gulp.series('clean', 'copy', gulp.parallel('watch', 'serve')));
