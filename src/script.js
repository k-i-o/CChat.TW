let totalRecords = 0;
let displayedRecords = 0;
let recordsToRetrieve = 20;
let results;
let currentResults;

document.addEventListener('DOMContentLoaded', function() {
  getServers();
});

function getServers() {
    fetch('https://master1.ddnet.org/ddnet/15/servers.json', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json())
    .then((out) => {
        console.log('Output: ', out.servers);
        results = out.servers;
        currentResults = results;
        dynamicLoadData(currentResults);
    }).catch(err => console.error(err));
}

const serversSection = () => document.querySelector("#servers");
const serversList = () => document.querySelector("#servers #serverContent");
const clientAfterJoin = () => document.querySelector("#joined-server-wrapper");
const filterInput = () => document.getElementById("filter");

filterInput().addEventListener("input", filterServers);
serversList().addEventListener("scroll", () => {
  const scrollPosition = serversList().clientHeight + serversList().scrollTop;
  const pageHeight = serversList().scrollHeight;
  const threshold = 200;

  if (scrollPosition + threshold >= pageHeight && displayedRecords < totalRecords) {
    console.log("Loading more data...");
    displayedRecords += recordsToRetrieve;
    updateTable(displayedRecords - recordsToRetrieve, displayedRecords, currentResults);
  }
});

function dynamicLoadData(data) {
  totalRecords = data.length;
  displayedRecords += recordsToRetrieve;
  serversList().innerHTML = '';
  updateTable(0, recordsToRetrieve, data);
}

function updateTable(start, end, data) {
  end = end > totalRecords ? totalRecords : end;

  for (let i = start; i < end; i++) {
    let row = data[i];
    serversList().innerHTML += `<tr onclick="selectedServer('${row.addresses[0].split('//')[1].split(":")[0]}', ${row.addresses[0].split('//')[1].split(":")[1]})"><td>${row.info.name}</td><td>${row.info.game_type}</td><td>${row.info.map.name}</td><td>${row.info.clients.length}/${row.info.max_players}</td></tr>`;
  }
}

function selectedServer(ip, port) {
  eAPI.connect(ip, port);
  serversSection().style.display = "none";
  clientAfterJoin().style.display = "block";
}

function filterServers() {
  const filter = filterInput().value.toUpperCase();
  const filteredResults = results.filter(row =>
    row.info.name.toUpperCase().includes(filter) ||
    row.info.game_type.toUpperCase().includes(filter) ||
    row.info.map.name.toUpperCase().includes(filter) ||
    (row.info.passworded == false && (row.info.clients.length + "/" + row.info.max_players).includes(filter))
  );

  totalRecords = filteredResults.length;
  displayedRecords = recordsToRetrieve;

  serversList().innerHTML = '';
  updateTable(0, recordsToRetrieve, filteredResults);
}
