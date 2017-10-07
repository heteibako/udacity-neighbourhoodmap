//Error function

window.ifErrorOccurs = function (msg, url, lineNo, columnNo, error) {
  var string = msg.toLowerCase();
  var substring = "script error";
  if (string.indexOf(substring) > -1){
      alert('Script Error: See Browser Console for Detail');
  } else {
      var message = [
          'Message: ' + msg,
          'URL: ' + url,
          'Line: ' + lineNo,
          'Column: ' + columnNo,
          'Error object: ' + JSON.stringify(error)
      ].join(' - ');

      alert(message);
  }

  return false;
};


/*Model and ModelView start*/
//Locations array
var locations = [
  {
    name: "Alexander Platz",
    location: {
      lat: 52.5219184,
      lng: 13.4132147
    }
  }, {
    name: "Berghain",
    location: {
      lat: 52.510626,
      lng: 13.442224
    }
  }, {
    name: "Theater des Westens",
    location: {
      lat: 52.5055548,
      lng: 13.3290325
    }
  }, {
    name: "Brandenburger Tor",
    location: {
      lat: 52.516506,
      lng: 13.381815
    }
  }, {
    name: "East Side Gallery",
    location: {
      lat: 52.505508,
      lng: 13.4393136
    }
  }, {
    name: "Frau Mittenmang",
    location: {
      lat: 52.5503246,
      lng: 13.4193707
    }
    }, {
    
      name: "Komische Oper",
      location: {
        lat: 52.5156675,
        lng: 13.3868596
      }
    }
  
  
];
console.log(locations);

//Model
function ViewModel() {
  var self = this;
  var locationsArr = [];
  for (var i = 0; i < locations.length; i++) {
    locationsArr.push(locations[i]);
  }
  self.locations = ko.observableArray(locationsArr);
  self.networkError = ko.observable(false);
  self.filterContent = ko.observable("");
  
  self.click = function (location) {
    var index = locations.indexOf(location);
    toggleBounce(markers[index]);
    map.panTo(markers[index].position);
  };
  self.filter = function () {
    //filter is none
    var i;
    if (self.filterContent() === "") {
      if (self.locations.length != locations.length) {
        self
          .locations
          .removeAll();
        for (i = 0; i < locations.length; i++) {
          self
            .locations
            .push(locations[i]);
        }
      }
      showMarkers(markers);
      clearAllBounceAndInfo();
      return;
    }
    //filter data
    var tempLocationsArrs = [];
    for (i = 0; i < locations.length; i++) {
      if (locations[i].name.toLowerCase().indexOf(self.filterContent().toLowerCase()) > -1) {
        tempLocationsArrs.push(locations[i]);
      }
    }
    if (tempLocationsArrs.length > 0) {
      self
        .locations
        .removeAll();
      for (i = 0; i < tempLocationsArrs.length; i++) {
        self
          .locations
          .push(tempLocationsArrs[i]);
      }
    } else {
      self
        .locations
        .removeAll();
    }
    console.log(tempLocationsArrs.length);
    //find the marker"s index
    var markersArr = [];
    for (i = 0; i < tempLocationsArrs.length; i++) {
      markersArr.push(markers[locations.indexOf(tempLocationsArrs[i])]);
    }
    showMarkers(markersArr);
  };
  self
    .filterContent
    .subscribe(function (newValue) {
      self.filter();
    });
}

/*Model and ModelView  end*/

/* map start*/
var map;
var infoWindow; //only one infoWindow
var markers = [];

function initMap() {
  map = new google
    .maps
    .Map(document.getElementById("map"), {
      center: {
        lat: 52.5219184,
        lng: 13.413214700000026
      },
      zoom: 13
    });
  //init markers and infowindow
  function bounce(){
    toggleBounce(this);
  }
  for (var i = 0; i < locations.length; i++) {
    var marker = new google
      .maps
      .Marker({position: locations[i].location, map: map, title: locations[i].name});
    markers.push(marker);
    markers[i].addListener("click", bounce);
  }
  infowindow = new google
    .maps
    .InfoWindow({content: ""});
}

function toggleBounce(marker) {
  if (marker.getAnimation()) {
    marker.setAnimation(null);
    infowindow.close(map, marker);
  } else {
    clearAllBounceAndInfo();
    marker.setAnimation(google.maps.Animation.BOUNCE);
    asyncContent(marker, marker.title);
  }
}

//Loading the foursquare API to additional data to the info window

function asyncContent(marker, title) {
  var client_id = "EMHASFPDCAF20PL2FQHQGGO1U3JR5XSLNGQNFAS4S2WFX3NK";
  var client_secret = "2QWJTYR14FMA4O4UAJ3B4D3XJXSGBFPC1521EEZGLGO4MEBF";
  
  var request = $
    .ajax({
      url: "https://api.foursquare.com/v2/venues/search",
      dataType: "json",
      data: "limit=1&ll=52.5219184,13.4132147&query=" + title + "&client_id=" + client_id + "&client_secret=" + client_secret + "&v=20170101"
      
      
    })
    .done(function(data) {
      if (!data.response.venues[0].location.address || undefined) {
          infowindow.setContent("<h4>" + data.response.venues[0].name + "</h4>Check-ins: " + data.response.venues[0].stats.checkinsCount + "<br><p>Address: No address provided");
      } else {
          infowindow.setContent("<h4>" + data.response.venues[0].name + "</h4>Check-ins: " + data.response.venues[0].stats.checkinsCount + "<br><p>Address: " + data.response.venues[0].location.address);
      }
      infowindow.open(map, marker);

    })
    .fail(function (e) {
      infowindow.setContent("Network Error please check your connection!");
      infowindow.open(map, marker);
    });
}

function showMarkers(markersArr) {
  clearAllBounceAndInfo();
  //hide all info
  for (i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  //show the markers
  for (i = 0; i < markersArr.length; i++) {
    markersArr[i].setMap(map);
    markersArr[i].setAnimation(google.maps.Animation.BOUNCE);
  }

}
//clear all animations
function clearAllBounceAndInfo() {
  for (i = 0; i < locations.length; i++) {
    markers[i].setAnimation(null);
    infowindow.close(map, markers[i]);
  }
}
/* map end*/

var vm = new ViewModel();
ko.applyBindings(vm);

function initMapError() {
  vm.networkError(true);
}
