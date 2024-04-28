import map from "./script.js";

// Constantes de los meses del año
const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const mapContainer = document.getElementById("map");
const mainInput = document.getElementsByClassName("main-input-search");
const municipios = document.getElementById("municipios");
const departamentos = document.getElementById("departamentos");
const platesDatalist = document.getElementById("plates-datalist");
const mainForm = document.getElementById("main-form");

const enableInputElements = () => {
    for (let i = 0; i < mainInput.length; i++) {
        mainInput[i].disabled = false;
        mainInput[i].backgroundColor = "ccc";
    }
    municipios.disabled = false;
    departamentos.disabled = false;
}
function getUniqueProperty(arr, prop) {
    const seen = new Map();
    const result = [];
  
    for (const obj of arr) {
      const value = obj[prop];
      if (!seen.has(value)) {
        seen.set(value, true);
      } else if (seen.get(value) === true) {
        seen.set(value, false);
      } else {
        continue;
      }
      result.push(obj);
    }
  
    return result.filter(obj => seen.get(obj[prop]));
  }
  
const getDuplicateArraysByProperty = (arr, property) => {
    const frequency = arr.reduce((acc, curr) => {
      const key = curr[property];
      if (!acc[key]) {
        acc[key] = [curr];
      } else {
        acc[key].push(curr);
      }
      return acc;
    }, {});
  
    return Object.values(frequency).filter(subArr => subArr.length > 1);
  }

const fillDatalistWithPlates = (plates) => {
    for(let plate of plates){
        console.log(plate.dato_detectado)
        platesDatalist.appendChild(new Option(plate.dato_detectado, plate.dato_detectado))
    }
}

const fillSelectWithDepartments = (departments) => {
    for(let department of departments){
        departamentos.appendChild(new Option(department.nombre, department.cod))
    }
}

