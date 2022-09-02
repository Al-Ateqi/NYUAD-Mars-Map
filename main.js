function unique(data, property){
    // return data.map(item => item.properties[property])
    // .filter((value, index, self) => self.indexOf(value) === index)
    let unique=[];
    if(typeof property=='string'){
        data.features.forEach(function(feature){
            item=feature.properties[property];
            if(!unique.includes(item))
                unique.push(item);
        });
        return unique;
    }
    let dict=[];
    data.features.forEach(function(feature){
        item=feature.properties[property[0]];
        if(!unique.includes(item)){
            unique.push(item);
            dict.push([feature.properties[property[0]],feature.properties[property[1]]]);
        }
    });
    // console.log(dict);
    return dict;
    // return _.keys(_.countBy(data, function(data) { return data.properties[property];}));
};


// -----------------------------------------------------------------------------
var southWest = L.latLng(-90, -2*360),
    northEast = L.latLng(90, 2*360),
    bounds = L.latLngBounds(southWest, northEast);


var map = L.map('map',{
    center: [0, 0],
	zoom: 1,
    zoomDelta: 0.5,
    zoomSnap: 0.5,
    zoomControl: false,
    maxBounds:bounds,
    maxBoundsViscosity: 1,
    minZoom:0.5,
    maxZoom:8,
    // continuousWorld: true,
    // noWrap:false,
    crs: L.CRS.EPSG4326,
    // attributionControl: false,
});

// Controls---------------------------------------------------------------------

// Coordinates
function formatlng(num){
    var s=num;
    if(Math.round(num)==num) s=num+'.';
    if(num>=100){
        return String(s).padEnd(7, '0');
    }
    if(num>=10){
        return '0'+String(s).padEnd(6, '0');}
    return '00'+String(s).padEnd(5, '0');
}
function formatlat(num){
    var s=num;
    if(Math.round(num)==num) s=num+'.';
    if(num>=10){
        return String(s).padEnd(6, '0');}
    return '0'+String(s).padEnd(5, '0');
}
let coordP = L.control.coordProjection({
    position: 'bottomleft',
    separator: ' | ',
    latFormatter: function(lat){ lat=Math.round(lat*1000)/1000; return (lat>=0)? formatlat(lat)+'N':formatlat(-lat)+'S';},
    lngFormatter: function(lng){ lng=Math.round(lng*1000)/1000; return (lng>=0)? formatlng(lng)+'E':formatlng(-lng)+'W';},
    numDigits: 2,
}).addTo(map);


//Zoom
L.control.zoom({
    position: 'bottomright',
}).addTo(map);

//Home
L.easyButton('fa fa-home', function(btn, map){map.setView([0,0], 1.5)},'reset view',{
    position:'bottomright'
}).addTo(map);


var globe=L.easyButton({
    states: [{
            stateName: '3D',
            icon:      'bi bi-globe2',
            title:     '3D view',
            onClick: function(btn, map) {       // and its callback
                // map.setView([46.25,-121.8],10);
                btn.state('2D');    // change state on click!
            }
        }, {
            stateName: '2D',
            icon:      'bi bi-grid-3x3',
            title:     '2D view',
            onClick: function(btn, map) {
                // map.setView([42.3748204,-71.1161913],16);
                btn.state('3D');
            }
    }],
    position: 'bottomright',
});

//Side Bar
var sidebar = L.control.sidebar('sidebar').addTo(map);

sidebar.close();


//info-box
// var informationBox=L.control.infosidebar('infosidebar', {
//     closeButton: true,
//     position: 'left'
// }).addTo(map);

updateinfoBox = function (layer) {
    // console.log(layer);
    let info='';
    let props=layer.feature.properties;
    if(props.Unit){
        info=`<h4>Mars Geological Units</h4> <table>`;
        for (const [key, value] of Object.entries(props)){
            info+=`<tr> <td>${key}</td> <td>${value}</td> </tr>`;
        };
        info+=`</table>`;
        sidebar.open('info');
    }
    else{
        info=`<h4>Mars Surface Structure</h4> <table>`;
        for (const [key, value] of Object.entries(props)){
            info+=`<tr> <td>${key}</td> <td>${value}</td> </tr>`;
        };
        info+=`</table>`;
    }
	document.getElementById("infosidebar-info").innerHTML= info;

};

// const panelLeft = L.control.sidepanel('mySidepanelLeft', {
//   panelPosition: 'left',
//   hasTabs: true,
//   tabsPosition: 'left',
//   pushControls: true,
//   darkMode: false,
//   // startTab: 'tab-5',
// }).addTo(map);

