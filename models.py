# -*- coding: utf-8 -*-

from openerp.osv import osv, fields


class res_partner(osv.osv):

    _name = 'res.partner'
    _inherit = 'res.partner'

    _columns = {
        'lat': fields.float(u'Latitude', digits=(9, 6)),
        'lng': fields.float(u'Longitude', digits=(9, 6)),
        'map': fields.dummy(),
    }
