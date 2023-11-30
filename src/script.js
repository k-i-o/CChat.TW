
let totalRecords = 0;
let displayedRecords = 0;
let recordsToRetrieve = 50;
let results;

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
        dynamicLoadData();
    }).catch(err => console.error(err));
}


const serversList = () => document.querySelector("#servers #serverContent");
serversList().addEventListener("scroll", () => {
  const scrollPosition = serversList().clientHeight + serversList().scrollTop;
  const pageHeight = serversList().scrollHeight;
  const threshold = 200;

  if (scrollPosition + threshold >= pageHeight && displayedRecords < totalRecords) {
    displayedRecords += recordsToRetrieve;
    updateTable(displayedRecords - recordsToRetrieve, displayedRecords);
  }
});

function updateTable(start, end) {

  end = end > totalRecords ? totalRecords : end;

  for (let i = start; i < end; i++) {
    let row = results[i];
    console.log(row);
    serversList().innerHTML += `<tr><td>${row.info.name}</td><td>${row.info.game_type}</td><td>${row.info.map.name}</td><td>${row.info.clients.length}/${row.info.max_players}</td></tr>`;
  }
}

function dynamicLoadData() {

  totalRecords = results.length;
  displayedRecords += recordsToRetrieve;

  serversList().innerHTML = '';
  
  updateTable(0, recordsToRetrieve); 

}