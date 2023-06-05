// e.g. http://localhost/api?stats=username%3Dxamidi%26show_icons%3Dtrue%26theme%3Dradical%26include_all_commits%3Dtrue%26hide_border%3Dtrue&languages=username%3Dxamidi%26layout%3Ddonut-vertical%26theme%3Dradical%26hide_border%3Dtrue&trophies=username%3Dxamidi%26theme%3Dradical%26column%3D3%26margin-w%3D9%26margin-h%3D9%26title%3DMultiLanguage%2CLongTimeUser%2CCommits
//      used https://www.urlencoder.org on query strings

import fetch from "node-fetch"; // npm install node-fetch
import express from "express"; // npm install express
import path from "path";
import * as url from 'url';

const port = 80;
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

function timeout(ms, promise) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			reject(new Error('timeout'))
		}, ms);
		promise
			.then(value => {
				clearTimeout(timer)
				resolve(value)
			})
			.catch(reason => {
				clearTimeout(timer)
				reject(reason)
			});
	})
}

function escapeXmlCmts(unsafe) {
	return unsafe
		.replace(/-/g, "%2D")
		.replace(/</g, "%3C")
		.replace(/>/g, "%3E")
}

const requestListener = async function (req, res) {
	const {
		stats,
		languages,
		trophies,
	} = req.query;

	// 1. Obtain request URLs from query string
	let urlStats = "https://github-readme-stats.vercel.app/api?" + stats;
	let urlLanguages = "https://github-readme-stats.vercel.app/api/top-langs/?" + languages;
	let urlTrophies = "https://github-profile-trophy.vercel.app/?" + trophies;

	// 2. Query APIs
	let resStats;
	let errStats;
	await timeout(1000, fetch(urlStats)).then(function(response) {
		resStats = response;
	}).catch(function(error) {
		console.error(error);
		errStats = error;
	});
	let resLanguages;
	let errLanguages;
	await timeout(1000, fetch(urlLanguages)).then(function(response) {
		resLanguages = response;
	}).catch(function(error) {
		console.error(error);
		errLanguages = error;
	});
	let resTrophies;
	let errTrophies;
	await timeout(1000, fetch(urlTrophies)).then(function(response) {
		resTrophies = response;
	}).catch(function(error) {
		console.error(error);
		errTrophies = error;
	});
	let txtStats;
	try {
		txtStats = await resStats.text();
	} catch (error) { console.error(error); }
	let txtLanguages;
	try {
		txtLanguages = await resLanguages.text();
	} catch (error) { console.error(error); }
	let txtTrophies;
	try {
		txtTrophies = await resTrophies.text();
	} catch (error) { console.error(error); }

	// 3. Build resulting SVG
	let result = "<svg width=\"776\" height=\"352\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\" xmlns:svg=\"http:\/\/www.w3.org\/2000\/svg\" xmlns:xlink=\"http:\/\/www.w3.org\/1999\/xlink\" version=\"1.1\" viewBox=\"0 0 776 352\">\n"
	+ "\t<defs id=\"lib\">\n"
	+ "\t\t<svg id=\"stats\" width=\"467\" height=\"195\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\" xmlns:svg=\"http:\/\/www.w3.org\/2000\/svg\" xmlns:xlink=\"http:\/\/www.w3.org\/1999\/xlink\" version=\"1.1\">\n";
	if (txtStats !== undefined) {
		result +=
		  "\t\t\t<!-- BEGIN " + escapeXmlCmts(urlStats) + " -->\n"
		+ txtStats + "\n"
		+ "\t\t\t<!-- END " + escapeXmlCmts(urlStats) + " -->\n";
	} else {
		let errMsg = errStats.toString().replace(/ to http[^ ]+ /g, " ").replace(/\, .*/g, "");
		result +=
		  "\t\t\t<!-- ERROR " + escapeXmlCmts(urlStats) + " -->\n";
		+ "\t\t\t<text x=\"24\" y=\"35\" fill=\"red\" font-family=\"Arial, Helvetica, sans-serif\">" + errMsg + "</text>\n";
	}
	result +=
	  "\t\t<\/svg>\n"
	+ "\t\t<svg id=\"languages\" width=\"300\" height=\"350\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\" xmlns:svg=\"http:\/\/www.w3.org\/2000\/svg\" xmlns:xlink=\"http:\/\/www.w3.org\/1999\/xlink\" version=\"1.1\">\n";
	if (txtLanguages !== undefined) {
		result +=
		  "\t\t\t<!-- BEGIN " + escapeXmlCmts(urlLanguages) + " -->\n"
		+ txtLanguages + "\n"
		+ "\t\t\t<!-- END " + escapeXmlCmts(urlLanguages) + " -->\n";
	} else {
		let errMsg = errLanguages.toString().replace(/ to http[^ ]+ /g, " ").replace(/\, .*/g, "");
		result +=
		  "\t\t\t<!-- ERROR " + escapeXmlCmts(urlLanguages) + " -->\n";
		+ "\t\t\t<text x=\"24\" y=\"35\" fill=\"red\" font-family=\"Arial, Helvetica, sans-serif\">" + errMsg + "</text>\n";
	}
	result +=
	  "\t\t<\/svg>\n"
	+ "\t\t<svg id=\"trophies\" width=\"348\" height=\"110\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\" xmlns:svg=\"http:\/\/www.w3.org\/2000\/svg\" xmlns:xlink=\"http:\/\/www.w3.org\/1999\/xlink\" version=\"1.1\">\n";
	if (txtTrophies !== undefined) {
		result +=
		  "\t\t\t<!-- BEGIN " + escapeXmlCmts(urlTrophies) + " -->\n"
		+ txtTrophies + "\n"
		+ "\t\t\t<!-- END " + escapeXmlCmts(urlTrophies) + " -->\n";
	} else {
		let errMsg = errTrophies.toString().replace(/ to http[^ ]+ /g, " ").replace(/\, .*/g, "");
		result +=
		  "\t\t\t<!-- ERROR " + escapeXmlCmts(urlTrophies) + " -->\n";
		+ "\t\t\t<text x=\"9\" y=\"18\" fill=\"red\" font-family=\"Arial, Helvetica, sans-serif\">" + errMsg + "</text>\n";
	}
	result +=
	  "\t\t<\/svg>\n"
	+ "\t<\/defs>\n"
	+ "\t<rect x=\"0.5\" y=\"0.5\" rx=\"4.5\" height=\"99%\" stroke=\"#e4e2e2\" width=\"99%\" fill=\"#141321\" stroke-opacity=\"1\"\/>\n"
	+ "\t<use xlink:href=\"#stats\" transform=\"translate(1,1)\"\/>\n"
	+ "\t<use xlink:href=\"#languages\" transform=\"translate(468,1)\"\/>\n"
	+ "\t<use xlink:href=\"#trophies\" transform=\"translate(25,215)\"\/>\n"
	+ "<\/svg>\n";

	// 4. Send SVG
	res.setHeader("Content-Type", "image/svg+xml");
	res.writeHead(200);
	res.end(result);
}

var app = express();
app.use('/api', requestListener);
app.use('/', express.static(path.join(__dirname, '..')));
app.listen(port);

console.log('Serving port ' + port + " at " + __filename);