//Layers------------------------------------------------------------------------

//Base Map
exi=L.tileLayer('https://github.com/Al-Ateqi/MarsMap/raw/main/Tiles-using-Python/tiles/{z}/{x}/{y}.png',{
}).addTo(map);




//icons-------------------------------------------------------------------------
var whiteDotIcon = L.icon({
    iconUrl: 'assets/icon-white-dot.png',
    // 'https://cdn-icons-png.flaticon.com/512/565/565665.png',
    iconSize: [8, 8], // size of the icon
    // shadowSize: [50, 64], // size of the shadow
    iconAnchor: [4, 4], // point of the icon which will correspond to marker's location
    // shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor: [0, -6], // point from which the popup should open relative to the iconAnchor
    className: 'behind',
});
var blackDotIcon = L.icon({
    iconUrl: 'assets/icon-black-dot.png',
    iconSize: [10, 10], // size of the icon
    // shadowSize: [50, 64], // size of the shadow
    iconAnchor: [5, 5], // point of the icon which will correspond to marker's location
    // shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor: [0, -6] // point from which the popup should open relative to the iconAnchor
});

// Geojson----------------------------------------------------------------------
// Surface Features-------------------------------------------------------------
function sfPopupContent(feature){
    const {Diameter, Origin, Location, Description}= feature.properties;
    var html=`<div class='popup-info'> <b class='popup-title'> ${feature.properties['Feature Name']} </b>`;
    if(Description!='None'){
        html+=`<p style= "text-align: justify"> ${Description} </p>`
    }
    html+=`
            <table>
                <tr>
                    <td>Type: </td> <td style="text-align:right"> ${feature.properties['Feature Type']} </td>
                </tr>
                <tr>
                    <td>Diameter: </td> <td style="text-align:right"> ${Diameter} km </td>
                </tr>
                <tr>
                    <td>Location: </td> <td style="text-align:right"> ${Location} </td>
                </tr>
                <tr>
                    <td>Origin: </td> <td style="text-align:right"> ${Origin} </td>
                </tr>
            </table>
        </div>
    `;
    return html;
}
var sf_major_array=['Olympus Mons','Antoniadi', 'Cassini', 'Echus Chasma', 'Gale', 'Greeley', 'Hadley', 'Hellas Planitia', 'Huygens', 'Newton', 'Noctis Labyrinthus', 'Schiaparelli', 'Valles Marineris', 'Zunil'];

var sf=[];
for (let i=0; i<=8;i++){
    var type=true;
    sf.push(L.geoJson(surfaceFeatures, {
        // style:sfStyle,
        pointToLayer: function (feature, latlng) {
            type=feature.properties.Description!='None' ? 'Major':'Minor'; //true for Major, false for Minor
            if (feature.properties.Zoom==i&&!sf_major_array.includes(feature.properties['Feature Name'])){
                // if(major.includes(feature.properties['Feature Name'])){
                if(feature.properties.Description!='None'){
                    return L.marker(latlng,{
                        icon: blackDotIcon,
                        interactive: false,
                    });
                }
                else{
                    return L.marker(latlng,{
                        icon: whiteDotIcon,
                        interactive: false,
                    });
                }
            };
        },
        onEachFeature: function(feature, layer) {
            layer.bindPopup(sfPopupContent(feature));
            layer.bindTooltip('<a class="alabel" tabindex="1">'+feature.properties['Feature Name']+'<\a>', {
                interactive: true,
                permanent: true,
                direction:'right',
                className: 'label sfLabel-'+type,
            });
        },
    }));
//last line of loop
}

var sf_Major=L.layerGroup();
// var overlap=['Noctis Labyrinthus','Tithonium Chasma','Coprates Chasma','Ganges Chasma',];
surfaceFeatures.features.forEach(function(feature){
    // if(feature.properties.Description!='None'){
    if(sf_major_array.includes(feature.properties['Feature Name'])){
        direction='right';
        // if(overlap.includes(feature.properties['Feature Name'])){
        //     direction='left';
        // }
        marker=L.marker([feature.geometry.coordinates[1],feature.geometry.coordinates[0]],
            {
                icon: blackDotIcon,
                interactive: false,
            }
        );
        marker.bindPopup(sfPopupContent(feature),{
            maxHeight:'200px',
            className:'custom-scroll',
        });
        marker.bindTooltip('<a class="alabel" tabindex="1">'+feature.properties['Feature Name']+'<\a>', {
            interactive: true,
            permanent: true,
            direction:direction,
            className: 'label sfLabel-Major',
        });
        sf_Major.addLayer(marker);
    }
});

