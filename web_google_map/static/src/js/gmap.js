/*global: _,openerp,document,setTimeout,alert */

openerp.web_google_map = function(instance) {

    // GOOGLE generic lib code

    /**
     * Returns a $.Def which resolve once google jsapi is loaded.
     *
     * It will make sure not to load twice jsapi, and the returned deferred will
     * be already resolved if lib is already loaded.
     */
    function google_ensure_jsapi_loaded() {
        if (typeof(instance.google_jsapi_loaded) !== "undefined") {
            // please wait until the first call finishes:
            return instance.google_jsapi_loaded;
        }

        instance.google_jsapi_loaded = $.Deferred();
        window.ginit = function() {
            instance.google_jsapi_loaded.resolve();
        };
        console.log('Loading Google jsapi.');
        $.getScript('//www.google.com/jsapi' +
                    '?sensor=false&async=true&callback=ginit');
        return instance.google_jsapi_loaded;
    }

    /**
     * Returns a $.Def which resolve once google module is loaded.
     *
     * It will make sure not to load twice a module, and the returned deferred will
     * be already resolved if lib already loaded.
     */
    function google_ensure_module_loaded(module, version, options) {
        if (typeof(instance.google_modules) === "undefined") {
            instance.google_modules = {};
        }
        if (typeof(instance.google_modules[module]) !== "undefined") {
            // please wait until the first call finishes
            return instance.google_modules[module];
        }
        instance.google_modules[module] = $.Deferred();
        google_ensure_jsapi_loaded().then(function() {
            console.log('Loading Google module: ' + module);
            $.extend(options, {
                callback: function() {
                    instance.google_modules[module].resolve();
                }
            });
            google.load(module, version, options);
        });
        return instance.google_modules[module];
    }
    function getFixedValue(value) {
        try {
            value = value.toString();
            if (value === "")
                return 0;
            return parseFloat(value.replace(",", "."));
        } catch(e) {
            console.log(e);
        }
    }



    // Form widget

    instance.web_google_map.form = {};

    instance.web_google_map.form.FieldGoogleMap = instance.web.form.AbstractField.extend(instance.web.form.ReinitializeFieldMixin, {
        template: 'GoogleMap',

        init: function (view, node) {
            this._super(view, node);
        },

        destroy_content: function () {
        },

        get_lat_lng: function() {
            return [
                getFixedValue(this.widget_lat.get_value()),
                getFixedValue(this.widget_lng.get_value())
            ];
        },


        initialize_content: function() {
            // Gets called at each redraw of widget
            //  - switching between read-only mode and edit mode
            //  - BUT NOT when switching to next object.
            var self = this;
            this.edit_mode = !this.get('effective_readonly');

            // XXXvlab: couldn't we put this just after rendering ?
            this.$canvas = this.$el.find("div#gmap");
            this.$msg_empty = this.$el.find("p.msg_empty");

            this.widget_lat = this.view.fields.lat;
            this.widget_lng = this.view.fields.lng;

            try {
                $(document).ready(function () {
                    setTimeout(function() {
                        self.draw_map();
                    }, 1000);
                });

                this.$el.on('click', '.btn_get_coordinate', function () {
                    self.code_address();
                });
                this.$el.on('click', '.btn_refresh', function () {
                    self.draw_map();
                });
            } catch(e) {
                console.log(e);
            }

        },

        get_address_from_current_form: function () {
            var address = "";
            var form_fields = this.view.fields;
            return _(["zip", "street", "street2", "city",
                      "state_id", "country_id"])
                .chain()
                .map(function(field_label) {
                    var widget = form_fields[field_label];
                    return (typeof widget.get_displayed !== "undefined") ?
                        widget.get_displayed() : widget.get_value();
                })
                .filter(function (elt) {
                    return typeof elt !== "undefined" &&
                        elt !== false;
                })
                .value()
                .join(", ");
        },

        code_address: function () {
            var self = this;
            var address = this.get_address_from_current_form();
            var geocoder = new google.maps.Geocoder();

            geocoder.geocode({'address': address}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    self.set_lat_lng(results[0].geometry.location);
                } else {
                    alert("Geocode was not successful for the following reason: " +
                          status);
                }
            });
        },

        // Set lattitude and longitude widget content from google object
        set_lat_lng: function (obj) {
            this.widget_lat.$el.find('input').val(obj.lat());
            // will set value from dom AND set the form dirty
            this.widget_lat.store_dom_value();
            this.widget_lng.$el.find('input').val(obj.lng());
            // will set value from dom AND set the form dirty
            this.widget_lng.store_dom_value();
        },

        update_dom: function() {
            this._super.apply(this, arguments);
            this.draw_map();
        },

        draw_map: function () {
            var self = this;

            // Load google map api if necessary
            if (typeof(google) === "undefined" ||
                typeof(google.maps) === "undefined") {
                if (this.fetching_map_api === true) {
                    // console.log("inhibiting surnumerous call of drawmap");
                    return; // call already sent
                }
                this.fetching_map_api = true;
                window.ginit = function() { self.draw_map(); };
                $.getScript('//maps.googleapis.com/maps/api/js' +
                            '?sensor=false&async=true&callback=ginit');
                return;
            }

            var OPTIONS = {
                zoom: 16,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            try {

                var lat_lng = this.get_lat_lng();
                if (lat_lng[0] === 0 || isNaN(lat_lng[0]) || lat_lng[1] === 0 ||
                    isNaN(lat_lng[1])) {
                    this.$msg_empty.show();
                    this.$canvas.hide();
                    return;
                }

                var point = new google.maps.LatLng(lat_lng[0], lat_lng[1]);
                this.$msg_empty.hide();
                this.$canvas.show(500, function() {
                    // XXXvlab: cache this object !
                    var map = new google.maps.Map(self.$canvas[0], OPTIONS);
                    var marker = new google.maps.Marker({
                        'map': map,
                        'position': point,
                        'draggable': self.edit_mode
                    });
                    if (self.edit_mode)
                        google.maps.event.addListener(marker, "dragend", function() {
                            self.set_lat_lng(marker.getPosition());
                        });
                    map.setCenter(point);
                });
            } catch (e) {
                console.log(e);
            }
        }

    });

    instance.web.form.widgets = instance.web.form.widgets.extend({
        'gmap': 'openerp.web_google_map.form.FieldGoogleMap',
    });

};

