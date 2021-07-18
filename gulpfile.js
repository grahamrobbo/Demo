/* eslint-disable no-undef */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
const fs = require("fs")
const gulp = require("gulp")
const bump = require("gulp-bump")
const ui5Preload = require("gulp-openui5-preload")
const del = require("del")
const copy = require("gulp-copy")
const uglify = require("gulp-uglify-es").default
const watch = require("gulp-watch")
const plumber = require("gulp-plumber")
const eslint = require("gulp-eslint")
//const tslint = require("gulp-tslint")
const sort = require("gulp-sort")
const jshint = require("gulp-jshint")
const less = require("gulp-less")
const path = require("path")
const replace = require("gulp-replace")
const rename = require("gulp-rename")
const gulpif = require("gulp-if")
const prettydata = require("gulp-pretty-data")

const APP = "./"
const BUILD = `${APP}build`
const DIST = `${APP}dist`
const SRC = `${APP}src`
const REUSE = `reuse`
const TIME = new Date().getTime()

gulp.task("lint:nofail", () => {
	return gulp
		.src([`${SRC}/**/*.js`, `${SRC}/**/*.json`, `!${SRC}/app/themes/**/*`])
		.pipe(jshint())
		.pipe(jshint.reporter("jshint-stylish"))
})

gulp.task("💄 eslint", () => {
	return gulp
		.src([`${SRC}/**/*.js`, `!${SRC}/app/themes/**/*`])
		.pipe(plumber())
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError())
})

gulp.task("eslint:nofail", () => {
	return gulp
		.src([`${SRC}/**/*.js`, `!${SRC}/app/themes/**/*`])
		.pipe(plumber())
		.pipe(eslint())
		.pipe(eslint.format())
})

gulp.task("lint", () => {
	return gulp
		.src([`${SRC}/**/*.js`, `${SRC}/**/*.json`, `!${SRC}/app/themes/**/*`])
		.pipe(jshint())
		.pipe(jshint.reporter("jshint-stylish"))
		.pipe(jshint.reporter("fail"))
})

// gulp.task("tslint", () => {
// 	return gulp
// 		.src([`${SRC}/**/*.js`, `!${SRC}/app/themes/**/*`])
// 		.pipe(
// 			tslint({
// 				formatter: "verbose"
// 			})
// 		)
// 		.pipe(tslint.report())
// })

gulp.task("🧹 clean:build", (cb) => {
	del(`${BUILD}`).then(
		() => {
			cb()
		},
		(reason) => {
			cb(reason)
		}
	)
})

gulp.task("🧹 clean:dist", (cb) => {
	del(`${DIST}`).then(
		() => {
			cb()
		},
		(reason) => {
			cb(reason)
		}
	)
})

gulp.task("➡️ copy:build", () => {
	return gulp
		.src([
			`${SRC}/**/*.xml`,
			`${SRC}/**/*.js`,
			`${SRC}/**/*.json`,
			`${SRC}/**/*.properties`,
			`${SRC}/**/*.html`,
			`!${SRC}/app/themes/**/*`,
			`!${SRC}/reuse/reuseTemplate/**/*`,
		])
		.pipe(gulp.dest(`${BUILD}`))
})

gulp.task("➡️ copy:dist:minified", () => {
	return gulp
		.src([`${BUILD}/**/*`])
		.pipe(gulpif("**/*.js", uglify()))
		.pipe(
			gulpif(
				"**/*.xml",
				prettydata({
					type: "minify",
				})
			)
		)
		.pipe(gulp.dest(`${DIST}`))
})

gulp.task("➡️ copy:dist:dbg", () => {
	return gulp
		.src([`${BUILD}/**/*.js`])
		.pipe(
			rename((path) => {
				let name = path.basename.split(".")
				name[0] += "-dbg"
				path.basename = name.join(".")
			})
		)
		.pipe(gulp.dest(`${DIST}`))
})

