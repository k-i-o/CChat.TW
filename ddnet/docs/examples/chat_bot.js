const teeworlds = require('../../index.js')
const axios = require('axios');

let servers = [
	{host: "185.107.96.197", username: "root", password: "moFoMsi7iH", remote_maps_path: "/root/ddnet/GER/data/maps/"},
	{host: "192.223.24.201", username: "root", password: "Nt5GuyRhNQ", remote_maps_path: "/root/ddnet/USA/data/maps/"}
];

let clients = [];

const botname = "Welcomer Bot";

servers.forEach((server, index) => {
	for(let i = 0; i < 3; i++) {

		clients.push(new teeworlds.Client(server.host, 8303+i, botname, 
		{ identity: { 
			name: botname, 
			clan: "GCL BOT", 
			country: 0, 
			skin: "default", 
			use_custom_color: 0, 
			color_body: 65408, 
			color_feet: 65408 
		}}));
		
		const client = clients[index * 3 + i];

		client.connect();
		
		client.on("connected", () => {
			console.log("Connected!");
		})
		
		client.on("disconnect", reason => {
			console.log("Disconnected: " + reason);
		})
		
		client.on("message", async (msg) => {
			// console.log(msg.author?.ClientInfo?.name + ": " + msg.message);
			if(msg.author?.ClientInfo?.name == botname) return;
		
			if (msg.author?.ClientInfo?.name === undefined && msg.message.includes("has joined the game") && !msg.message.includes(botname)) {
				setTimeout(() => {
					client.game.Say(`Welcome ${msg.message.split(" has joined the game")[0].replaceAll("'", "")} in GCL! Im a bot made by GCL Team, i am there to help you, if you need help type ;help in chat (will be better if you do /w ${botname} [command])!`);
				}, 1500);
			}
		
			if (msg.message.toLowerCase() == ";help") {
				client.game.Say(`${msg.author?.ClientInfo?.name}: Commands: ;help, ;myskin, ;say, ;list`);
			} else if (msg.message.toLowerCase() == ";myskin") {
				client.game.Say(`${msg.author?.ClientInfo?.name}: Your skin: ${msg.author?.ClientInfo?.skin}`);
			} else if (msg.message.toLowerCase().startsWith(";say ")) {
				client.game.Say(msg.message.slice(";say ".length))
			} else if (msg.message.toLowerCase() == ";list") {
				let list = client.SnapshotUnpacker.AllObjClientInfo.map( a => a.name );
				client.game.Say(list.join(", "));
			} else if (msg.message.toLowerCase().startsWith(";traslate")) {
				const encodedParams = new URLSearchParams();
				encodedParams.set('source_language', 'it');
				encodedParams.set('target_language', 'en');
				encodedParams.set('text', msg.message.slice(";traslate ".length));

				const options = {
					method: 'POST',
					url: 'https://text-translator2.p.rapidapi.com/translate',
					headers: {
						'content-type': 'application/x-www-form-urlencoded',
						'X-RapidAPI-Key': '1bd3ee7b49msh39b6dcf0cdac38ep142059jsn224100bd5911',
						'X-RapidAPI-Host': 'text-translator2.p.rapidapi.com'
					},
					data: encodedParams,
				};

				try {
					const response = await axios.request(options);
					client.game.Say("English: " + response.data.traslatedText);
				} catch (error) {
					console.error(error);
				}
			}
		})
		
	}
});

process.on("SIGINT", () => {
	clients.forEach(client => client.Disconnect().then(() => process.exit(0))); // disconnect on ctrl + c
	// process.exit()
})