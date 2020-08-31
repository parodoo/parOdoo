from odoo import models, fields, api
from typing import TYPE_CHECKING, Any, List, Dict
import logging
#from .models.parnian_translation_branch import ParnianTranslationBranch
if TYPE_CHECKING:
    from odoo.addons.base.models.res_partner import Partner
    from odoo.addons.base.models.ir_http import IrHttp
    from odoo.addons.web.models.ir_http import Http
else:
    Partner = models.Model
    IrHttp = models.AbstractModel
    Http = models.AbstractModel


