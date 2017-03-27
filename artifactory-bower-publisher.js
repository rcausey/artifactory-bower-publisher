#!/usr/bin/env node

var fs = require('fs');
var execSync = require('child_process').execSync;
var process=  require('process');
var publisher = require('artifactory-publisher');
var yargs = require('yargs');

var argv = yargs
	.usage('Usage: $0 -u [artifactory username] -p [artifactory password] -a [artifactory base url] -n [package name]')
	.demandOption(['u', 'p', 'a'])
	.argv;

var baseUrl = argv.a;
var name = argv.n;
var options = {
	credentials: {
		username: argv.u,
		password: argv.p
	},
	overwrite: false
};

var root = process.cwd();
var bowerJson = JSON.parse(fs.readFileSync(root + '/bower.json', 'utf8'));
var version = bowerJson.version;

var filename = name + '-' + version + '.tar.gz';
execSync('tar --exclude=.* --exclude=node_modules --exclude=bower_components --exclude=package.json --exclude=circle.yml -cvzf ' + filename + ' *');

var destUrl = baseUrl + '/' + name + '/' + filename;
publisher.publish(root + '/' + filename, destUrl, options)
	.then(function(published) {
		if (published) {
			console.log('Artifact published successfully.');
		} else {
			console.log('Publishing aborted. File already exists.');
		}
	}).catch(function(err) {
		console.error('Artifact failed to publish: ' + err);
	});
