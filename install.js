const fs = require("fs"),
	exec = require('child_process').exec,
	modules = [
		"stc",
		"stc-eslint",
		"stc-babel",
		"stc-typescript",
		"stc-uglify",
		"stc-dep-parser",
		"stc-plugin",
		"stc-file",
		"stc-cluster",
		"stc-cache",
		"stc-demo",
		"stc-plugin-invoke",
		"stc-helper",
		"stc-replace",
		"stc-cli",
		"stc-demo"
	],
	STR_DASH = "========================================",
	REG_LOCAL = /^stc[\w-]*$/;

var currentJob = "",
	totalPassed = 0;

Promise.resolve()
	.then(curryTask("Making stcjs dir", function() {
		// todo using `fs.mkdir`
		return execPromise("mkdir stcjs");
	}))
	.then(curryTask("Switching folder", function () {
		process.chdir('stcjs');
		console.log('Current directory: ' + process.cwd());
	}))
	.then(curryTask("Git Cloning", function () {
		return execAll("git clone https://github.com/stcjs/:name/")
	}))
	.then(curryTask("Making folder node_modules", function () {
		// todo using `fs.mkdir`
		return execPromise("mkdir node_modules");
	}))
	.then(curryTask("Making soft links for each project", function () {
		// todo using `fs.symlink`
		return execAll(`ln -s ../:name :name`, {
			cwd: `node_modules`
		});
	}))
	.then(curryTask("Resolving all `package.json` & generating one", function () {
		return resolvePackageJSON();
	}))
	.then(curryTask("Installing npm package", function () {
		return execPromise("npm install --registry=https://registry.npm.taobao.org", {
			pipe: true
		});
	}))
	.then(function () {
		console.log(`${STR_DASH}\nAll done.`);
	})
	.catch(function (err) {
		console.error(`${STR_DASH}\nError during task: ${currentJob}`);
		console.error(err);
	});

function curryTask(taskName, fn) {
	return function () {
		var startTime = +new Date();
		currentJob = taskName;
		console.log(`${STR_DASH}\nTask start: ${currentJob}`);
		return (fn() || Promise.resolve())
			.then(function () {
				var passed = new Date() - startTime;
				totalPassed += passed;
				console.log(`Task done after: ${passed}ms, total passed time: ${totalPassed}ms.`)
			});
	}
}

function resolvePackageJSON() {
	var package = {
		dependencies: {},
		devDependencies: {}
	};
	return Promise.all(
		modules.map(function (name) {
			var dir = `${name}/package.json`;
			return readJSONPromise(dir)
				.then(function (data) {
					setKey(data, "dependencies");
					setKey(data, "devDependencies");
				})
				.then(function () {
					console.log(`Parsed\t${dir}`);
				})
				.catch(function (err) {
					console.log(`Error\t${dir}`);
					// console.error(err);
				});
		})
	).then(function () {
		return writeJSONPromise(`package.json`, package);
	});

	function setKey(data, base) {
		for (key in data[base]) {
			if (REG_LOCAL.test(key)) {
				return;
			}
			if (!package[base][key] || package[base][key] > data[base][key]) {
				package[base][key] = data[base][key];
			}
		}
	}
}

function execAll(str, options) {
	return Promise.all(
		modules.map(function (name) {
			return execPromise(
				str.replace(/:name/g, name),
				options
			);
		})
	);
}

function execPromise(cmd, options) {
	console.log(`${cmd}`);
	var promise = new Promise(function (resolve, reject) {
		var event = exec(cmd, options, function (err, stdout, stderr) {
			if (err) {
				reject(err);
				return;
			}
			resolve();
		});
		if (options && options.pipe) {
			event.stdout.pipe(process.stdout);
			event.stderr.pipe(process.stderr);
		}
	});

	return promise;
}

function readJSONPromise(file) {
	return new Promise(function (resolve, reject) {
		fs.readFile(file, "utf-8", function (err, data) {
			if (err) {
				reject(err);
				return;
			}
			resolve(
				JSON.parse(data.toString())
			);
		});
	});
}

function writeJSONPromise(file, json) {
	return new Promise(function (resolve, reject) {
		fs.writeFile(
			file,
			JSON.stringify(json, null, '\t'),
			"utf-8",
			function (err, data) {
				if (err) {
					reject(err);
					return;
				}
				resolve();
			});
	});
}