sf_Major.addTo(map);

// var sf_Major=L.geoJson(surfaceFeatures, {
//     if(feature.properties.Description!='None'){
//         pointToLayer: function (feature, latlng) {
//             type=feature.properties.Description!='None' ? 'Major':'Minor'; //true for Major, false for Minor
//             if (feature.properties.Zoom==i){
//                 // if(major.includes(feature.properties['Feature Name'])){
//                 if(feature.properties.Description!='None'){
//                     return L.marker(latlng,{
//                         icon: blackDotIcon,
//                         interactive: false,
//                     });
//                 }
//                 else{
//                     return L.marker(latlng,{
//                         icon: whiteDotIcon,
//                         interactive: false,
//                     });
//                 }
//             };
//         },
//         onEachFeature: function(feature, layer) {
//             layer.bindPopup(sfPopupContent(feature));
//             layer.bindTooltip('<a class="alabel" tabindex="1">'+feature.properties['Feature Name']+'<\a>', {
//                 interactive: true,
//                 permanent: true,
//                 direction:'right',
//                 className: 'label sfLabel-'+type,
//             });
//         },
//     }
// });

// <a id="myLink" href="#" onclick="MyFunction();return false;">link text</a>
// $('#myLink').click(function(){ MyFunction(); return false; });

// Quadrangles------------------------------------------------------------------
var quad;
function highlightFeature(e) {
	var layer = e.target;
    // quad.setStyle=({
    //     fillColor: '#000',
    //     fillOpacity: 0.1,
    // });
	layer.setStyle({
		weight: 2,
		color: '#ea4335',
		dashArray: '',
		fillOpacity: 0
	});
    // layer.tooltip.style='red !important';
    map.flyToBounds(layer.getBounds(), { duration: 1.2} );
	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
		layer.bringToFront();
	}
}

function resetHighlight(e) {
	quad.resetStyle(e.target);
}

function onEachFeature(feature, layer) {
	layer.on({
		// mouseover: highlightFeature,
		// mouseleave: resetHighlight,
		click: highlightFeature,
	});
    // map.on({
    //     click:resetHighlight,
    // });
    let popupcontent=`<div class="popup-info"><b>${feature.properties.name}</b>`;
    popupcontent+=feature.properties.info!=''? `<p>${feature.properties.info}</p>`:``;
    popupcontent+=`</div>`;
    layer.bindPopup(popupcontent);
    layer.bindTooltip('<a class="alabel" tabindex="1">'+feature.properties.name+'<\a>', {
    interactive: true,
    permanent: true,
    direction:'center',
    className: 'quadLabel label',
    });

    layer.getPopup().on('remove', function(){quad.resetStyle()});
}

function quadStyle(feature) {
	return {
		weight: 0.5,
		opacity: 1,
		color: '#080808',
        fillColor: 'transparent',
        fillOpacity: 0,
	};
}

quad=L.geoJson(quadrangles, {
    style:quadStyle,
    interactive: false,
    onEachFeature:onEachFeature,
});

// var quadLabel=L.geoJson(quadrangles,{
//     style:{
//         opacity:0,
//         fillColor: 'transparent',
//         class: 'behind',
//     },
//     onEachFeature: function(feature, layer) {
//         // layer.bindPopup(feature.properties.MAP_LABEL);
//         layer.bindTooltip('<a class="alabel" href="#" onclick="clickQuad(feautre, layer);return false;">'+feature.properties.name+'<\a>', {
//         interactive: true,
//         permanent: true,
//         direction:'center',
//         className: 'quadLabel label',
//         })
//     },
// });


// Contacts---------------------------------------------------------------------
function contStyle(feature) {
    return {
    	weight: 0.8,
    	opacity: 1,
    	color: '#080808',
        dashArray: feature.properties.ConType == 'Approx'? '3':'0',
        fillColor: 'transparent',
    };
}
var cont=L.geoJson(contacts, {
    style:contStyle,
    interactive: false,
})



