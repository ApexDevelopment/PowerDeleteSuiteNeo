const fs = require("fs");
const https = require("https");
const path = require("path");

function decodeHtmlEntities(str) {
	return str
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&apos;/g, "'")
		.replace(/&nbsp;/g, " ")
		.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
		.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function fetchCentralform() {
	return new Promise((resolve, reject) => {
		const url = "https://old.reddit.com/r/PowerDeleteSuite/wiki/centralform.json";
		https
			.get(url, { headers: { "User-Agent": "pdsneo-build/1.0" } }, (res) => {
				let data = "";
				res.on("data", (chunk) => (data += chunk));
				res.on("end", () => {
					try {
						const json = JSON.parse(data);
						resolve(decodeHtmlEntities(json.data.content_md));
					} catch (e) {
						reject(new Error(`Failed to parse centralform response: ${e.message}\n${data.slice(0, 200)}`));
					}
				});
			})
			.on("error", reject);
	});
}

function escapeForTemplateLiteral(str) {
	return str.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

async function build() {
	const centralformPath = path.join(__dirname, "src", "centralform.html");
	let centralform;

	if (fs.existsSync(centralformPath)) {
		centralform = fs.readFileSync(centralformPath, "utf8");
	} else {
		console.log("Fetching centralform from Reddit...");
		centralform = await fetchCentralform();
		fs.writeFileSync(centralformPath, centralform, "utf8");
		console.log("Cached to src/centralform.html");
	}

	const styles = fs.readFileSync(path.join(__dirname, "src", "styles.css"), "utf8");
	const template = fs.readFileSync(path.join(__dirname, "src", "powerdeletesuite.user.js"), "utf8");

	const output = template
		.replace("`__STYLES__`", "`" + escapeForTemplateLiteral(styles) + "`")
		.replace("`__CENTRALFORM__`", "`" + escapeForTemplateLiteral(centralform) + "`");

	fs.writeFileSync(path.join(__dirname, "powerdeletesuite.user.js"), output, "utf8");
	console.log("Built powerdeletesuite.user.js");
}

build().catch((err) => {
	console.error("Build failed:", err.message);
	process.exit(1);
});
