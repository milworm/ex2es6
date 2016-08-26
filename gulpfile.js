const gulp = require('gulp')
const gutil = require('gulp-util')
const babel = require('gulp-babel')
const watch = require('gulp-watch')
const ext2es6 = require('./lib/main.js').default

gulp.task('default', () => {
	return watch('src/*.js', (file) => {
		return gulp.src(file.path)
			.pipe(babel({
					presets: ['es2015']
			}))
			//.on('error', gutil.log)
			.pipe(gulp.dest('lib'))
	})
})

gulp.task('convert', () => {
	return gulp.src('./examples/src/class.js')
	//return gulp.src('/Users/ruslan/www/mainline/app/**/*.js')
	//return gulp.src('/Users/ruslan/www/mainline/app.js')
		.pipe(ext2es6())
		.pipe(gulp.dest('./examples/lib/'))
		//.pipe(gulp.dest('/Users/ruslan/www/mainline/es62/'))
});
