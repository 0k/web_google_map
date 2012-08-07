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


def insert_before(source, search, insert_string):
    idx = source.find(search)
    return "%s%s%s" % (source[:idx], insert_string, source[idx:])


def insert_js(src):
    js_decl = '<script type="text/javascript" src="%s"></script>\n        ' % src
    main.html_template = insert_before(main.html_template, '%(js)', js_decl)


insert_js('//maps.googleapis.com/maps/api/js?sensor=false')
