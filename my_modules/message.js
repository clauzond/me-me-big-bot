const letter_dict = {};

Array.prototype.sample = function () {
	return this[Math.floor(Math.random() * this.length)];
};

String.prototype.strip_accents = function () {
	return this.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

function add_pattern(dict, key, values) {
	for (let i = 1; i < key.length - 1; i++) {
		if (!dict[key.substring(0, i + 1)]) {
			dict[key.substring(0, i + 1)] = "";
		}
	}
	dict[key] = values;
}

function create_letter_dict() {
	// a to z
	const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
	for (const letter of alphabet) {
		letter_dict[letter] = [`:regional_indicator_${letter}:`];
	}

	// special a to z
	letter_dict["a"].push(...[":a:"]);
	letter_dict["b"].push(...[":b:"]);
	letter_dict["i"].push(...[":information_source:"]);
	letter_dict["m"].push(...[":m:", ":scorpius:"]);
	letter_dict["o"].push(...[":o:", ":o2:"]);
	letter_dict["p"].push(...[":parking:"]);
	letter_dict["x"].push(...[":x:", ":negative_squared_cross_mark:"]);

	// 0 to 9
	const numbers = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
	for (let i = 0; i < 10; i++) {
		letter_dict[String(i)] = [`:${numbers[i]}:`];
	}

	// punctuation
	letter_dict["!"] = [":exclamation:", ":grey_exclamation:"];
	letter_dict["?"] = [":question:", ":grey_question:"];
	letter_dict["#"] = [":hash:"];
	letter_dict["*"] = [":asterisk:"];
	letter_dict["+"] = [":heavy_plus_sign:"];
	letter_dict["-"] = [":heavy_minus_sign:"];
	letter_dict["$"] = [":heavy_dollar_sign:"];
	letter_dict[" "] = ["  "];

	// patterns
	add_pattern(letter_dict, "<3", [":heart:"]);
	add_pattern(letter_dict, "zahx", [":regional_indicator_d: :regional_indicator_i: :regional_indicator_e: :regional_indicator_u:"]);

	return letter_dict;
}

function stringToEmoji(message) {
	let emote = "";
	let current_pattern;
	let step;
	message = message.strip_accents();
	for (let i = 0; i < message.length; i++) {
		step = 1;
		while ((i + step + 1 <= message.length) && (letter_dict[message.substring(i, i + step + 1)] != undefined)) {
			step++;
		}

		current_pattern = message.substring(i, i + step);
		if ((step > 1) && !letter_dict[current_pattern]) {
			step = 1;
			current_pattern = message[i];
		}

		if (letter_dict[current_pattern]) {
			emote += letter_dict[current_pattern].sample() + " ";
		} else {
			emote += message[i] + " ";
			step = 1;
		}

		i += step - 1;
	}
	return emote;
}


create_letter_dict();

module.exports = {
	stringToEmoji,
}