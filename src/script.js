let totalRecords = 0;
let displayedRecords = 0;
let recordsToRetrieve = 50;
let results;
let currentResults;
const preferredIPs = ["185.107.96.197", "192.223.24.201"];

const serversSection = () => document.querySelector("#servers");
const serversList = () => document.querySelector("#serverContent");
const serversTable = () => document.querySelector(".table-wrapper");
const loadPage = () => document.querySelector(".load-page");
const clientAfterJoin = () => document.querySelector("#joined-server-wrapper");
const filterInput = () => document.getElementById("filter");
const chat = () => document.querySelector("#chat");

const localIdentity = () => JSON.parse(localStorage.getItem("identity")) || null;

let teeNameValue = () => localIdentity()?.name || "CChatter";
let teeClanValue = () => localIdentity()?.clan || "GCL";
let teeSkinValue = () => localIdentity()?.skin || "default";
let useCustomValue = () => localIdentity()?.use_custom || false;
let teeColorBodyValue = () => localIdentity()?.color_body || "ffffff";
let teeColorFeetValue = () => localIdentity()?.color_feet || "ffffff";

document.addEventListener('DOMContentLoaded', () => {
  getServers();
});

function getServers(btn = null) {

  if (btn !== null) { console.log(btn); btn.style.rotate = (btn.style.rotate ? parseFloat(btn.style.rotate.replace("deg", "")) : null || 0) + 180 + "deg"; btn.disabled = true; }

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

    console.log(out.servers);
    results = out.servers;
    currentResults = results;

    dynamicLoadData(currentResults);

    if (btn !== null) {btn.disabled = false; }

  }).catch(err => console.error(err));
}


