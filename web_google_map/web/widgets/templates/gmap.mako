<button id="gcb" class="button-b" type="button">
	<img width="16" height="16" alt="" src="/openerp/static/images/stock/gtk-execute.png">
	<span>Get coordinates</span>
</button>
<div id="gmap"></div>
<script>
	jQuery(function() {
		setTimeout(function() {
			new OpenERPGoogleMap();
		}, 500);
	});
</script>
