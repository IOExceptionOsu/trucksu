var gulp = require("gulp");
var concat = require("gulp-concat");
var uglify = require("gulp-uglifyjs");

gulp.task("concat", function() {
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
		.pipe(concat("trucksu.js"))
		.pipe(gulp.dest("js"));
});

gulp.task("uglify", function() {
	gulp.src("js/trucksu.js")
		.pipe(uglify("trucksu.min.js", { "mangle": false }))
		.pipe(gulp.dest("js"));
});

gulp.task("default", function() {
	gulp.start("concat", "uglify");
});