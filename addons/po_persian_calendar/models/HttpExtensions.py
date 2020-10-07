
from ..globals import models, Http

class HttpExtensions(Http):
    _inherit = 'ir.http'
    def session_info(self):
        
        result = super(HttpExtensions, self).session_info()
        if result and result.get("user_context",False):
            user_context = result.get("user_context")
            user = self.env.user
            # calendar = user.date_calendar
            # if calendar == 'auto':
            #     calendar = 'jajali' if user.lang=='fa_IR' else 'geregorian'
            user_context['calendar'] = user.calendar
            user_context['date_format'] = user.date_format
            #if user and user.lang=='fa_IR':
            #    user_context['calendar']='jalali'
        # result['some_key'] = get_some_value_from_db()
        return result

