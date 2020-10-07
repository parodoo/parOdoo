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
The prefered calendar should be considerd as a user preference , that is the user should be able to select her prefered calendar as one of her prefernces. We will use the Odoo recommended method (see [Odoo JavaScript Session](https://www.odoo.com/documentation/13.0/reference/javascript_reference.html#session) of transfering this sort of settings to the client side using the 'user_context':

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
[Tempus Dominus Bootstrap 4](https://github.com/tempusdominus/bootstrap-4) (for gods sake! what's that name!!!) is a datepiker component for Boostrap. Odoo uses this control as it's datepicker widget. Tempus uses `jQuery` and `moment.js` in its core and just like `moment` does not include any national calendar in it's design. Theredore touches here and there is required for user calendar support. These include rendering functions that displays the datepikcer and also parsing methods that return the selected day. But first of all we need to add sort of congiutaion option, so that the user can specify the `calendar` to be used, this is done in `getCalendar`:
```js
/**
         * parOdoo fixup: 
         * Returns the calendar to be used. This is a single character such as
         * '' or 'g' for Gregorian. 'j' for Persian (jalali) etc...
         * 
         * 
         */
        TempusDominusBootstrap4.prototype.getCalendar = function(){

            /// Within odoo environment we may use user_context.getCalendar
            var user_context = ((typeof odoo=='undefined'?{}:odoo).session_info ||{}).user_context;
            if (user_context && typeof user_context.getCalendar==='function')
            {
                return user_context.getCalendar();
            }
            // Otherwise if 'calendar' is present on 'options' return it
            // if not, return jalali calendar if locale is fa.
            return (this._options || {}).calendar || (moment.locale()=='fa'?'j':'');
        }
```
Then there are `_fill...` methods such as `_fillDate` which are the actual rendering methods that fill control with appropriate elements, for instance this is where day numbers is written on the datepicker control:
```js
                // parOdoo fixup:
                // Replacing follwoing line for calendar support:
                //row.append('<td data-action="selectDay" data-day="' + currentDate.format('L') +
                //  '"    class="day' + clsName + '">' + currentDate.date() + '</td>');
                var _d = this.getCalendar()+"D";
                // Note that formatting with 'jD' will result in days in Persian Calendar.
                // also we added the data-date attribute which become handy in click events
                // where we need to calculate the selected date. see _doAction.
                row.append('<td data-action="selectDay" data-day="' + 
                    currentDate.format('L') +'" data-date="'+currentDate.format("YYYY-MM-DD") +'" class="day' + clsName + '">' + currentDate.format(_d) + '</td>');
                currentDate.add(1, 'd');

```
Then id is this `doAction` method that performs various actions upon user actions, such as `select month`,`select date`, .... This method is fixed to do the right action, e.g. select correct date, according to the selected caledar, for instance when user clicks on a month:
```js
                case 'selectMonth':
                    {

                        var month = $(e.target).closest('tbody').find('span').index($(e.target));
                        /// parOdoo fixup
                        /// if calendar is jalali use jMonth
                        if (this.getCalendar()=='j' && typeof this._viewDate.jMonth=='function')
                        {
                            this._viewDate.jMonth(month);
                        }
                        else
                        {
                            this._viewDate.month(month);
                        }

```

This is the list of modifications in TempusDominus: (see `tempusdominys_fixed.js` for details)
* getCalendar() : Added to get the user prefered calendar.
* _doAction() : Modified to correctly perform user actions according to prefered calendar.
* _fillMonth(): Modified to fill month based on calendar.
* _updateMonths(): Modified to show the active month based on calendar.
* _updateYears() : To show correct years based on calendar.
* _fillDate() : To show correct view of days in month based on calendar.