filterInput().addEventListener("input", filterServers);
serversTable().addEventListener("scroll", () => {
  const scrollPosition = serversTable().clientHeight + serversTable().scrollTop;
  const pageHeight = serversTable().scrollHeight;
  const threshold = 100;

  if (scrollPosition + threshold >= pageHeight && displayedRecords < totalRecords) {
    displayedRecords += recordsToRetrieve;
    updateTable(displayedRecords - recordsToRetrieve, displayedRecords, currentResults);
  }

  if(serversTable().scrollTop > 500) {
    document.querySelector(".gotop").style.bottom = "calc(20px + var(--footer-bar-height))";
  } else {
    document.querySelector(".gotop").style.bottom = "-200px";
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
    serversList().innerHTML += `
    <tr onclick="selectedServer(
      '${row.addresses[0].split('//')[1].split(":")[0]}', 
      ${row.addresses[0].split('//')[1].split(":")[1]}, 
      '${row.info.name.replaceAll(/'/g, "\\'")}', 
      '${row.info.map.name.replaceAll(/'/g, "\\'")}'
    )">
      
      <td>${row.addresses.some(addr => addr.includes(preferredIPs[0]) || addr.includes(preferredIPs[1])) ? star + " " + row.info.name : row.info.name}</td>
      <td>${row.info.game_type}</td><td>${row.info.map.name}</td>
      <td>${row.info.clients.length}/${row.info.max_clients}</td>
    </tr>`;
  }
}

function selectedServer(ip, port, name, map) {
  document.querySelector(".disconnection-reason").innerHTML = "";
  eAPI.disconnect();
  eAPI.connect(ip, port);
  serversSection().style.display = "none";
  loadPage().style.display = "flex";
  chat().innerHTML = "";
  clientAfterJoin().querySelector(".server-name").innerHTML = `Server name: ${name}`;
  clientAfterJoin().querySelector(".server-ip").innerHTML = `${ip}:${port}`;
  clientAfterJoin().querySelector(".map-name").innerHTML = `Map name: ${map}`;

}

function back() {
  serversSection().style.display = "flex";
  loadPage().style.display = "none";
  clientAfterJoin().style.display = "none";
  eAPI.disconnect();
}

function filterServers() {
  const filter = filterInput().value.toUpperCase();
  const filteredResults = results.filter(row =>
    {return row.info.name.toUpperCase().includes(filter) ||
    row.info.game_type.toUpperCase().includes(filter) ||
    row.info.map.name.toUpperCase().includes(filter) ||
    (row.info.clients !== undefined && row.info.clients.length > 0 && (row.info.clients.map(c => c.name.toUpperCase()).includes(filter) ||
    row.info.clients.map(c => c.clan.toUpperCase()).includes(filter))) ||
    (row.info.passworded == false && (row.info.clients.length + "/" + row.info.max_players).includes(filter))}
  );

  totalRecords = filteredResults.length;
  displayedRecords = recordsToRetrieve;

  if (totalRecords === 0) {
    serversList().innerHTML = `<tr onclick="getServers();filterInput().value=''"><td colspan="4" style="text-align: center">No results found? <span style="color: var(--primary-color); font-style: italic;">Try to refresh</span></td></tr>`;
    return;
  } else {
    serversList().innerHTML = '';
  }
  updateTable(0, recordsToRetrieve, filteredResults);
}

let originalOrder = null; 

let sortByCounter = 0;

function sortBy(target) {
  sortByCounter++;

  if (originalOrder === null && sortByCounter === 1) {
    originalOrder = [...currentResults];
  }

  let sortIndicator = document.querySelector(`#${target}SortIndicator svg`);
  document.querySelectorAll('.sort-indicator svg').forEach((e) => e.style.opacity = 0 );

  switch (target) {
    case "type":
      console.log("type");

      currentResults.sort((a, b) => {
        if (sortByCounter % 3 === 1) {
          sortIndicator.style.opacity = 1;
          sortIndicator.style.transform = "rotate(180deg) translateY(-5px)";          
          return a.info.game_type.localeCompare(b.info.game_type);
        } else if (sortByCounter % 3 === 2) {
          sortIndicator.style.opacity = 1;
          sortIndicator.style.transform = "rotate(0deg) translateY(5px)";
          return b.info.game_type.localeCompare(a.info.game_type);
        }
        return 0;
      });

      break;

    case "map":
      console.log("map");

      currentResults.sort((a, b) => {
        if (sortByCounter % 3 === 1) {
          sortIndicator.style.opacity = 1;
          sortIndicator.style.transform = "rotate(180deg) translateY(-5px)";          
          return a.info.map.name.localeCompare(b.info.map.name);
        } else if (sortByCounter % 3 === 2) {
          sortIndicator.style.opacity = 1;
          sortIndicator.style.transform = "rotate(0deg) translateY(5px)";
          return b.info.map.name.localeCompare(a.info.map.name);
        }
        return 0;
      });

      break;

    case "players":
      console.log("players");

      currentResults.sort((a, b) => {
        const clientsA = a.info.clients ? a.info.clients.length : 0;
        const clientsB = b.info.clients ? b.info.clients.length : 0;

        if (sortByCounter % 3 === 1) {
          sortIndicator.style.opacity = 1;
          sortIndicator.style.transform = "rotate(180deg) translateY(-5px)";
          return clientsB - clientsA;
        } else if (sortByCounter % 3 === 2) {
          sortIndicator.style.opacity = 1;
          sortIndicator.style.transform = "rotate(0deg) translateY(5px)";
          return clientsA - clientsB;
        }
        return 0;
      });

      break;
  }

  if (sortByCounter % 3 === 0) {
    currentResults = [...originalOrder];
    originalOrder = null;
    sortByCounter = 0;
  }

  serversList().innerHTML = '';
  updateTable(0, recordsToRetrieve, currentResults);
}


document.querySelector(".chatTools").addEventListener("submit", (e) => {
  e.preventDefault();
  eAPI.sendMsg(e.target.sendmsg.value);
  document.querySelector(".chatTools input").value = "";
});

const teeName = () => document.getElementsByName("tee-name")[0];
const teeClan = () => document.getElementsByName("tee-clan")[0];
const teeSkin = () => document.getElementsByName("tee-skin")[0];
const useCustom = () => document.getElementsByName("use-custom")[0];
const teeColorBody = () => document.getElementsByName("tee-body-color")[0];
const teeColorFeet = () => document.getElementsByName("tee-feet-color")[0];

teeColorBody().addEventListener("input", (e) => {
});

teeColorFeet().addEventListener("input", (e) => {
});

function openSettings() {
  let myTee = new Tee(`https://ddnet.org/skins/skin/${teeSkinValue()}.png`, document.querySelector(".tee"));
  myTee.lookAtCursor();

  teeName().value = teeNameValue();
  teeClan().value = teeClanValue();
  teeSkin().value = teeSkinValue();
  useCustom().checked = useCustomValue();
  teeColorBody().value = teeColorBodyValue();
  teeColorFeet().value = teeColorFeetValue();

  document.querySelector("#settings-modal").classList.add("modal-active");
}

function closeSettings() {
  document.querySelector("#settings-modal").classList.remove("modal-active");
}

document.querySelector("#settings-modal").addEventListener("submit", (e) => {
  e.preventDefault();

  eAPI.setTeeInfo(teeNameValue(), teeClanValue(), teeSkinValue(), useCustomValue(), teeColorBodyValue(), teeColorFeetValue());

  closeSettings();
});