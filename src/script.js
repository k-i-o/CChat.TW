let totalRecords = 0;
let displayedRecords = 0;
let recordsToRetrieve = 50;
let results;
let currentResults;
const preferredIPs = ["185.107.96.197", "192.223.24.201"];

function BookmarksView() {
  this._visible = false;
  this._listeners = [];
}

BookmarksView.prototype.get = function() {
  return this._visible;
};

BookmarksView.prototype.set = function(v) {
  this._visible = v;
  this.emitChange();
};

BookmarksView.prototype.on = function(eventName, listener) {
  if (eventName === 'change' && typeof listener === 'function') {
    this._listeners.push(listener);
  }
};

BookmarksView.prototype.emitChange = function() {
  for (let i = 0; i < this._listeners.length; i++) {
    this._listeners[i](this._visible);
  }
};

let bookmarkViewEvent = new BookmarksView();

bookmarkViewEvent.on('change', function(v) {
  if (v) {
    document.querySelector("#bookmarkView").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="var(--primary-color)" class="w-6 h-6">
      <path fill-rule="evenodd" d="M6 3a3 3 0 00-3 3v12a3 3 0 003 3h12a3 3 0 003-3V6a3 3 0 00-3-3H6zm1.5 1.5a.75.75 0 00-.75.75V16.5a.75.75 0 001.085.67L12 15.089l4.165 2.083a.75.75 0 001.085-.671V5.25a.75.75 0 00-.75-.75h-9z" clip-rule="evenodd" />
    </svg>`;
  } else {
    document.querySelector("#bookmarkView").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" />
    </svg>`;
  }

});

const serversSection = () => document.querySelector("#servers");
const serversList = () => document.querySelector("#serverContent");
const serversTable = () => document.querySelector(".table-wrapper");
const loadPage = () => document.querySelector(".load-page");
const clientAfterJoin = () => document.querySelector("#joined-server-wrapper");
const filterInput = () => document.getElementById("filter");
const chat = () => document.querySelector("#chat");

const directIpValue = () => document.querySelector("#direct-ip").value;

const directIp = () => { 
  return { 
    ip: directIpValue().split(":")[0], 
    port: directIpValue().split(":").length > 1 ? directIpValue().split(":")[1] : 8303 }
};

const localIdentity = () => JSON.parse(localStorage.getItem("identity")) || null;
let teeNameValue = () => localIdentity().name;
let teeClanValue = () => localIdentity().clan;
let teeSkinValue = () => localIdentity().skin;
let useCustomValue = () => localIdentity().use_custom;
let teeColorBodyValue = () => localIdentity().color_body;
let teeColorFeetValue = () => localIdentity().color_feet;

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector(".copyright").innerHTML = new Date().getFullYear();
  getServers();
});

function directConnect() {
  selectedServer(directIp().ip, directIp().port);
}

function refresh(thisBtn) {
  if (bookmarkViewEvent.get()) {
    getServers(thisBtn).then((success) => {
      if (success) {
        loadBookmarkedServers();
      }
    });
  } else {
    getServers(thisBtn);
  }
}