const onChangeMunicipios = () => {
    municipios.addEventListener('change', async (event) => {
        // Clean datalist options
        while(platesDatalist.firstChild){
            platesDatalist.removeChild(platesDatalist.firstChild);
        }
        const formData = new FormData(mainForm);
        const cod_ciudad = formData.get('municipios');
        const fechaInicio = formData.get('fechaInicio');
        const fechaFin = formData.get('fechaFinal');
        const cod_departamento = formData.get('departamentos');
        try {
            const response = await fetch('http://localhost:3000/api/get-plates?repetirRegistros=true&fechaInicio=' + fechaInicio + '&fechaFinal=' + fechaFin);
            const data = await response.json();
            const filteredData = data.filter(plateData => plateData.camara.ciudad.id == cod_ciudad && plateData.camara.ciudad.cod_departamento == cod_departamento);
            console.log(filteredData);
            console.log(cod_ciudad, cod_departamento, fechaInicio, fechaFin)
            for(let plateData of filteredData){
                platesDatalist.appendChild(new Option(plateData.dato_detectado, plateData.dato_detectado))
            }
        } catch(err) {
            console.error('Error:', err);
        }
    })
}
const toBase64 = (arr) => {
    //arr = new Uint8Array(arr) if it's an ArrayBuffer
    return btoa(
       arr.reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
 }

const onChangeDepartamentos = (ciudades) => {
    departamentos.addEventListener('change', async (event) => {
        // Remove all options from municipios select
        while(municipios.firstChild){
            municipios.removeChild(municipios.firstChild);
        }
        const cod_departamento = event.target.value;
        console.log(ciudades);
        const filteredCities = ciudades.filter(city => city.cod_departamento == cod_departamento);
        console.log(filteredCities)
        const optionTodosLosMunicipios = document.createElement('option');
        optionTodosLosMunicipios.value = "0";
        optionTodosLosMunicipios.innerHTML = "Todos los municipios";
        municipios.appendChild(optionTodosLosMunicipios);
        for(let city of filteredCities){
            const option = document.createElement('option');
            option.value = city.id;
            option.innerHTML = city.nombre_ciudad;
            municipios.appendChild(option);
        }
    })
}

const onSubmitMainForm = (platesData) => {
    mainForm.addEventListener('submit', async (event) => {
        // Remove all markers from map
        event.preventDefault();
        map.eachLayer((layer) => {
            if(layer instanceof L.Marker || layer instanceof L.Circle || layer instanceof L.Polygon){
                map.removeLayer(layer);
            }
        });
        const formData = new FormData(mainForm);
        const plate = formData.get('placaQuery');
        const city = formData.get('municipios');
        const fechaInicio = formData.get('fechaInicio');
        const fechaFin = formData.get('fechaFinal');
        const department = formData.get('departamentos');
        const isPlateInDatabase = () => {
            if(department == "0") {
                return platesData.some(p => p.dato_detectado === plate);
            } else if(city == "0") {
                return platesData.some(p => p.dato_detectado === plate && p.camara.ciudad.cod_departamento == department);
            } else {
                return platesData.some(p => p.dato_detectado === plate && p.camara.ciudad.id == city && p.camara.ciudad.cod_departamento == department);
            }
        }
        if(!isPlateInDatabase()){
            Swal.fire({
                title: '¡Error!',
                text: `La placa ${plate} no se encuentra en la base de datos, asegurate de elegir un municipio y departamento correcto.`,
                icon: 'error',
                confirmButtonText: 'Aceptar'
            })
        } else {
            Swal.fire({
                title: '¡Bienvenido!',
                text: `Placa: ${plate}, Ciudad: ${city}, Departamento: ${department}`,
                icon: 'success',
                confirmButtonText: 'Aceptar',
            });
            try {
                const response = await fetch('http://localhost:3000/api/get-plates?repetirRegistros=true&fechaInicio=' + fechaInicio + '&fechaFinal=' + fechaFin);
                const data = await response.json();
                console.log(data)
                let filteredData = [];
                const setFilteredData = () => {
                    if(department == "0") {
                        filteredData = data.filter(plateData => plateData.dato_detectado == plate);
                    } else if(city == "0") {
                        filteredData = data.filter(plateData => plateData.dato_detectado == plate && plateData.camara.ciudad.cod_departamento == department);
                    } else {
                        filteredData = data.filter(plateData => plateData.dato_detectado == plate && plateData.camara.ciudad.id == city && plateData.camara.ciudad.cod_departamento == department);
                    }
                }
                setFilteredData();
                console.log(`Ciudad: ${city}, Departamento: ${department}, placas: ${plate}`)
                console.log(filteredData);

                /* const testDataUnique = [
                    {"id":97,"fecha_sys":"2024-02-01T23:43:06.000Z","id_camara":2,"dato_detectado":"gwq600","color":"null","marca":"null","tipo_vehiculo":"Unknown","score":86.4,"camara":{"id":1,"nombre":"Colegio San Isidoro 1","id_ciudad":123,"gps":"https://maps.app.goo.gl/Ga1pfeauQA36dBiM6","detalles_tecnicos":"ESP32 CAM RESOLUCIÓN 800X600","mac":"00:1B:44:11:3A:B7","posicion":"frontal","latitud":4.153960,"longitud":-74.875000,"ciudad":{"id":123,"cod":"268","nombre_ciudad":"Espinal","cod_departamento":73}}},
                    {"id":97,"fecha_sys":"2024-02-01T23:43:06.000Z","id_camara":3,"dato_detectado":"gwq600","color":"null","marca":"null","tipo_vehiculo":"Unknown","score":86.4,"camara":{"id":1,"nombre":"Colegio San Isidoro 1","id_ciudad":123,"gps":"https://maps.app.goo.gl/Ga1pfeauQA36dBiM6","detalles_tecnicos":"ESP32 CAM RESOLUCIÓN 800X600","mac":"00:1B:44:11:3A:B7","posicion":"frontal","latitud":4.1563073,"longitud":-74.90642,"ciudad":{"id":123,"cod":"268","nombre_ciudad":"Espinal","cod_departamento":73}}},
                    {"id":97,"fecha_sys":"2024-02-01T23:43:06.000Z","id_camara":4,"dato_detectado":"gwq600","color":"null","marca":"null","tipo_vehiculo":"Unknown","score":86.4,"camara":{"id":1,"nombre":"Colegio San Isidoro 1","id_ciudad":123,"gps":"https://maps.app.goo.gl/Ga1pfeauQA36dBiM6","detalles_tecnicos":"ESP32 CAM RESOLUCIÓN 800X600","mac":"00:1B:44:11:3A:B7","posicion":"frontal","latitud":4.151044,"longitud":-74.891634,"ciudad":{"id":123,"cod":"268","nombre_ciudad":"Espinal","cod_departamento":73}}},
                    {"id":97,"fecha_sys":"2024-02-01T23:43:06.000Z","id_camara":5,"dato_detectado":"gwq600","color":"null","marca":"null","tipo_vehiculo":"Unknown","score":86.4,"camara":{"id":1,"nombre":"Colegio San Isidoro 1","id_ciudad":123,"gps":"https://maps.app.goo.gl/Ga1pfeauQA36dBiM6","detalles_tecnicos":"ESP32 CAM RESOLUCIÓN 800X600","mac":"00:1B:44:11:3A:B7","posicion":"frontal","latitud":4.156766,"longitud":-74.886518,"ciudad":{"id":123,"cod":"268","nombre_ciudad":"Espinal","cod_departamento":73}}}
                ] */
                const testDataUnique = getUniqueProperty(filteredData, 'id_camara');
                const duplicatedLocations = getDuplicateArraysByProperty(filteredData, 'id_camara');
                const uniqueLocations = getUniqueProperty(testDataUnique, 'id_camara');
                for(let j in duplicatedLocations) {
                    let builtLocationsDateString = "";
                    for(let i in duplicatedLocations[j]) {
                        const fecha = new Date(duplicatedLocations[j][i].fecha_sys);
                        const fechaData = {
                            año: fecha.getFullYear(),
                            mes: fecha.getMonth(),
                            dia: fecha.getDate(),
                            hora: fecha.getHours(),
                            minutos: fecha.getMinutes(),
                            segundos: fecha.getSeconds()
                        }
                        builtLocationsDateString += `
                        <div style="margin: 10px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 4px; padding: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); display: flex; flex-wrap: wrap;">
                        <div style="flex-basis: 60%; flex-grow: 1; display: flex; align-items: center;">
                            <div>
                                <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">${duplicatedLocations[j][i].dato_detectado}</h3>
                                <p style="font-size: 14px; color: #666; margin: 0;"><i>${fechaData.dia} de ${meses[fechaData.mes]} del ${fechaData.año} | ${fechaData.hora}:${fechaData.minutos}:${fechaData.segundos}</i></p>
                            </div>
                            <div class="imageContainerCircle" style="display: none; margin-left: 10px; max-height: 70px; max-width: 200px;">
                                <img class="displayedImageCircle" src="" alt="Image" style="max-width: 100%; max-height: 100%; width: 200px; height: 60px; border-radius: 4px;">
                            </div>
                        </div>
                        <div class="buttonContainerCircle" style="flex-basis: 40%; display: flex; justify-content: flex-end; margin-top: 10px;">
                            <button class="showImageBtnCircle" id="${duplicatedLocations[j][i].id}" style="background-color: #4CAF50; color: white; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer;">Mostrar Imagen</button>
                        </div>
                    </div>
                        `;
                    };
                    var circle = L.circle([duplicatedLocations[j][0].camara.latitud, duplicatedLocations[j][0].camara.longitud], {
                        color: 'red',
                        fillColor: '#f03',
                        fillOpacity: 0.5,
                        radius: (duplicatedLocations[j].length >= 2) ? 40 : 60
                    }).addTo(map);
                    circle.bindPopup(builtLocationsDateString, {maxHeight: 300, maxWidth: 1000});
                    circle.on("popupopen", (e) => {
                        const container = e.popup._container;
                        const showImageBtnCircle = container.getElementsByClassName('showImageBtnCircle');
                        for(let i = 0; i < showImageBtnCircle.length; i++){
                            showImageBtnCircle[i].addEventListener('click', async (e) => {
                                const parentElement = showImageBtnCircle[i].parentElement.parentElement;
                                console.log(parentElement);
                                const imageContainerCircle = parentElement.getElementsByClassName('imageContainerCircle')[0];
                                const displayedImageCircle = parentElement.getElementsByClassName('displayedImageCircle')[0];
                                const buttonContainerCircle = parentElement.getElementsByClassName('buttonContainerCircle')[0];
                                const response = await fetch('http://localhost:3000/api/get-plates?idRegistro=' + e.target.id);
                                const data = await response.json();
                                const fotoBuffer = data.foto.data;
                                // Make displayImageCircle src the image retrieved from response
                                const imageUrl = `data:image/png;base64,${toBase64(fotoBuffer)}`;
                                displayedImageCircle.onerror = () => {
                                    displayedImageCircle.src = "./images/warning.png";
                                };
                                displayedImageCircle.src = `data:image/png;base64,${toBase64(fotoBuffer)}`;
                                imageContainerCircle.style.display = 'block';
                                buttonContainerCircle.style.display = 'none';

                            }
                        );
                        };
                    });
                }
                // remove all listeners once the popup is closed
                
                const coordinates = uniqueLocations.map(location => [location.camara.latitud, location.camara.longitud]);
                console.log(coordinates)
                var polygon = L.polygon(coordinates).addTo(map);
                for(let location of uniqueLocations){
                    const fecha = new Date(location.fecha_sys);
                    const fechaData = {
                        año: fecha.getFullYear(),
                        mes: fecha.getMonth(),
                        dia: fecha.getDate(),
                        hora: fecha.getHours(),
                        minutos: fecha.getMinutes(),
                        segundos: fecha.getSeconds()
                    }
                    var marcador = L.marker([location.camara.latitud, location.camara.longitud]).addTo(map);
                    marcador.bindPopup(`<div style="margin: 10px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 4px; padding: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); display: flex; flex-wrap: wrap;">
                    <div style="flex-basis: 60%; flex-grow: 1; display: flex; align-items: center;">
                        <div>
                            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">${location.dato_detectado}</h3>
                            <p style="font-size: 14px; color: #666; margin: 0;"><i>${fechaData.dia} de ${meses[fechaData.mes]} del ${fechaData.año} | ${fechaData.hora}:${fechaData.minutos}:${fechaData.segundos}</i></p>
                        </div>
                        <div class="imageContainerMarker" style="display: none; margin-left: 10px; max-height: 70px; max-width: 200px;">
                            <img class="displayedImageMarker" src="" alt="Image" style="max-width: 100%; max-height: 100%; width: 200px; height: 60px; border-radius: 4px;">
                        </div>
                    </div>
                    <div class="buttonContainerMarker" style="flex-basis: 40%; display: flex; justify-content: flex-end; margin-top: 10px;">
                        <button class="showImageButton" id="${location.id}" style="background-color: #4CAF50; color: white; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer;">Mostrar Imagen</button>
                    </div>
                </div>`, {maxHeight: 300, maxWidth: 1000});
                    marcador.on("popupopen", (e) => {
                        // Get container of button
                        const container = e.popup._container;
                        const showImageBtnMarker = container.getElementsByClassName('showImageButton');
                        for(let i = 0; i < showImageBtnMarker.length; i++){
                            showImageBtnMarker[i].addEventListener('click', async (e) => {
                                const parentElement = showImageBtnMarker[i].parentElement.parentElement;
                                console.log(parentElement);
                                const imageContainerMarker = parentElement.getElementsByClassName('imageContainerMarker')[0];
                                const displayedImageMarker = parentElement.getElementsByClassName('displayedImageMarker')[0];
                                const buttonContainerMarker = parentElement.getElementsByClassName('buttonContainerMarker')[0];
                                const response = await fetch('http://localhost:3000/api/get-plates?idRegistro=' + e.target.id);
                                const data = await response.json();
                                const fotoBuffer = data.foto.data;
                                // get parent element of button
                                imageContainerMarker.style.display = 'block';
                                buttonContainerMarker.style.display = 'none';
                                // Make displayImageMarker src the image retrieved from response
                                displayedImageMarker.src = `data:image/png;base64,${toBase64(fotoBuffer)}`;
                            });
                        }
                    });
                    // remove all listeners once the popup is closed
                }
            } catch(err) {
                console.error('Error:', err);
            }
        }
    });
}

const getPlates = async () => {
    try {
        const responses = {
            getCities: await fetch('http://localhost:3000/api/get-cities'),
            getPlates: await fetch('http://localhost:3000/api/get-plates'),
            departamentos: await fetch('http://localhost:3000/api/get-departments')
        }
        const platesData = await responses.getPlates.json();
        const departamentosData = await responses.departamentos.json();
        const citiesData = await responses.getCities.json();
        onChangeDepartamentos(citiesData);
        onChangeMunicipios();
        onSubmitMainForm(platesData);
        enableInputElements();
        fillDatalistWithPlates(platesData);
        fillSelectWithDepartments(departamentosData);
    } catch (error) {
        console.error('Error:', error);
    }
    
}

getPlates();