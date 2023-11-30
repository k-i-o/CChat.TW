document.addEventListener('DOMContentLoaded', function() {
    
    fetch('https://master1.ddnet.org/ddnet/15/servers.json', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json())
    .then((out) => {
        var servers = document.querySelector('#servers');
        console.log('Output: ', out.servers);
        var serversData = out.servers;
        for (var i = 0; i < serversData.length; i++) {
            servers.innerHTML += `<div class="serverEl">${serversData[i].info.name}</div>`;
        }
    }).catch(err => console.error(err));

});