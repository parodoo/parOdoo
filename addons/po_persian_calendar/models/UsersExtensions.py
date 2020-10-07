
from ..globals import fields,api,Users
class UsersExtensions(Users):
    _inherit="res.users"
    calendar = fields.Selection([
        ('gregorian', 'Gregorian Calendar'),
        ('jalali','Jalali (Persian) Calendar')],
        default='gregorian')
    date_format = fields.Selection([
        ('YYYY/MM/DD','1399/01/01'),
        ('YYYY/M/D','1399/1/1')],default="YYYY/MM/DD")
