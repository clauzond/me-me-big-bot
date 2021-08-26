const until = (conditionFunction) => {
	const poll = resolve => {
		if (conditionFunction()) resolve();
		else setTimeout(_ => poll(resolve), 300);
	}

	return new Promise(poll);
}

module.exports = {
    until,
}