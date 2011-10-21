jQuery(function() {
	
	var OPTIONS = {
		zoom: 16,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	
	function getFixedValue(element, editMode) {
		return editMode ? element.val() : element.text();
	}
	
	function drawMap(canvas, latElement, lngElement, editMode) {
		var lat = getFixedValue(latElement, editMode);
		var lng = getFixedValue(lngElement, editMode);
		var map = new google.maps.Map(canvas[0], OPTIONS);
		var point = new google.maps.LatLng(lat, lng);
		var marker = new google.maps.Marker({
			map: map,
			position: point,
			draggable: editMode
		});
		google.maps.event.addListener(marker, "dragend", function() {
			latElement.val(marker.getPosition().lat());
			lngElement.val(marker.getPosition().lng());
		});
		map.setCenter(point);
	}
	
	function getAddress() {
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
	}
	
	function codeAddress(canvas, latElement, lngElement, editMode) {
		var address = getAddress();
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({'address': address}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				latElement.val(results[0].geometry.location.lat());
				lngElement.val(results[0].geometry.location.lng());
				drawMap(canvas, latElement, lngElement, editMode);
			} else {
				alert("Geocode was not successful for the following reason: " + status);
			}
		});
	};
	
	function main() {
		var latElement = $('[id$="lat"]'),
			lngElement = $('[id$="lng"]');
		
		if (!latElement.length)
			return;
		
		var editMode = (latElement.is("input")) && 
			!latElement.attr("readonly") &&
				!latElement.attr("disabled");
		
		var canvas = $("div#gmap");
		
		var gc = $("button#gcb");
		
		var lat = getFixedValue(latElement, editMode);
		var lng = getFixedValue(lngElement, editMode);
		
		if ((lat == 0) && (lng == 0)) {
			$(canvas[0]).before($("<p>Please, click the &#147;Get coordinates&#148; button \
				to geocode the address and draw the map.</p>"));
		} else {
			drawMap(canvas, latElement, lngElement, editMode);
		}
		
		if (editMode) {
			gc.click(function() {
				codeAddress(canvas, latElement, lngElement, editMode);
			});
		} else {
			gc.attr("disabled", "disabled");
		}
	};
	
	main();
});
