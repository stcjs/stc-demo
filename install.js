const fs = require("fs"),
	https = require('https'),
	exec = require('child_process').exec,
	STR_DASH = "========================================",
	REG_LOCAL = /^(stc[\w-]*|flkit)$/,
	REG_DEMO_DIR = /stc-demo$/;

var currentJob = "",
	modules = [],
	totalPassed = 0;

Promise.resolve()
	.then(curryTask("Getting packages", getPackages))
	.then(curryTask("Making stcjs dir", () => {
		if (isInStcDemo()) {
			console.log("In dir stc-demo, doesn't require so.");
			return;
		}
		return folderExistsPromise('stcjs')
			.catch(() => execPromise("mkdir stcjs"));
	}))
	.then(curryTask("Switching folder to stcjs", () => {
		if (isInStcDemo()) {
			process.chdir('../');
		} else {
			process.chdir('stcjs');
		}
		console.log('Current directory: ' + process.cwd());
	}))
	.then(curryTask("Git Cloning or pulling", () => {
		return Promise.all(modules.map((name) => {
			return folderExistsPromise(name, true)
				.then(() => execPromise('git branch | grep "* master"', { cwd: name })
					.then(() => execPromise('git pull origin master', { cwd: name }))
					.catch((err) => console.log(`${name}\t${String(err)}`))
				)
				.catch(() => execPromise(`git clone git@github.com:stcjs/${name}.git`));
		}))
	}))
	.then(curryTask("Making folder node_modules", () => {
		return folderExistsPromise('node_modules')
			.catch(() => execPromise("mkdir node_modules")); // todo using `fs.mkdir`
	}))
	.then(curryTask("Making symbol link for stc projects in node_modules", () => {
		return Promise.all(modules.map((name) => {
			return folderExistsPromise(`node_modules/${name}`)
				.catch(() => execPromise(/^win/.test(process.platform) ? `mklink /J ${name} "../${name}"` : `ln -s ../${name} ${name}`, {
					cwd: `node_modules`
				}));
		}));
	}))
	.then(curryTask("Resolving all `package.json` & generating one", resolvePackageJSON))
	.then(curryTask("Installing npm package", () => {
		return execPromise("npm install --registry=https://registry.npm.taobao.org", {
			pipe: true
		})
	}))
	.then(() => {
		console.log(`${STR_DASH}\nAll done.`);
	})
	.catch((err) => {
		console.error(`${STR_DASH}\nError during task: ${currentJob}`);
		console.error(err);
	});

function isInStcDemo() {
	return REG_DEMO_DIR.test(process.cwd());
}

function curryTask(taskName, fn) {
	return function () {
		var startTime = +new Date();
		currentJob = taskName;
		console.log(`${STR_DASH}\nTask start: ${currentJob}`);
		return (fn() || Promise.resolve())
			.then(() => {
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
		modules.map((name) => {
			var dir = `${name}/package.json`;
			return readJSONPromise(dir)
				.then((data) => {
					setKey(data, "dependencies");
					setKey(data, "devDependencies");
				})
				.then(() => {
					console.log(`Parsed\t${dir}`);
				})
				.catch((err) => {
					console.log(`Error\t${dir}`);
					// console.error(err);
				});
		})
	).then(() => writeJSONPromise(`package.json`, package));

	function setKey(data, base) {
		for (var key in data[base]) {
			if (REG_LOCAL.test(key)) {
				continue;
			}
			if (!package[base][key] || package[base][key] > data[base][key]) {
				package[base][key] = data[base][key];
			}
		}
	}

	function readJSONPromise(file) {
		return new Promise((resolve, reject) => {
			fs.readFile(file, "utf-8", (err, data) => {
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
		return new Promise((resolve, reject) => {
			fs.writeFile(file, JSON.stringify(json, null, '\t'), "utf-8", (err, data) => {
				if (err) {
					reject(err);
					return;
				}
				resolve();
			});
		});
	}
}

function folderExistsPromise(folder, mute) {
	return new Promise((resolve, reject) => {
		fs.access(folder, fs.R_OK, (err) => {
			if (err) {
				reject(err);
				return;
			}
			resolve();
		});
	}).then(() => {
		!mute && console.log(`Folder "${folder}" exists.`);
	});
}

function execPromise(cmd, options) {
	console.log(`${cmd}${options && options.cwd && ("\t@" + options.cwd) || ""}`);
	var promise = new Promise((resolve, reject) => {
		var event = exec(cmd, options, (err, stdout, stderr) => {
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

function getPackages() {
	const packageUrl = 'https://raw.githubusercontent.com/stcjs/stc-demo/master/package.js';

	return new Promise(function (resolve, reject) {
		try {
			modules = require('./package.js');
		} catch (e) { }

		if (modules.length) {
			return resolve();
		}

		console.log('get packages from ' + packageUrl);
		https.get(packageUrl, function (res) {
			if (res.statusCode !== 200) {
				return reject(new Error('get packages error'));
			}
			var buffers = [];
			res.on('data', function (buf) {
				buffers.push(buf);
			})
			res.on('end', function (params) {
				var data = Buffer.concat(buffers);
				fs.writeFileSync('./package.js', data);
				modules = require('./package.js');
				fs.unlinkSync('./package.js');
				resolve();
			})
		})
	})
}