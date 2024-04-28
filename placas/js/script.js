let map= L.map('map').setView([4.153960, -74.875971],16)

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


// fetch('http://localhost:3000/get-plates')

export default map;