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

from openobject.widgets import JSLink, CSSLink
from openerp.widgets import TinyInputWidget, register_widget


class GMapWidget(TinyInputWidget):
    template = 'web_google_map/widgets/templates/gmap.mako'
    css = [CSSLink('web_google_map', 'css/gmap.css')]
    javascript = [JSLink('web_google_map', 'javascript/gmap.js')]

    def __init__(self, *args, **kwargs):
        super(GMapWidget, self).__init__(*args, **kwargs)
        self.nolabel = True

register_widget(GMapWidget, ['gmap'])
