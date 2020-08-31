
from ..globals import models, Http




class HttpExtensions(Http):
    _inherit = 'ir.http'

    def session_info(self):
        result = super(HttpExtensions, self).session_info()
        if result and result.get("user_context",False):
            user_context = result.get("user_context")
            user = self.env.user
            if user and user.lang=='fa_IR':
                user_context['calendar']='jalali'
        # result['some_key'] = get_some_value_from_db()
        return result

