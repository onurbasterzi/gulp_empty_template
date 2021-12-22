const { src, dest, watch, series, parallel } = require("gulp");
var babel = require("gulp-babel");
const dartSass = require("sass");
const gulpSass = require("gulp-sass");
const sass = gulpSass(dartSass);
const postcss = require("gulp-postcss");
const cssnano = require("cssnano");
const autoprefixer = require("autoprefixer");
const terser = require("gulp-terser");
const browsersync = require("browser-sync").create();
const concat = require("gulp-concat");
const replace = require("gulp-replace");
const imagemin = require("gulp-imagemin");
const useref = require("gulp-useref");
const gulpif = require("gulp-if");


// SASS-TASKS
function scssTask() {
  return src("src/scss/main.scss", { sourcemaps: true })
    .pipe(sass())
    .pipe(postcss([autoprefixer()]))
    .pipe(concat("styles.css"))
    .pipe(dest("src/css", { sourcemaps: "." }));
}

function scssBuildTask() {
  return src("src/scss/main.scss", { sourcemaps: true })
    .pipe(sass())
    .pipe(postcss([cssnano(), autoprefixer()]))
    .pipe(concat("styles.css"))
    .pipe(dest("dist/css", { sourcemaps: "." }));
}


// JS-TASK
function jsBuildTask() {
  return src("*.html")
    .pipe(replace("src/css", "css"))
    .pipe(replace("src/images", "images"))
    .pipe(useref())
    .pipe(gulpif("*.js", babel({ presets: ["@babel/preset-env"]})))
    .pipe(gulpif("*.js", terser()))
    .pipe(dest("dist"));
}

// IMAGE TASK
function imgBuildTask() {
  return src("src/images/**/*").pipe(imagemin()).pipe(dest("dist/images"));
}


//Browsersyns Tasks
function browsersynServer(callback) {
  browsersync.init({
    server: {
      baseDir: ".",
    },
  });
  callback();
}
function browsersynReload(callback) {
  browsersync.reload();
  callback();
}

//WATCH TASK
const developmentSeries = series(scssTask, browsersynReload);
const buildSeries = parallel(scssBuildTask, jsBuildTask, imgBuildTask);

function watchTask() {
  watch("*.html", developmentSeries);
  watch(["src/scss/**/*.scss", "src/scripts/**/*.js"], developmentSeries);
}

//DEVELOPMENT & PRODUCTION EXPORTS
exports.default = series(scssTask, browsersynServer, watchTask);
exports.build = buildSeries;