gulp.task("preload:main", () => {
	return gulp
		.src([`${BUILD}/**/*.js`, `${BUILD}/**/*.xml`, `!${BUILD}/reuse/**/*`])
		.pipe(sort())
		.pipe(gulpif("**/*.js", uglify()))
		.pipe(
			gulpif(
				"**/*.xml",
				prettydata({
					type: "minify",
				})
			)
		)
		.pipe(
			ui5Preload({
				prefix: "yelcho/dp",
			})
		)
		.pipe(replace("yelcho/dp/app/", "yelcho/dp/"))
		.pipe(gulp.dest(`${DIST}/app`))
})

function getFolders(dir) {
	return fs.readdirSync(dir).filter(function (file) {
		return fs.statSync(path.join(dir, file)).isDirectory()
	})
}

function buildReuseComponents(done) {
	const reuseList = getFolders(`${BUILD}/${REUSE}`)

	const tasks = reuseList.map((reuseComponent) => {
		// Right here, we return a function per folder
		const buildPreload = () =>
			gulp
				.src([
					`${BUILD}/reuse/${reuseComponent}/**/*.js`,
					`${BUILD}/reuse/${reuseComponent}/**/*.xml`,
				])
				.pipe(sort())
				.pipe(gulpif("**/*.js", uglify()))
				.pipe(
					gulpif(
						"**/*.xml",
						prettydata({
							type: "minify",
						})
					)
				)
				.pipe(
					ui5Preload({
						prefix: `yelcho/dp/reuse/${reuseComponent}`,
					})
				)
				.pipe(gulp.dest(`${DIST}/reuse/${reuseComponent}/`))

		buildPreload.displayName = `🧩 Component preload ${reuseComponent}`
		return buildPreload
	})

	const reuseTasksDone = (seriesDone) => {
		seriesDone()
		done()
	}

	return gulp.series(...tasks, reuseTasksDone)()
	//return gulp.series(gulp.parallel(...tasks), reuseTasksDone)();
}

const reuse = gulp.series(buildReuseComponents)
gulp.task("preload:reuseComponents", reuse)

gulp.task(
	"📚 preload",
	gulp.parallel("preload:main", "preload:reuseComponents")
)

gulp.task("🤺 less", () => {
	return gulp
		.src([
			`${SRC}/**/*.less`,
			`!${SRC}/app/themes/**/*`,
			`!${SRC}/reuse/reuseTemplate/**/*`,
		])
		.pipe(
			less({
				paths: [path.join(__dirname, "less", "includes")],
			})
		)
		.pipe(gulp.dest(`${SRC}`))
		.pipe(gulp.dest(`${BUILD}`))
})

gulp.task("webserver", () => {
	gulp.src(`${APP}/`).pipe(
		server({
			path: `${APP}/watch.html`,
			livereload: true,
			open: true,
			defaultFile: "watch.html",
		})
	)
})

gulp.task("➕ bump:AppManifest", () => {
	return gulp
		.src(`${SRC}/manifest.json`)
		.pipe(bump({ type: `prerelease` }))
		.pipe(gulp.dest(`${SRC}`))
})

gulp.task("bump", () => {
	return gulp
		.src(`${SRC}/sw.js`)
		.pipe(bump())
		.pipe(gulp.dest(`${SRC}/`))
})

gulp.task("✅ successMessage", (cb) => {
	cb()
	console.log(
		"\x1b[32m%s\x1b[0m",
		"        ✅     Successfully Completed     ✅"
	)
})

gulp.task(
	"dist",
	gulp.series([
		"💄 eslint",
		"🧹 clean:build",
		"🧹 clean:dist",
		"➕ bump:AppManifest",
		//"bump",
		"➡️ copy:build",
		"🤺 less",
		"📚 preload",
		"➡️ copy:dist:minified",
		"➡️ copy:dist:dbg",
		"🧹 clean:build",
		"✅ successMessage",
	])
)

gulp.task("watch", () => {
	return watch(`${SRC}/**/*`, gulp.series(["dist"]))
})
