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

from osv import osv
from osv import fields


class res_partner_address(osv.osv):

    _name = 'res.partner.address'
    _inherit = 'res.partner.address'

    _columns = {
        'lat': fields.float(u'Latitude', digits=(9, 6)),
        'lng': fields.float(u'Longitude', digits=(9, 6)),
        'map': fields.dummy(),
    }

res_partner_address()




## XXXvlab: monkey patching html_template

from web.controllers import main


main.html_template = """<!DOCTYPE html>
<html style="height: 100%%">
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
        <meta http-equiv="content-type" content="text/html; charset=utf-8" />
        <title>OpenERP</title>
        <link rel="shortcut icon" href="/web/static/src/img/favicon.ico" type="image/x-icon"/>
        
        %(css)s
        <script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?sensor=false"></script>
        %(js)s
        <script type="text/javascript">
            $(function() {
                var s = new openerp.init(%(modules)s);
                %(init)s
            });
        </script>
    </head>
    <body class="openerp" id="oe"></body>
</html>
"""

