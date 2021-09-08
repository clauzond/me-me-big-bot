const http = require("http");

const hostname = "localhost";
const port = 3000;

const htmlify = (logs) => {
	let res = "";
	const div = "<div class='border border-primary rounded text-light m-2 p-2'>";
	for (const log of logs) {
		res += `${div} ${log} </div>\n`;
	}
	return res;
};


const startServer = (getLogsFunc) => {
	const server = http.createServer((req, res) => {
		res.statusCode = 200;
		res.setHeader("Content-Type", "text/html");
		res.end(`
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<title>Message to Emoji</title>
			<link rel="icon" href="https://images.emojiterra.com/twitter/v13.0/512px/1f975.png">
			<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
		</head>
		<body class="bg-dark d-flex flex-column align-items-center">
		${htmlify(getLogsFunc())}
		</body>
		</html>`);
	});

	server.listen(port, hostname, () => {
		console.log(`Server running at http://${hostname}:${port}/`);
	});
};

module.exports = {
	startServer,
};