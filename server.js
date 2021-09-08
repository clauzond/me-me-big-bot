// create an express app
const express = require("express");
const app = express();

// use the express-static middleware
app.use(express.static("public"));

const htmlify = (logs) => {
	let res = "";
	const div = "<div class='border border-primary rounded text-light m-2 p-2'>";
	for (const log of logs) {
		res += `${div} ${log} </div>\n`;
	}
	const html =
		`<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<title>Message to Emoji</title>
			<link rel="icon" href="https://images.emojiterra.com/twitter/v13.0/512px/1f975.png">
			<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
		</head>
		<body class="bg-dark d-flex flex-column align-items-center">
		${res}
		</body>
		</html>`;
	return html;
};


const startServer = (getLogsFunc) => {
	// define the first route
	app.get("/", function(req, res) {
		res.send(htmlify(getLogsFunc()));
	});

	app.listen(process.env.PORT || 5000, () => {
		console.log(`Server running at ${process.env.PORT || 5000}`);
	});
};

module.exports = {
	startServer,
};