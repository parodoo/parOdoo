Release Note:
============
This package is still under development and cannot be used.

Persian Calendar
================
Provides Persian Calendar support in Odoo.
This is part of parOdoo. ParOdoo is meant to be a place for Odoo localization for Iran.
People around the world use different calendars. For instance here in Iran we use Persian Calendar (aka [Jalali](https://en.wikipedia.org/wiki/Jalali_calendar)). Unfortunately Odoo misses the concept calendar in its globalization model. Although users can select their prefered language, it is not possible to spceify a prefered calendar. This project aims at providing such a feaure at least for Persian Calendar.


Usage:
=====
This is still under development.

Technical Notes
===============
People around the world use different calendars. Odoo implementaion of DateTime data relies on [moment](https://github.com/moment/moment). Unfortunately `moment` lacks the concept of `Calendar`,  and its completely clueless to support calendars other than Gregorian, such as the Persian Calendar (also known as Jalali), that's being used in Iran.
To add multi-calendar support, without it being considered in the design of the system, is often a tricky task. 

## Implementation
First of all we need to bring 'Persian Calendar' support to Moment. We will use [moment-jalali](https://github.com/jalaali/moment-jalaali) which is the Jalaali (Jalali, Persian, Khorshidi, Shamsi) calendar system plugin for moment.js. The plugin will be inserted in web assets with a template like this:

```xml
<odoo>
    <data>
        <template id="persian_calendar" inherit_id="web.assets_common">
            <xpath expr="//script[@src='/web/static/lib/moment/moment.js']" position="after">
            	<script type="text/javascript" src="/po_persian_calendar/static/src/js/moment-jalaali.js"></script>
            </xpath>
        </template>
    </data>
</odoo>
```


## 'moment-jalai' Bugs
Unfortunatly we dicovered some bugs and issues in momen-jalali which should be fixed so that it can work in Odoo date-picker.
The first issue is in this 'makeDateFromStringAndArray' function. The 'fields_utils.parse' method will send a set of formats to moment, while trying to format date, as can be noted in the code snippet below one of them is actually a function, namely 'moment.ISO_8601'
```js
function parseDate(value, field, options) {
    if (!value) {
        return false;
    }
    var datePattern = time.getLangDateFormat();
    var datePatternWoZero = datePattern.replace('MM','M').replace('DD','D');
    var date;
    if (options && options.isUTC) {
        date = moment.utc(value);
    } else {
        date = moment.utc(value, [datePattern, datePatternWoZero, moment.ISO_8601]);
    }
    if (date.isValid()) {
        if (date.year() === 0) {
            date.year(moment.utc().year());
        }
        if (date.year() >= 1900) {
            date.toJSON = function () {
                return this.clone().locale('en').format('YYYY-MM-DD');
            };
            return date;
        }
    }
    throw new Error(_.str.sprintf(core._t("'%s' is not a correct date"), value));
}

```

This has not been considered in 

```js
      for (i = 0; i < len; i += 1) {
        /// Babak
        /// format can be a function!
        /// format = config._f[i]
        format = typeof config._f[i]=='function'? config._f[i]():config._f[i];
        currentScore = 0
        tempMoment = makeMoment(config._i, format, config._l, config._strict, utc)

```

We also changed code in 'makeDateFromStringAndFormat' for the same issue.

```js
    function makeDateFromStringAndFormat(config) {

        var __f = typeof config._f ==='function'?config._f():config._f;
        var tokens = __f.match(formattingTokens)
            , string = config._i + ''
            , len = tokens.length
            , i
            , token
            , parsedInput
```

Also at the end of 'makeMoment' function, the date is checked against a max value. Because Odoo date-picker uses a maxDate above this value (9999/11/30). This will result of an invalid maxDate which causes an unexpected issue. We just simply removed this:

```js
 if (m._d.getTime() > maxTimestamp) {
        //jm._isValid = false
      }
```

## HttpExtensions
The prefered calendar should be considerd as a user preference , that is the user should be able to select her prefered calendar as one of her prefernces. We will use the recommended method (see (Odoo JavaScript Session)[https://www.odoo.com/documentation/13.0/reference/javascript_reference.html#session]) of transering this sort of settings to the client side using the 'user_context':

```py
class HttpExtensions(Http):
    _inherit = 'ir.http'

    def session_info(self):
        result = super(HttpExtensions, self).session_info()
        if result and result.get("user_context",False):
            user_context = result.get("user_context")
            user = self.env.user
            # Currently we use the selected language.
            # TODO: Add calendar to user preferences and
            # use it here.
            if user and user.lang=='fa_IR':
                user_context['calendar']='jalali'
        return result
```
Then the client side can retreive the selected calendar:

```js
    var session = require('web.session');
    var calendar = session.user_context.calendar;
    /// or using odoo global variable:
    var calendar = odoo.session_info.user_context.calendar
```
## TempusDominus.js
[Tempus Dominus Bootstrap 4](https://github.com/tempusdominus/bootstrap-4) (for gods sake! what's that name!!!) is a datepiker component for Boostrap. Odoo uses this control as it's datepicker widget. Tempus uses `jQuery` and `moment.js` in its core and just like `moment` does not include any national calendar in it's design. Theredore touches here and there is required for user calendar support. These include rendering functions that displays the datepikcer and also parsing methods that return the selected day. But first of all we need to add sort of congiutaion option, so that the user can specify the `calendar` to be used. 