// Geology----------------------------------------------------------------------
var geoColor={
    'lApc':'#d9f1fb',
    'Hpe':'#0089cf',
    'Hp':'#009bb2',
    'lNh':'#ceae87',
    'mNh':'#cc9d80',
    'AHi':'#8bc63e',
    'Ap':'#009bca',
    'Apu':'#9bb4bd',
    'eNh':'#b9875f',
    'Nhe':'#a52b4c',
    'Nhu':'#b5a9a5',
    'eHh':'#e9caaf',
    'Nve':'#c8242b',
    'eHb':'#41a1ac',
    'HNhu':'#cac2bf',
    'lNv':'#8781bd',
    'ANa':'#bba532',
    'HNb':'#6da69f',
    'eHv':'#b279b4',
    'HNt':'#f9a51b',
    'eAb':'#98d4c0',
    'mNhm':'#a0a397',
    'eNhm':'#8d8e82',
    'lHv':'#f8aa9d',
    'lHb':'#9fb39e',
    'Hve':'#f36e21',
    'Aa':'#eed113',
    'Htu':'#dbd4d1',
    'lHt':'#feca0a',
    'Ht':'#fedda3',
    'Hto':'#aae0f9',
    'lHvf':'#cb9e8f',
    'lAvf':'#cdb0a6',
    'AHv':'#f8aa9d',
    'Ave':'#cc7c59',
    'AHtu':'#e9e3d8',
    'eHt':'#e0af24',
    'lAa':'#c8242b',
    'lAv':'#f9beb7',
    'lHl':'#8bc63e',
    'mAl':'#bdc031',
    'Av':'#f8aa9d',
    'lApd':'#fee9ba',
    'Hpu':'#81adbc',
};

function geoStyle(feature) {
    return {
    	weight: 0,
        opacity:1,
    	color: geoColor[feature.properties.Unit],
        fillOpacity:0.4,
        fillColor: geoColor[feature.properties.Unit],
    };
}

var geo;
let selectedGeo;
geo=L.geoJson(geology, {
    style:geoStyle,
    onEachFeature: function(feature, layer) {
            // layer.bindTooltip(feature.properties.Unit, {
            // interactive: false,
            // permanent: true,
            // direction:'center',
            // className: 'label',
            // })
            layer.on({
            		mouseover: function (e) {
                    	var layer = e.target;
                    	layer.setStyle({
                    		weight: 0.9,
                            // color: 'rgba(0,0,0,0.7)',
                    		// fillOpacity: 1,
                    	});
                        // layer.tooltip.style='red !important';
                        // map.flyToBounds(layer.getBounds(), { duration: 1.2} );
                    	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                    		layer.bringToFront();
                    	}
                    },
            		mouseout: function (e) {
                        var layer = e.target;
                        layer.setStyle({
                            weight: 0,
                        });
                    },
            		click: function (e) {
                        var layer = e.target;
                        geo.resetStyle();
                        if(selectedGeo!=layer){
                            selectedGeo=e.target;
                        	layer.setStyle({
                        		// weight: 1,
                                // color: 'rgba(0,0,0,0.7)',
                        		fillOpacity: 0.8,
                        	});
                            // map.flyToBounds(layer.getBounds(), { duration: 1.2} );

                        	// if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                        	// 	layer.bringToFront();
                        	// }
                            updateinfoBox(layer);
                            // informationBox.show();
                        }else{
                            // informationBox.hide();
                            selectedGeo='';
                        }
                    },
                    // dblclick: function (e) {
                    //     var layer = e.target;
                    //     map.flyToBounds(layer.getBounds(), { duration: 1.2} );
                    // },
            });
        },
});

// Structure--------------------------------------------------------------------

var strucColor={
    'Caldera rim': '#a80000',
    'Channel axis': '#1d62cb',
    'Crater rim': '#c99d48',
    'Graben axis': '#000000',
    'Lobate flow': '#aa0705',
    'Outflow Channel': '#2b60b0',
    'Pit crater chain': '#000000',
    'Ridge': '#000',
    'Rille': '#ec211e',
    'Scarp': '#000000',
    'Spiral trough': '#80adf3',
    'Wrinkle ridge': '#100e0c',
    'Yardangs': '#000000',
};
function strucStyle(feature) {
    return {
    	weight: 1,
    	opacity: 1,
    	color: strucColor[feature.properties.Interpreta]
    };
}

var struc=L.geoJson(structure, {
    style:strucStyle,
});

let selectedStruc='';
let hoveredStruc='';

