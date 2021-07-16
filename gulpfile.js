// Import required modules.
const gulp = require('gulp');
const scss = require('gulp-dart-scss');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const browserify = require('browserify');
const tsify = require('tsify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify-es').default;

// Path to source SCSS file and compiled CSS folder.
const scssFilePath = './assets/scss/app.scss';
const cssFolderPath = './assets/css';

// Path to source TS file and compiled JS folder.
const tsFilePath = './assets/ts/app.ts';
const jsFolderPath = './assets/js';

// Set JS file name.
const jsFileName = 'app.js';

// Compile SCSS without minifying and cleanup.
gulp.task('scss-dirty', function () {
	return gulp
		.src(scssFilePath)
		.pipe(scss({ includePaths: ['node_modules'] }))
		.pipe(autoprefixer('last 5 version'))
		.pipe(gulp.dest(cssFolderPath));
});

// Compile SCSS, minify and cleanup.
gulp.task('scss-clean', function () {
	return gulp
		.src(scssFilePath)
		.pipe(scss({ includePaths: ['node_modules'] }))
		.pipe(autoprefixer('last 5 version'))
		.pipe(
			cleanCSS({
				rebase: false,
				level: {
					1: {
						specialComments: 0,
					},
					2: {
						restructureRules: true,
						mergeSemantically: true,
					},
				},
			})
		)
		.pipe(gulp.dest(cssFolderPath));
});

// Compile TS, transpile with Babel.
gulp.task('ts', function () {
	return browserify({
		entries: tsFilePath,
		extensions: ['.ts'],
		debug: true,
	})
		.plugin(tsify)
		.transform('babelify', {
			presets: ['@babel/env', '@babel/preset-typescript'],
			plugins: [
				[
					'@babel/plugin-transform-runtime',
					{
						corejs: '3',
					},
				],
			],
			extensions: ['.ts'],
			sourceMaps: true,
			global: true,
		})
		.bundle()
		.pipe(source(jsFileName))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(uglify())
		.pipe(sourcemaps.write(jsFolderPath))
		.pipe(gulp.dest(jsFolderPath));
});

// Setup watch tasks for compilation on file save.
gulp.task('watch', function () {
	gulp.watch(scssFilePath, gulp.series('scss-dirty'));
	gulp.watch(tsFilePath, gulp.series('ts'));
});
