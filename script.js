

const body = document.body

const btnTheme = document.querySelector('.fa-moon')
const btnHamburger = document.querySelector('.fa-bars')

const addThemeClass = (bodyClass, btnClass) => {
  body.classList.add(bodyClass)
  btnTheme.classList.add(btnClass)
}

const getBodyTheme = localStorage.getItem('portfolio-theme')
const getBtnTheme = localStorage.getItem('portfolio-btn-theme')

addThemeClass(getBodyTheme, getBtnTheme)

const isDark = () => body.classList.contains('dark')

const setTheme = (bodyClass, btnClass) => {

body.classList.remove(localStorage.getItem('portfolio-theme'))
btnTheme.classList.remove(localStorage.getItem('portfolio-btn-theme'))

  addThemeClass(bodyClass, btnClass)

localStorage.setItem('portfolio-theme', bodyClass)
localStorage.setItem('portfolio-btn-theme', btnClass)
}

const toggleTheme = () =>
isDark() ? setTheme('light', 'fa-moon') : setTheme('dark', 'fa-sun')

btnTheme.addEventListener('click', toggleTheme)

const displayList = () => {
const navUl = document.querySelector('.nav__list')

if (btnHamburger.classList.contains('fa-bars')) {
btnHamburger.classList.remove('fa-bars')
btnHamburger.classList.add('fa-times')
navUl.classList.add('display-nav-list')
} else {
btnHamburger.classList.remove('fa-times')
btnHamburger.classList.add('fa-bars')
navUl.classList.remove('display-nav-list')
}
}

btnHamburger.addEventListener('click', displayList)

const scrollUp = () => {
const btnScrollTop = document.querySelector('.scroll-top')

if (
body.scrollTop > 500 ||
document.documentElement.scrollTop > 500
) {
btnScrollTop.style.display = 'block'
} else {
btnScrollTop.style.display = 'none'
}
}

document.addEventListener('scroll', scrollUp)

/*===========================================
  NEW JAVASCRIPT FOR SPATIAL TOOLS MAP
===========================================*/

document.addEventListener('DOMContentLoaded', function() {
   
    if(document.getElementById('map')) {
       
        const map = L.map('map').setView([27.7172, 85.3240], 12); // Centered on Kathmandu
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        L.marker([27.7172, 85.3240]).addTo(map)
            .bindPopup('Kathmandu, Nepal.')
            .openPopup();
           
        // =============================================================
        // INITIALIZE LAYERS & DRAW CONTROLS
        // =============================================================
        const drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);
       
        let bufferLayer = null;

        const drawOptions = {
            polyline: {
                shapeOptions: { color: '#ff0000', weight: 3 }
            },
            polygon: {
                allowIntersection: false,
                drawError: { color: '#e1e100', message: 'You can\'t draw that!' },
                shapeOptions: { color: '#2978b5', weight: 3 } // Using the site's primary color
            },
            circle: false, rectangle: false, marker: false, circlemarker: false
        };

        const drawControl = new L.Control.Draw({
            edit: { featureGroup: drawnItems },
            draw: drawOptions
        });
       
        // =============================================================
        // BUFFER FUNCTIONALITY
        // =============================================================
        const bufferBtn = document.getElementById('bufferBtn');

        bufferBtn.addEventListener('click', function() {
            map.removeControl(drawControl);
            alert('Buffer tool activated! Click on the map to draw a 1km buffer.');
           
            map.once('click', function(e) {
                if (bufferLayer) { map.removeLayer(bufferLayer); }
                const point = turf.point([e.latlng.lng, e.latlng.lat]);
                const buffered = turf.buffer(point, 1, {units: 'kilometers'});
                bufferLayer = L.geoJSON(buffered, {
                    style: { color: "#2978b5", weight: 2, opacity: 0.8, fillColor: "#2978b5", fillOpacity: 0.3 }
                }).addTo(map);
                bufferLayer.bindPopup('This is a 1km buffer.').openPopup();
            });
        });

        // =============================================================
        // MEASURE DISTANCE & DRAW POLYGON FUNCTIONALITY
        // =============================================================
        const measureBtn = document.getElementById('measureBtn');
        const areaBtn = document.getElementById('areaBtn');

        measureBtn.addEventListener('click', function() {
            map.addControl(drawControl);
            new L.Draw.Polyline(map, drawControl.options.draw.polyline).enable();
            alert('Measure tool activated! Draw a line on the map.');
        });
       
        areaBtn.addEventListener('click', function() {
            map.addControl(drawControl);

            new L.Draw.Polygon(map, drawControl.options.draw.polygon).enable();
            alert('Area tool activated! Draw a polygon on the map.');
        });

        map.on(L.Draw.Event.CREATED, function (event) {
            const layer = event.layer;
            const type = event.layerType;

            drawnItems.clearLayers();
            drawnItems.addLayer(layer);

            if (type === 'polyline') {
                let distance = 0;
                const latlngs = layer.getLatLngs();
                for (let i = 0; i < latlngs.length - 1; i++) {
                    distance += latlngs[i].distanceTo(latlngs[i + 1]);
                }
                const distanceInKm = (distance / 1000).toFixed(2);
                layer.bindPopup(`<b>Distance:</b> ${distanceInKm} km`).openPopup();
            } else if (type === 'polygon') {
                const geojson = layer.toGeoJSON();
                const area = turf.area(geojson);
                const areaInSqM = area.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
                layer.bindPopup(`<b>Area:</b> ${areaInSqM} m²`).openPopup();
            }
            map.removeControl(drawControl);
        });
    }
});
