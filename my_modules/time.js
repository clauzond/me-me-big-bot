const getLogTime = () => {
	const d = new Date();
	const h = d.getHours();
	const m = d.getMinutes();
	const s = String(d.getSeconds()).padStart(2, "0");
	return `${h}:${m}:${s}`;
};

module.exports = {
	getLogTime,
};