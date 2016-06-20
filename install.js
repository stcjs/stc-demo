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
		"stc-cli"
	];

var currentJob = "";

execPromise("mkdir stcjs")
	.then(function () {
		process.chdir('stcjs');
		console.log('Current directory: ' + process.cwd());
	})
	.then(function () {
		currentJob = "Git Cloning";
		return execAll("git clone https://github.com/stcjs/:name/")
	})
	.then(function () {
		currentJob = "making folder node_modules";
		return execPromise("mkdir node_modules");
	})
	.then(function () {
		currentJob = "making soft links for each project";
		return execAll(`ln -s ../:name :name`, {
			cwd: `node_modules`
		});
	})
	.then(function () {
		currentJob = "installing npm package in stc";
		return execPromise("npm install --registry=https://registry.npm.taobao.org", {
			cwd: "stc",
			pipe: true
		});
	})
	.then(function () {
		currentJob = "installing npm package in stc-demo";
		return execPromise("npm install --registry=https://registry.npm.taobao.org", {
			cwd: "stc-demo",
			pipe: true
		});
	})
	.then(function () {
		console.log(`========================================`);
		console.log(`All done.`);
	})
	.catch(function (err) {
		console.log(`========================================`);
		console.error(`Error:\t${currentJob}`);
		console.error(err);
		console.log(`========================================`);
	});

function execAll(str, options) {
	console.log(`========================================`);
	console.log(`Task start:\t${currentJob}`);
	return Promise.all(
		modules.map(function (name) {
			return execPromise(
				str.replace(/:name/g, name),
				options
			);
		})
	).then(function () {
		console.log(`Task done:\t${currentJob}`);
		console.log(`========================================`);
	});
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
