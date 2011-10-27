var OpenERPGoogleMap = function() {
	this.OPTIONS = {
		zoom: 16,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	this.init();
};


OpenERPGoogleMap.prototype.getFixedValue = function(element) {
	return this.editMode ? element.val() : element.text();
};

OpenERPGoogleMap.prototype.drawMap = function() {
	var lat = this.getFixedValue(this.latElement);
	var lng = this.getFixedValue(this.lngElement);
	var map = new google.maps.Map(this.canvas[0], this.OPTIONS);
	var point = new google.maps.LatLng(lat, lng);
	var marker = new google.maps.Marker({
		map: map,
		position: point,
		draggable: this.editMode
	});
	var self = this;
	google.maps.event.addListener(marker, "dragend", function() {
		self.latElement.val(marker.getPosition().lat());
		self.lngElement.val(marker.getPosition().lng());
	});
	map.setCenter(point);
};

OpenERPGoogleMap.prototype.getAddress = function() {
	var address = "";
	var addressElements = [
		$('input[id$="zip"]').val(),
		$('input[id$="street"]').val(),
		$('input[id$="street2"]').val(),
		$('input[id$="city"]').val(),
		$('input[id$="country_id_text"]').val(),
		$('input[id$="state_id_text"]').val()
	];
	var separator = "";
	for (var i = 0; i < addressElements.length; i++) {
		if (addressElements[i]) {
			address += separator;
			address += addressElements[i];
			// Dirty but easy.
			separator = ", ";
		}
	}
	return address;
};

OpenERPGoogleMap.prototype.codeAddress = function() {
	var address = this.getAddress();
	var geocoder = new google.maps.Geocoder();
	var self = this;
	geocoder.geocode({'address': address}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			self.latElement.val(results[0].geometry.location.lat());
			self.lngElement.val(results[0].geometry.location.lng());
			self.drawMap();
		} else {
			alert("Geocode was not successful for the following reason: " + status);
		}
	});
};

OpenERPGoogleMap.prototype.init = function() {
	this.canvas = $("div#gmap");
	
	this.latElement = $('[id$="lat"]');
	this.lngElement = $('[id$="lng"]');
	if (!this.latElement.length)
		return;
	
	this.editMode = (this.latElement.is("input")) &&
		!this.latElement.attr("readonly") &&
			!this.latElement.attr("disabled");
	
	this.gc = $("button#gcb");
	
	var lat = this.getFixedValue(this.latElement);
	var lng = this.getFixedValue(this.lngElement);
	
	if ((lat == 0) && (lng == 0)) {
		$(this.canvas[0]).before($("<p>Please, click the &#147;Get coordinates&#148; button \
			to geocode the address and draw the map.</p>"));
	} else {
		this.drawMap();
	}
	
	if (this.editMode) {
		var self = this;
		this.gc.click(function() {
			self.codeAddress();
		});
	} else {
		this.gc.attr("disabled", "disabled");
	}
};
