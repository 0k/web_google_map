# -*- coding: utf-8 -*-

{
    'name': 'Web Google Map',
    'version': '0.5.0',
    'category': 'Added functionality / Widgets',
    'description': """


OpenERP Web Map
===============

Web Map module brings Google Map support right into OpenERP web-client.

Version for 6.0 was brought by Infosreda LLC.

Conversion to 6.1 needed a full rewrite from simplee.fr and was funded
by CARIF/OREF.

Version 7.0 needed adaptation from 0k.io and was funded by CARIF/OREF.

Usage
=====

After installation, all "res.partner" views will be extended with neatly map.

Just type in an address and press "Get coordinates" button. Google Geocoder
will populate latitude and longitude fields. Map marker will be set
accordingly to them.

Not happy with geocoding result? Update latitude and longitude as simply as
dragging marker over Google Map widget.

Save your data and enjoy.

So, you are a module developer
==============================

Good news! In case you want to add Google Map support for your own module, all
you need to do is just put the next string to the view.

::

    <field name="map" widget="gmap" />


""",
    'author': 'simplee.fr - Infosreda LLC',
    'website': 'http://github.com/0k/web_google_map',
    'depends': ['base', 'web'],
    'data': [
        'views/template.xml',
        'views/gmap_view.xml',
    ],
    'update_xml': [],
    'active': True,
    'web': True,
    'qweb': ['static/src/xml/base.xml', ],
    'images': ['images/map.png', ],
}
