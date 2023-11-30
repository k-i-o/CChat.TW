let teeworlds = require('../../index.js');
let client = new teeworlds.Client("185.107.96.197", 8303, "cacca");

client.on("connected", () => console.log("connected!"))

client.on("snapshot", () => {
	let myDDNetChar = client.SnapshotUnpacker.getObjExDDNetCharacter(client.SnapshotUnpacker.OwnID);
	if (myDDNetChar == undefined)
		return;
	if (myDDNetChar.m_FreezeEnd != 0) {
		client.game.Kill();
	}
})

client.connect();

process.on("SIGINT", () => {
	client.Disconnect().then(() => process.exit(0)); // disconnect on ctrl + c
	// process.exit()
})