var struc_transparent;
struc_transparent=L.geoJson(structure, {
    style: function(feature){
        return{
            opacity:0,
            weight:25,
            color: strucColor[feature.properties.Interpreta],
        }
    },
    onEachFeature: function(feature, layer){
        layer.on({
            mouseover: function (e) {
                var layer = e.target;
                if(hoveredStruc!=''){struc_transparent.resetStyle(hoveredStruc)};
                layer.setStyle({
                    weight: 2,
                    opacity:1,
                });

                if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                    layer.bringToFront();
                }
                hoveredStruc=layer;
                updateinfoBox(layer);
            },

            click: function (e) {
                // informationBox.show();
            }
            // click: function (e) {
            //     var layer = e.target;
            //     if (selectedStruc==layer){
            //         struc_transparent.resetStyle(layer);
            //         selectedStruc='';
            //     }
            //     else{
            //         if(selectedStruc!=''){struc_transparent.resetStyle(selectedStruc)};
            //         layer.setStyle({
            //             opacity: 1,
            //             weight: 2,
            //         });
            //         // layer.tooltip.style='red !important';
            //         // map.flyToBounds(layer.getBounds(), { duration: 1.2} );
            //         if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            //             layer.bringToFront();
            //         }
            //         selectedStruc=layer;
            //     }
            // },

        });
    },
});

struc=L.featureGroup([struc,struc_transparent]);


//Temperature-------------------------------------------------------------------
var tempheatmap=[];
let min=0;
let max=0;
// temperatureMorning
tempatNoon.features.forEach(function(feature){
    var value=(feature.properties["Surface Temperature (K)"]+273.15-104.86750640869138)/(261.1108154296875-104.86750640869138);
    tempheatmap.push([feature.geometry.coordinates[1], feature.geometry.coordinates[0], value]);
    if(value<min|min==0)
        min=value;
    if(value>max)
        max=value;
});
// console.log(min+" "+max);

var heat = L.heatLayer(tempheatmap,{
    radius: 10,
    gradient:{'0': '#042e69',
    '0.166': '#2f79b6',
    '0.333': '#91c4e0',
    '0.5': '#fff',
    '0.666': '#f59f82',
    '0.833': '#c0373f',
    '1': '#500418'},
    // radius:25,
    // blur:10
});

// globe.addTo(map);

// Search Bar
// new L.Control.Search({
// 	position:'bottomright',
//     layer:sf[0],
// 	// layer: new L.LayerGroup(sf,sf[4]),
// 	initial: false,
// 	zoom: 4,
// 	marker: false
// }).addTo(map);
// controlSearch.addTo(map);
// map.addControl(controlSearch);





//------------------------------------------------------------------------------
//Legend

// contacts legend
function getContactsLegend (geojson) {
	let div='<div class="legend-info-box">';
    div+='<h4>Global Contacts: Contact Type</h4><table>'
	// loop through our density intervals and generate a label with a colored square for each interval
	unique(geojson,'ConType').forEach(function(item){
		div+='<tr><td class="legend-symbol">'+(item=='Approx'?'- - - - -':'&#8212&#8212&#8212')+'</td><td>'+item+'</td></tr>';
		// '&lt;i style="background:' + getColor(grades[i] + 1) + '"&gt;&lt;/i&gt; ' +
		// grades[i] + (grades[i + 1] ? '&amp;ndash;' + grades[i + 1] + '&lt;br&gt;' : '+');
	});
    div+='</table></div>';
	return div;
};

//Geology legend
function getGeologyLegend (geojson) {
	let div='<div class="legend-info-box">';
    div+=`<h4>Global Geology: Gological Units</h4><table>`
	// loop through our density intervals and generate a label with a colored square for each interval
	unique(geojson,['Unit','UnitDesc']).forEach(function(item){
        // console.log('style='+"background:""${geoColor[item[0]]});
		div+=`<tr><td><i style="background:${geoColor[item[0]]}"></i></td><td> ${item[1]}</td></tr>`;
		// '&lt;i style="background:' + getColor(grades[i] + 1) + '"&gt;&lt;/i&gt; ' +
		// grades[i] + (grades[i + 1] ? '&amp;ndash;' + grades[i + 1] + '&lt;br&gt;' : '+');
	});
    div+=`</table></div>`;
	return div;
};

function getStructureLegend (geojson) {
	let div='<div class="legend-info-box">';
    div+=`<h4>Global Structure: Interpretation</h4><table>`
	// loop through our density intervals and generate a label with a colored square for each interval
	unique(geojson,'Interpreta').forEach(function(item){
        // console.log('style='+"background:""${geoColor[item[0]]});
		div+=`<tr><td class="legend-symbol" style="color:${strucColor[item]}">&#8212&#8212&#8212</td><td> ${item}</td></tr>`;
		// '&lt;i style="background:' + getColor(grades[i] + 1) + '"&gt;&lt;/i&gt; ' +
		// grades[i] + (grades[i + 1] ? '&amp;ndash;' + grades[i + 1] + '&lt;br&gt;' : '+');
	});
    div+=`</table></div>`;
	return div;
};


