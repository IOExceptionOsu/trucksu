var gulp = require("gulp");
var cssmin = require("gulp-cssmin");
var concatcss = require("gulp-concat-css");
var concatjs = require("gulp-concat");
var rename = require("gulp-rename");
var uglify = require("gulp-uglifyjs");

gulp.task("concat-js", function() {
	gulp.src([
		"js/src/jquery.js",
		"js/src/moment.js",
		"js/src/bootstrap.js",
		"js/src/angular.js",
		"js/src/angular-route.js",
		"js/src/livestamp.js",
		"js/src/jquery.cookie.js",
		"js/src/main.js",
		])
		.pipe(concatjs("trucksu.js"))
		.pipe(gulp.dest("js"));
});

gulp.task("uglify-js", function() {
	gulp.src("js/trucksu.js")
		.pipe(uglify("trucksu.min.js", { "mangle": false }))
		.pipe(gulp.dest("js"));
});

gulp.task("concat-css", function() {
	gulp.src("css/src/*.css")
		.pipe(concatcss("trucksu.css"))
		.pipe(gulp.dest("css"));
});

gulp.task("minify-css", function() {
	gulp.src("css/trucksu.css")
		.pipe(cssmin())
		.pipe(rename({ suffix: ".min" }))
		.pipe(gulp.dest("css"));
});

gulp.task("default", function() {
	gulp.start("concat-js", "uglify-js", "concat-css", "minify-css");
});