async function getServers(btn = null) {
  if (btn !== null) { 
    btn.style.rotate = (btn.style.rotate ? parseFloat(btn.style.rotate.replace("deg", "")) : null || 0) + 180 + "deg"; 
    btn.disabled = true; 
  }

  try {
    const response = await fetch('https://master1.ddnet.org/ddnet/15/servers.json', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const out = await response.json();

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

    return true;

  } catch (err) {
    console.error(err);
    return false;
  } finally {
    if (btn !== null) {
      btn.disabled = false;
    }
  }
}


function getBookmarkedServers() {
  bookmarkViewEvent.set(!bookmarkViewEvent.get());
  if(bookmarkViewEvent.get()){
    loadBookmarkedServers();
  }else{
    currentResults = results;
    dynamicLoadData(currentResults);
  }
}

function loadBookmarkedServers() {
  
  const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
  const bookmarkedServers = bookmarks.filter(b => {
    return results.some(r => {
      return r.addresses[0].split('//')[1].split(":")[0] === b.ip && r.addresses[0].split('//')[1].split(":")[1] == b.port;
    })
  });

  currentResults = bookmarkedServers;

  dynamicLoadData(currentResults, true);

}

function bookmarkServer(ip, port, name) {
  
  const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];

  if(bookmarks.some(b => b.ip === ip && b.port === port)) {
    bookmarks.splice(bookmarks.findIndex(b => b.ip === ip && b.port === port), 1);
    document.querySelector("#set-bookmark").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
      <path fill-rule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clip-rule="evenodd" />
    </svg>`;
  } else {
    bookmarks.push({ip, port, name});
    document.querySelector("#set-bookmark").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
      <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM20.25 5.507v11.561L5.853 2.671c.15-.043.306-.075.467-.094a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93zM3.75 21V6.932l14.063 14.063L12 18.088l-7.165 3.583A.75.75 0 013.75 21z" />
    </svg>`;
  }

  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
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

function dynamicLoadData(data, bookmarked = false) {
  totalRecords = data.length;
  displayedRecords += recordsToRetrieve;
  serversList().innerHTML = '';
  updateTable(0, recordsToRetrieve, data, bookmarked);
  filterServers(bookmarked);
}

function updateTable(start, end, data, bookmarked = false) {
  end = end > totalRecords ? totalRecords : end;

  for (let i = start; i < end; i++) {
    let row = data[i];

    const star = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="var(--primary-color)" class="w-6 h-6">
      <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
    </svg>
    `;

    const bookmark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="var(--primary-color)" class="w-6 h-6">
      <path fill-rule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clip-rule="evenodd" />
    </svg>
    `;

    const bookmark2 = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="var(--primary-color)" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>`;

    const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];

    serversList().innerHTML += `
    <tr onclick="selectedServer(
      '${bookmarked === true ? row.ip : row.addresses[0].split('//')[1].split(":")[0] }', 
      ${bookmarked === true ? row.port : row.addresses[0].split('//')[1].split(":")[1] }, 
      '${bookmarked === true ? row.name.replaceAll(/'/g, "\\'") : row.info.name.replaceAll(/'/g, "\\'")}', 
      '${bookmarked === true ? "???" : row.info.map.name.replaceAll(/'/g, "\\'")}'
    )">
      
      <td>${bookmarked === true ? (bookmark + " " + row.name) : (row.addresses.some(addr => addr.includes(preferredIPs[0]) || addr.includes(preferredIPs[1])) ? (star + " ") : (row.addresses.some(addr => bookmarks.some(b => addr.includes(b.ip) && addr.includes(b.port)))) ? bookmark2 + " " : "") + row.info.name}</td>
      <td>${bookmarked === true ? "???" : row.info.game_type}</td>
      <td>${bookmarked === true ? "???" : row.info.map.name}</td>
      <td>${bookmarked === true ? "???" : (row.info.clients.length + "/" + row.info.max_clients)}</td>
    </tr>`;
  }
}

function checkIfServerIsBookmarked(ip, port) {	
  const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];	
  return bookmarks.some(b => b.ip === ip && b.port == port);	
}

function selectedServer(ip, port, name = "Unknow Name", map = "Unknow Map") {
  document.querySelector(".disconnection-reason").innerHTML = "";
  eAPI.disconnect();
  eAPI.connect(ip, port);
  serversSection().style.display = "none";
  loadPage().style.display = "flex";
  chat().innerHTML = "";

  if(checkIfServerIsBookmarked(ip, port)) {
    clientAfterJoin().querySelector("#set-bookmark").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
      <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM20.25 5.507v11.561L5.853 2.671c.15-.043.306-.075.467-.094a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93zM3.75 21V6.932l14.063 14.063L12 18.088l-7.165 3.583A.75.75 0 013.75 21z" />
    </svg>`;
  } else {
    clientAfterJoin().querySelector("#set-bookmark").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
      <path fill-rule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clip-rule="evenodd" />
    </svg>`;
  }

  clientAfterJoin().querySelector(".server-name").innerHTML = `Server name: ${name}`;
  clientAfterJoin().querySelector(".server-ip").innerHTML = `${ip}:${port}`;
  clientAfterJoin().querySelector(".map-name").innerHTML = `Map name: ${map}`;

  clientAfterJoin().querySelector("#set-bookmark").onclick = () => bookmarkServer(ip, port, name);
}

function back() {
  serversSection().style.display = "flex";
  loadPage().style.display = "none";
  clientAfterJoin().style.display = "none";
  eAPI.disconnect();

  if(bookmarkViewEvent.get()){
    loadBookmarkedServers();
  }
}

function filterServers(bookmarked = false) {

  if(bookmarked && bookmarked != true) {
    bookmarked = bookmarkViewEvent.get();
  }

  const filter = filterInput().value.toUpperCase();
  const filteredResults = currentResults.filter(row =>
    {
      if (bookmarked === true) {
        return row.name.toUpperCase().includes(filter) || row.ip.toUpperCase().includes(filter);
      }else {
        return row.info.name.toUpperCase().includes(filter) ||
        row.addresses.some(addr => addr.includes(filter)) ||
        row.info.game_type.toUpperCase().includes(filter) ||
        row.info.map.name.toUpperCase().includes(filter) ||
        (row.info.clients !== undefined && row.info.clients.length > 0 && (row.info.clients.map(c => c.name.toUpperCase()).includes(filter) ||
        row.info.clients.map(c => c.clan.toUpperCase()).includes(filter))) ||
        (row.info.passworded == false && (row.info.clients.length + "/" + row.info.max_players).includes(filter))
      }
    }
  );

  totalRecords = filteredResults.length;
  displayedRecords = recordsToRetrieve;

  if (totalRecords === 0) {
    serversList().innerHTML = bookmarked === true ? `
      <tr onclick="getServers();filterInput().value=''">
        <td colspan="4" style="text-align: center;white-space: normal;">
          <span style="color: var(--primary-color); font-weight: bold">
            No bookmarked server.<br>
          </span>
          To add one you must click 
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="var(--primary-color)" class="w-6 h-6">
            <path fill-rule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clip-rule="evenodd" />
          </svg>
          on the server header you want to bookmark when you are connected.
        </td>
      </tr>` : `
      <tr onclick="getServers();filterInput().value=''">
        <td colspan="4" style="text-align: center">
          No results found? <span style="color: var(--primary-color); font-style: italic;">Try to refresh</span>
        </td>
      </tr>`;
    return;
  } else {
    serversList().innerHTML = '';
  }
  updateTable(0, recordsToRetrieve, filteredResults, bookmarked);
}

let originalOrder = null; 

let sortByCounter = 0;
function sortBy(target, sortOrder = null) {

  if (sortOrder === null)
    sortByCounter++;
  else
    sortByCounter = sortOrder;

  if (originalOrder === null && sortByCounter === 1) {
    originalOrder = [...currentResults];
  }

  let sortIndicator = document.querySelector(`#${target}SortIndicator svg`);
  document.querySelectorAll('.sort-indicator svg').forEach((e) => e.style.opacity = 0 );

  switch (target) {
    case "type":
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

// teeColorBody().addEventListener("input", (e) => {
//   document.querySelector(".tee").setAttribute('data-bodycolor', e.value);
//   myTee = new Tee(`https://ddnet.org/skins/skin/${teeSkinValue()}.png`, document.querySelector(".tee"));
//   setTimeout(() => {
//     myTee.lookAt(50); //the trick
//   },0)

// });

// teeColorFeet().addEventListener("input", (e) => {


// });

document.querySelector("#use-custom").addEventListener("change", (e) => {
  if (e.target.checked) {
    teeColorBody().parentElement.parentElement.style.display = "flex";
    teeColorFeet().parentElement.parentElement.style.display = "flex";
  } else {
    teeColorBody().parentElement.parentElement.style.display = "none";
    teeColorFeet().parentElement.parentElement.style.display = "none";
  }
});

let myTee;

function openSettings() {
  myTee = new Tee(`https://ddnet.org/skins/skin/${teeSkinValue()}.png`, document.querySelector(".tee"));
  setTimeout(() => {
    myTee.lookAt(50); //the trick
  },2)
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

function openConsole(type) {
  document.querySelector("#console-modal").classList.add("modal-active");
}

function closeConsole() {
  document.querySelector("#console-modal").classList.remove("modal-active");
}

document.querySelector("#settings-modal").addEventListener("submit", (e) => {
  e.preventDefault();

  eAPI.setTeeInfo(
    teeName().value,
    teeClan().value,
    teeSkin().value,
    useCustom().checked,
    teeColorBody().value,
    teeColorFeet().value
  );

  closeSettings();
});

