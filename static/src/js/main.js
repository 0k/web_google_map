/*global: _,openerp,document,setTimeout,alert */

openerp.web_google_map = function(instance) {

    var QWeb = instance.web.qweb,
        _t  = instance.web._t,
        _lt = instance.web._lt;

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

    // GET JQUERY UI MAP

    // XXXvlab: should implement a full lib of dynamic js loading.
    function ensure_jquery_ui_map_loaded() {
        if (typeof(instance.jquery_ui_map_loaded) !== "undefined") {
            // please wait until the first call finishes:
            return instance.jquery_ui_map_loaded;
        }

        instance.jquery_ui_map_loaded = $.Deferred();
        console.log('Loading jquery.ui.map.js');
        $.getScript('/web_google_map/static/lib/js/jquery.ui.map.js',
                    function() {
                        instance.jquery_ui_map_loaded.resolve();
                    });
        return instance.jquery_ui_map_loaded;
    }


    // GEOCODING SERVICE

    // This is set to be global to share the cache across one openerp instance
    // of a client. Please bear in mind that a simple reload of the browser page
    // clears it.
    var _geocoding_cache = {};


    /**
     * Converts google position object to {'lat': X, 'lng': Y} format.
     */
    function _position_to_location(gpos) {
        return {
            'lat': gpos.lat(),
            'lng': gpos.lng()
        };
    }

    /**
     * Return a $.Def location object from a place (single string address)
     *
     * This function will handle a geocoding cache that will retry refused
     * queries.
     */
    function geocode_place(place) {
        var def = $.Deferred();

        var _geocoding_handle_response = function (results, status, deferred) {
            if (status == google.maps.GeocoderStatus.OK) {
                // We only need the latitude and longitude
                var gloc = results[0].geometry.location;
                def.resolve(_position_to_location(gloc));
            } else {
                console.log("Place '"+ place + "' could not be resolved for the following reason: " +
                            status);
                deferred.reject(status);
            }
        };

        if (place in _geocoding_cache &&
            _geocoding_cache[place].status != "OVER_QUERY_LIMIT") {
            setTimeout(function() {
                var args = _geocoding_cache[place];
                //console.log("cached " + place);
                _geocoding_handle_response(args.results, args.status, def);
            }, 0);
        } else {
            // console.log("not cached" + place);
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({'address': place}, function(results, status) {
                _geocoding_cache[place] = {'results': results,
                                           'status': status};
                _geocoding_handle_response(results, status, def);
            });
        }
        return def;
    }

    /**
     * Returns a single string from given record
     */
    function get_place_from_record(record) {
        return _(["zip", "street", "street2", "city",
                  "state_id", "country_id"])
            .chain()
            .map(function(field_label) {
                return record[field_label];
            })
            .filter(function (elt) {
                return typeof elt !== "undefined" &&
                    elt !== false;
            })
            .map(function(address_element) {
                // removing comma's in adress elements
                return address_element.replace(/,/g, " ");
            })
            .value()
            .join(", ");
    }
    /**
     * Adds a marker to existing google map by location object.
     */
    function _add_marker_by_location($gmap, location, options) {
        options = options || {};
        var gpos = new google.maps.LatLng(location.lat, location.lng);
        $.extend(options, {
            position: gpos
        });
        $gmap.gmap('addBounds', gpos);
        return $gmap.gmap('addMarker', options);
    }

    /**
     * Adds a marker to existing google map by place (a single string address)
     * This includes geocoding the address.
     */
    function _add_marker_by_place ($gmap, place, options) {
        var def = $.Deferred();
        geocode_place(place).then(function (location) {
            marker = _add_marker_by_location($gmap, location, options);
            def.resolve(marker);
        });
        return def.promise();
    }

    /**
     * Return a $.Def for a location object from a given address record
     */
    function geocode_address_record(record) {
        var place = get_place_from_record(record);
        return geocode_place(place);
    }

    /**
     * Returns a float from an unspecified typed value.
     */
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


    /**
     *  Form Field widget
     *
     */


    instance.web_google_map.form = {};


    /**
     * Geocodes the adress to put it in ``lat`` and ``lng`` fields
     * and shows it on a map.
     */
    instance.web_google_map.form.FieldGoogleMap = instance.web.form.AbstractField.extend(instance.web.form.ReinitializeFieldMixin, {
        template: 'GoogleMap',

        init: function (view, node) {
            this._super(view, node);
        },

        destroy_content: function () {
        },

        /**
         * Return current geocoded record from field widgets.
         */
        get_location: function() {
            return {
                'lat': getFixedValue(this.widget_lat.get_value()),
                'lng': getFixedValue(this.widget_lng.get_value()),
            };
        },

        /**
         * Set lattitude and longitude widget content from a geocoded record
         */
        set_location: function (record) {
            this.widget_lat.$el.find('input').val(record.lat);
            // will set value from dom AND set the form dirty
            this.widget_lat.store_dom_value();
            this.widget_lng.$el.find('input').val(record.lng);
            // will set value from dom AND set the form dirty
            this.widget_lng.store_dom_value();
        },

        /**
         * Returns a single string from widget values of ``zip``, ``street``, ...
         */
        get_record: function () {
            var form_fields = this.view.fields;
            var record = {};
            _(["zip", "street", "street2", "city",
                      "state_id", "country_id"])
                .each(function(field_label) {
                    var widget = form_fields[field_label];
                    record[field_label] =
                        (typeof widget.get_displayed !== "undefined") ?
                        widget.get_displayed() : widget.get_value();
                });
            return record;
        },

        initialize_content: function() {
            // Gets called at each redraw of widget
            //  - switching between read-only mode and edit mode
            //  - BUT NOT when switching to next object.
            var self = this;
            this.edit_mode = !this.get('effective_readonly');

            this.$canvas = this.$el.find("div.oe_web_google_map.map");
            this.$msg_empty = this.$el.find("p.msg_empty");

            this.widget_lat = this.view.fields.lat;
            this.widget_lng = this.view.fields.lng;


            // In forms, we could be hidden in a notebook. Thus we couldn't
            // render correctly maps so we try to detect when we are not
            // visible to wait for when we will be visible.
            if (this.$canvas[0].offsetWidth === 0) {
                // In forms, we could be hidden in a notebook. Thus we couldn't
                // render correctly maps so we try to detect when we are not
                // visible to wait for when we will be visible.
                if (self.$canvas[0].offsetWidth === 0) {
                    self.$canvas.parents(".ui-tabs").on('tabsactivate', self, function() {
                        if (self.$canvas[0].offsetWidth !== 0) { // visible
                            self.draw_map();
                        }
                    });
                }
            }
            $(document).ready(function () {
                // Without this timeout, the google map window doesn't
                // take all the frame size for some reason.
                setTimeout(function() {
                    console.log("Draw map by timeout");
                    self.draw_map();
                }, 1000);
            });


            this.$el.on('click', '.btn_get_coordinate', function () {
                var record = self.get_record();
                geocode_address_record(record).then(function (location) {
                    self.set_location(location);
                    self.draw_map();
                });
            });
            this.$el.on('click', '.btn_refresh', function () {
                self.draw_map();
            });

        },

        update_dom: function() {
            debugger;
            this._super.apply(this, arguments);
            this.draw_map();
        },

        render_value: function() {
            // Gets called at each redraw/save of widget
            //  - switching between read-only mode and edit mode
            //  - when switching to next object.
            this.draw_map();
        },

        google_ensure_map_loaded: function() {
            return google_ensure_module_loaded("maps", "3", {
                // Thanks: http://stackoverflow.com/questions/5296115/can-you-load-google-maps-api-v3-via-google-ajax-api-loader
                other_params: "sensor=false",
                async: 'true'});
        },

        draw_map: function () {
            var self = this;
            this.google_ensure_map_loaded().then(function() {

                var OPTIONS = {
                    zoom: 16,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };

                try {
                    var location = self.get_location();
                    if (location.lat === 0 || isNaN(location.lat) ||
                        location.lng === 0 || isNaN(location.lng)) {
                        self.$msg_empty.show();
                        self.$canvas.hide();
                        return;
                    }

                    var point = new google.maps.LatLng(location.lat, location.lng);
                    self.$msg_empty.hide();
                    self.$canvas.show(500, function() {
                        var map = new google.maps.Map(self.$canvas[0], OPTIONS);
                        var marker = new google.maps.Marker({
                            'map': map,
                            'position': point,
                            'draggable': self.edit_mode
                        });
                        if (self.edit_mode)
                            google.maps.event.addListener(marker, "dragend", function() {
                                var location = _position_to_location(marker.getPosition());
                                self.set_location(location);
                            });
                        map.setCenter(point);
                    });
                } catch (e) {
                    console.log(e);
                }
            });
        }
    });


    /**
     * Shows a map with all records mapped along their ``lat`` and ``lng`` fields.
     */
    instance.web_google_map.form.FieldO2MGoogleMap = instance.web.form.AbstractField.extend(instance.web.form.ReinitializeFieldMixin, {
        template: 'FieldO2MGoogleMap',

        get_google_map_options: function() {
            return {
              zoom: 16,
              mapTypeId: google.maps.MapTypeId.ROADMAP,
            };
        },

        is_record_geocoded: function(record) {
            return typeof(record['lat']) !== "undefined" &&
                typeof(record['lng']) !== "undefined";
        },

        get_location_from_record: function(record) {
            return {
                'lat': record['lat'],
                'lng': record['lng'],
            };
        },

        /**
         * Adds a marker to existing google map for given record
         * The record will be queried to see if it contains already
         * some geocoding information.
         */
        add_marker: function (record, options) {
            if (this.is_record_geocoded(record)) {
                var location = this.get_location_from_record(record);
                return $.when(
                    _add_marker_by_location(this.$gmap, location, options));
            } else {
                var place = get_place_from_record(record);
                // This includes geocoding the address
                return _add_marker_by_place(this.$gmap, place, options);
            }
        },

        set_value: function(value_) {
            this._super(value_);
          },

        get_value: function() {
            return this.get('value');
        },

        init: function () {
            this._super.apply(this, arguments);
            this.gmap = null;
        },

        destroy_content: function () {
            if (typeof(this.$gmap.gmap) !== "undefined") {
                this.$gmap.gmap("destroy");
            }
        },

        google_ensure_map_loaded: function() {
            return google_ensure_module_loaded("maps", "3", {
                // Thanks: http://stackoverflow.com/questions/5296115/can-you-load-google-maps-api-v3-via-google-ajax-api-loader
                other_params: "sensor=false",
                async: 'true'});
        },

        initialize_content: function() {
            // Gets called at each redraw of widget
            //  - switching between read-only mode and edit mode
            //  - BUT NOT when switching to next object.
            this.edit_mode = !this.get('effective_readonly');

            this.$gmap = this.$el.find("div.oe_web_google_map.map");
            this.$msg_empty = this.$el.find("p.msg_empty");
            this.initialize_map();
        },

        // XXXvlab: obsolete code ? or not usefull until write mode is implemented ?
        // update_dom: function() {
        //     this._super.apply(this, arguments);
        //     debugger;
        //     this.draw_map();
        // },

        initialize_map: function () {
            var self = this;
            this.$gmap.show();
            // should implement a javascript loading and dependency system
            this.google_ensure_map_loaded().then(function() {
                ensure_jquery_ui_map_loaded().then(function() {

                    // In forms, we could be hidden in a notebook. Thus we couldn't
                    // render correctly maps so we try to detect when we are not
                    // visible to wait for when we will be visible.
                    if (self.$gmap[0].offsetWidth === 0) {
                        self.$gmap.parents(".ui-tabs").on('tabsactivate', self, function() {
                            if (self.$gmap[0].offsetWidth !== 0) { // visible
                                self.draw_map();
                            }
                        });
                    }
                    $(document).ready(function () {
                        // Without this timeout, the google map window doesn't
                        // take all the frame size for some reason.
                        setTimeout(function() {
                            console.log("Draw map by timeout");
                            self.draw_map();
                        }, 1000);
                    });
                });
            });

        },

        draw_map: function () {
            if (this.$gmap[0].offsetWidth === 0) { // visible
                console.log("prevented drawing map on non-sized div");
                return;
            }
            console.log('Creating map');
            this.gmap = this.$gmap.gmap(
                this.get_google_map_options());
            this.set_markers();
        },


        clear_map: function() {
            this.$gmap.gmap('clear', 'bounds');
            this.$gmap.gmap('set', 'bounds', new google.maps.LatLngBounds());
            this.$gmap.gmap('clear', 'markers');
            this.$gmap.gmap('clear', 'services');
            this.$gmap.gmap('clear', 'overlays', true);
        },

        render_value: function() {
            // Gets called at each redraw/save of widget
            //  - switching between read-only mode and edit mode
            //  - when switching to next object.
            this.initialize_map();
        },

        set_markers: function () {
            var self = this;
            var datarecords = (typeof this.get_value() !== "object") ? $.when() :
                (new instance.web.Model(this.view.fields_view.fields[this.name].relation))
                .call('read', [this.get_value(), false],
                      {context: this.view.dataset.context});

            $.when(datarecords).then(function(records) {
                if (records && records.length) {
                    self.$msg_empty.hide();
                    self.$gmap.show(500, function() {
                        self.clear_map();
                        _(records).each(function(record) {
                            self.add_marker(record).then(function(marker) {
                                marker.click(function() {
                                    var content = QWeb.render("GoogleMapInfoContent",
                                                              {'record': record,
                                                               'marker': marker});

                                    self.$gmap.gmap(
                                        'openInfoWindow',
                                        {'content': content}, this);
                                });
                            });
                        });
                    });
                } else {
                    self.$msg_empty.show();
                    self.$gmap.hide(500);
                }
            });
        }

    });

    instance.web.form.widgets = instance.web.form.widgets.extend({
        'm2m_gmap': 'openerp.web_google_map.form.FieldO2MGoogleMap',
        'o2m_gmap': 'openerp.web_google_map.form.FieldO2MGoogleMap',
        'gmap': 'openerp.web_google_map.form.FieldGoogleMap',
    });

};

