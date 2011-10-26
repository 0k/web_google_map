# -*- coding: utf-8 -*-

##############################################################################
#
#    Authors: Boris Timokhin, Dmitry Zhuravlev-Nevsky. Copyright InfoSreda LLC
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.
#
#    You should have received a copy of the GNU General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################

{
    'name': 'Web Map',
    'version': '0.3.3',
    'category': 'Added functionality / Widgets',
    'description': """
InfoSreda OpenERP Web Map
=========================
Web Map module brings Google Map support right into OpenERP web-client.

Usage
=====
After installation, all "res.partner.address" and "res.partner" views will be extended with neatly map.

Just type in an address and press "Get coordinates" button. Google Geocoder will populate latitude and longitude fields. Map marker will be set accordingly to them.

Not happy with geocoding result? Update latitude and longitude as simply as dragging marker over Google Map widget.

Save your data and enjoy.

So, you are a module developer
==============================
Good news! In case you want to add Google Map support for your own module, all you need to do is just put the next string to the view.

::

    <field name="map" widget="gmap" />

If you want to use custom model address instead of "res.partner.address" model, please modify gmap.js source file selectors.
""",
    'author': 'Infosreda LLC',
    'website': 'http://www.infosreda.com/',
    'depends': ['base'],
    'init_xml': ['gmap_view.xml'],
    'update_xml': [],
    'installable': True,
    'active': False,
    'web': True,
    'images': ['images/map.png',],
}