sidebar.updateLegend=function(){
    let legend;
    legend=getContactsLegend(contacts);
    legend+=getStructureLegend(structure);
    legend+=getGeologyLegend(geology);
    // legend+=getContactsLegend(contacts);
	document.getElementById("legend-info").innerHTML=legend;
};

sidebar.updateLegend();

//------------------------------------------------------------------------------
function sfRender(zoom){
    zoom=Math.floor(zoom+0.5);
    if(map.hasLayer(sfDummy)){
        if(zoom>0){
            for(let i=zoom; i<=8; i++){
                map.removeLayer(sf[i]);
            }
            for(let i=0; i<=zoom; i++){
                map.addLayer(sf[i]);
            }
            for(let i=0; i>=zoom+1; i++){
                map.removeLayer(sf[i]);
            }
        }
        else{
            for(let i=0; i<=8; i++){
                map.removeLayer(sf[i]);
            }
        }
    }
    else{
        for(let i=0; i<=8; i++){
            map.removeLayer(sf[i]);
        }
    }
}
function quadRender(zoom){
    if (zoom<1 || zoom>5 || !map.hasLayer(quadDummy)){
        map.removeLayer(quad);
    }else{
        map.addLayer(quad);
    };
}
function contRender(zoom){
    if(map.hasLayer(contDummy) && zoom>0){
        map.addLayer(cont);
    }else{
        map.removeLayer(cont);
    }
}


map.on('zoomend', function() {
    var zoom=map.getZoom();
    sfRender(zoom-2);
    quadRender(zoom);
    contRender(zoom);
    cont.bringToFront();
});

map.on('overlayadd', function() {
    var zoom=map.getZoom();
    if(map.hasLayer(sfDummy)){sf_Major.addTo(map)};
    if(map.hasLayer(struc)||map.hasLayer(geo)){
        // informationBox.show()
        sidebar.open('legend');
    };
    sfRender(zoom-2);
    quadRender(zoom);
    contRender(zoom);
    cont.bringToFront();
});

map.on('overlayremove', function() {
    var zoom=map.getZoom();
    if(!map.hasLayer(sfDummy)){map.removeLayer(sf_Major)};
    // if(!(map.hasLayer(struc)||map.hasLayer(geo))){informationBox.hide()};
    if(!(map.hasLayer(struc)||map.hasLayer(geo))&&sidebar.isOpen()){
        // informationBox.show()
        sidebar.close();
    };
    sfRender(zoom-2);
    quadRender(zoom);
    contRender(zoom);
});

// map.on('baselayerchange', function(e){
//     // console.log(map.activeBaseLayer);
//     // console.log(e.name);
//     if(e.name=='EXI-Final-Maptiler-WGS84'){
//         console.log(e.name);
//         map.options.crs=L.CRS.EPSG4326;
//         map.fitWorld();
//     }else{
//         console.log('crs=3857');
//         map.options.crs=L.CRS.EPSG3857;
//     };

//     // map.activeBaseLayer=e.layer;
// });


function onOverlayAdd(){

}

// Layer Control
var baseMaps = {
    "EXI":exi,
};
var sfDummy=L.layerGroup();
var quadDummy=L.layerGroup();
var contDummy=L.layerGroup();

var overlayMaps = {
    "Surface Features": sfDummy,
    "Quadrangles": quadDummy,
    "Golbal Contacts":contDummy,
    "Global Geology":geo,
    "Global Structure": struc,
    // "Surface Temperature":heat,
};

sfDummy.addTo(map);
// quadDummy.addTo(map);
// contDummy.addTo(map);


var layerControl = L.control.layers(baseMaps, overlayMaps,
    {
        position:'topright',
        collapsed:false
    }
).addTo(map);

map.setView([0,0]);
// -----------------------------
// map.panBy([-300 / 2, 0], {
//     duration: 0.05
// });


var options = {interval: 20,
               showOriginLabel: true,
               redraw: 'move',
               zoomIntervals: [
                {start: 0, end: 3, interval: 30},
                {start: 4, end: 5, interval: 5},
                {start: 6, end: 7, interval: 1}
            ]};

L.simpleGraticule(options).addTo(map);

