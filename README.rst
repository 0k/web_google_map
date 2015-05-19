==============
web_google_map
==============

This is an Odoo/OpenERP module that brings Google Map support.


Compatibility
=============

This repository provides branches and compatibility for each major
version of OpenERP/Odoo (6.0, 6.1, 7.0, 8.0).


Usage
=====

After installation, all ``res.partner`` views will be extended with neatly map.

Just type in an address and press ``Get coordinates`` button. Google Geocoder
will populate latitude and longitude fields. Map marker will be set
accordingly to them.

Not happy with geocoding results ? Update latitude and longitude as simply as
dragging marker over Google Map widget.

Save your data and enjoy.


So, you are a module developer
==============================

Good news! In case you want to add Google Map support for your own module, all
you need to do is just put the next string to the view.

::

    <field name="map" widget="gmap" />


Acknowledgements
================

Version for 6.0 was brought by Infosreda LLC.

Conversion to 6.1 needed a full rewrite from simplee.fr and was funded
by CARIF/OREF.

Version 7.0 needed adaptation from 0k.io and was funded by CARIF/OREF.

Version 8.0 needed code compatibility from sudokeys.
