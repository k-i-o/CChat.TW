let totalRecords = 0;
let displayedRecords = 0;
let recordsToRetrieve = 50;
let results;
let currentResults;
const preferredIPs = ["185.107.96.197", "192.223.24.201"];

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

      out.servers.sort((a, b) => {
        const hasPreferredIPA = a.addresses.some(addr => addr.includes(preferredIPs[0]) || addr.includes(preferredIPs[1]));
        const hasPreferredIPB = b.addresses.some(addr => addr.includes(preferredIPs[0]) || addr.includes(preferredIPs[1]));
      
        if (hasPreferredIPA && hasPreferredIPB) {
          return 0;
        } else if (hasPreferredIPA) {
          return -1;
        } else if (hasPreferredIPB) {
          return 1;
        }
      
        return 0;
      });

      
      results = out.servers;
      currentResults = results;

      dynamicLoadData(currentResults);
    }).catch(err => console.error(err));
}

const serversSection = () => document.querySelector("#servers");
const serversList = () => document.querySelector("#servers #serverContent");
const serversTable = () => document.querySelector(".table-wrapper");
const clientAfterJoin = () => document.querySelector("#joined-server-wrapper");
const filterInput = () => document.getElementById("filter");
const chat = () => document.querySelector("#chat");

filterInput().addEventListener("input", filterServers);
serversTable().addEventListener("scroll", () => {
  const scrollPosition = serversTable().clientHeight + serversTable().scrollTop;
  const pageHeight = serversTable().scrollHeight;
  const threshold = 100;

  if (scrollPosition + threshold >= pageHeight && displayedRecords < totalRecords) {
    displayedRecords += recordsToRetrieve;
    updateTable(displayedRecords - recordsToRetrieve, displayedRecords, currentResults);
  }
});

function dynamicLoadData(data) {
  totalRecords = data.length;
  displayedRecords += recordsToRetrieve;
  serversList().innerHTML = '';
  updateTable(0, recordsToRetrieve, data);
  filterServers();
}

function updateTable(start, end, data) {
  end = end > totalRecords ? totalRecords : end;

  for (let i = start; i < end; i++) {
    let row = data[i];

    const star = `<svg style="color: var(--primary-color)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
    `;
    serversList().innerHTML += `<tr onclick="selectedServer('${row.addresses[0].split('//')[1].split(":")[0]}', ${row.addresses[0].split('//')[1].split(":")[1]}, '${row.info.name}', '${row.info.map.name}')"><td>${row.addresses.some(addr => addr.includes(preferredIPs[0]) || addr.includes(preferredIPs[1])) ? star + " " + row.info.name : row.info.name}</td><td>${row.info.game_type}</td><td>${row.info.map.name}</td><td>${row.info.clients.length}/${row.info.max_players}</td></tr>`;
  }
}

function selectedServer(ip, port, name, map) {
  eAPI.connect(ip, port);
  serversSection().style.display = "none";
  chat().innerHTML = "";
  clientAfterJoin().querySelector(".server-name").innerHTML = `Server name: ${name}`;
  clientAfterJoin().querySelector(".server-ip").innerHTML = `${ip}:${port}`;
  clientAfterJoin().querySelector(".map-name").innerHTML = `Map name: ${map}`;
  clientAfterJoin().style.display = "flex";
}

function back() {
  serversSection().style.display = "flex";
  clientAfterJoin().style.display = "none";
  eAPI.disconnect();
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

document.querySelector(".chatTools").addEventListener("submit", (e) => {
  e.preventDefault();
  eAPI.sendMsg(e.target.sendmsg.value);
  document.querySelector(".chatTools input").value = "";
});