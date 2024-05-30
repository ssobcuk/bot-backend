const express = require("express");
const OpenAI = require("openai");

require("dotenv").config();
const PORT = process.env.PORT || 3000;
const bp = require("body-parser");
const app = express();

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

const openai = new OpenAI({
	apiKey: "sk-proj-w7DWBHbkF5tXfElSZlRJT3BlbkFJmIBmahUlsFqPjFcSMD5w",
});

const conversationContextPromptNewArch = [
	{
		role: "system",
		content:
			"You are a helpful, creative, clever, and very friendly AI assistant.",
	},
	{ role: "user", content: "Hello, who are you?" },
	{
		role: "assistant",
		content: "I am an AI created by OpenAI. How can I help you today?",
	},
];

const conversationContextPromptOldArch =
	"The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.\n\nHuman: Hello, who are you?\nAI: I am an AI created by OpenAI. How can I help you today?\nHuman: ";

const availableBots = [
	{
		name: "GPT-4",
		botId: "gpt-4",
		desc: "Original GPT-4 model was built with broad general knowledge and domain expertise.",
		icon: "https://cdn-icons-png.flaticon.com/512/5537/5537993.png",
	},
	{
		name: "GPT-3.5",
		botId: "gpt-3.5-turbo-0125",
		desc: "Flagship model of this GPT-3.5 family, supports a 16K context window and is optimized for dialog.",
		icon: "https://cdn-icons-png.freepik.com/512/5784/5784725.png",
	},
	{
		name: "DaVinci-002",
		botId: "davinci-002",
		desc: "GPT base model are not optimized for instruction-following and are less capable, but they can be effective when fine-tuned for narrow tasks. \n\nFor fun :)",
		icon: "https://cdn-icons-png.flaticon.com/512/5638/5638924.png",
	},
];

async function chatRequestNewArch(req, res, model) {
	const message = req.body.message;

	const messages = [
		...conversationContextPromptNewArch,
		{ role: "user", content: message },
	];

	try {
		const response = await openai.chat.completions.create({
			model: model,
			messages: messages,
			temperature: 0.9,
			max_tokens: 200,
			top_p: 1,
			frequency_penalty: 0,
			presence_penalty: 0.6,
		});
		res.send(response.choices[0].message.content);
	} catch (error) {
		console.error("Error communicating with OpenAI:", error);
		res.status(500).send("Error communicating with OpenAI");
	}
}

async function chatRequestOldArch(req, res, model) {
	const message = req.body.message;

	openai.completions
		.create({
			model: model,
			prompt: conversationContextPromptOldArch + message,
			temperature: 0.9,
			max_tokens: 150,
			top_p: 1,
			frequency_penalty: 0,
			presence_penalty: 0.6,
		})
		.then((response) => {
			res.send(response?.choices[0]?.text);
		})
		.catch((error) => {
			console.error("Error communicating with OpenAI:", error);
			res.status(500).send("Error communicating with OpenAI");
		});
}

app.get("/getBots", (req, res) => {
	res.json(availableBots);
});

app.post("/converse", (req, res) => {
	const botId = req.body?.botId;
	if (botId === "davinci-002") {
		chatRequestOldArch(req, res, botId);
	} else {
		chatRequestNewArch(req, res, botId);
	}
});

app.listen(PORT, () => {
	console.log("Conversational AI assistant listening on port 3000!");
});
