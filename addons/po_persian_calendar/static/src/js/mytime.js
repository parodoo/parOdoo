odoo.define('web.mytime', function (require) {
    "use strict";
    var core = require('web.core');
    var time = require('web.time');
    var session = require('web.session');
    var _t = core._t;
    /**
     * Returns the user prefered calendar code using user_context of
     * odoo session_info structure. 
     * The returned code is a single character:
     * '' or 'g': Gregorian Calendar (Default)
     * 'j' : Persian Calendar (Jalali)
     * 'h' : Hijri Calendar (Hijri)
     * @param {*} user_context 
     */
    time.getCalendar = function (user_context) {
        //return 'j';
        user_context = user_context ||
        ( ((typeof odoo == 'undefined' ? {} : odoo).session_info || {}).user_context );
        return user_context && typeof user_context.calendar === 'string'
            ? user_context.calendar.startsWith('j')?'j':''
            : user_context && user_context.lang=='fa_IR'
                ?'j'
                :core._t.database.parameters.code == 'fa_IR' ?
                    'j' :
                    '';
    }
    time.getUserDateFormat = function (user_context) {
        user_context = user_context ||
        ( ((typeof odoo == 'undefined' ? {} : odoo).session_info || {}).user_context );
        return user_context && typeof user_context.date_format === 'string'
            ? user_context.date_format
            :'';
    }

    time.fixPersianLocale = function () {

        //debugger;
        //var ggg = session;
        return typeof moment != 'undefined' && moment.fixPersian && moment.fixPersian()
    }
    time.fixTempusDominusBootstrap4 = function () {
        var proto = $ && $.fn &&
            $.fn['datetimepicker'] && $.fn['datetimepicker'].Constructor &&
            $.fn['datetimepicker'].Constructor.prototype;
        if (proto && !proto.$fixed) {
            console.warn("fixTempusDominusBootstrap4");
            proto.$fixed = true;
        }

    }
    time._getLangDateFormat = time.getLangDateFormat;
    time.getLangDateFormat = function () {
        time.fixPersianLocale();
        if (time.getCalendar()=='j'){
            switch(time.getUserDateFormat()){
                case 'YYYY/M/D':
                    return "jYYYY/jM/jD";
                default:
                    return "jYYYY/jMM/jDD";
            }
        }
        return time._getLangDateFormat()
    }
    time._getLangDatetimeFormat = time.getLangDatetimeFormat;
    time.getLangDatetimeFormat = function () {
        time.fixPersianLocale();
        if (time.getCalendar()=='j'){
            switch(time.getUserDateFormat()){
                case 'YYYY/M/D':
                    return "jYYYY/jM/jD HH:mm:ss";
                default:
                    return "jYYYY/jMM/jDD HH:mm:ss";
            }
        }
        return time._getLangDatetimeFormat()
    }

});

if (typeof odoo!='undefined' && odoo.session_info && odoo.session_info.user_context){

    odoo.session_info.user_context.getCalendar == function(){
        var user_context = ((typeof odoo == 'undefined' ? {} : odoo).session_info || {}).user_context;
        return time.getCalendar(user_context);
    }
    odoo.session_info.user_context.getUserDateFormat == function(){
        var user_context = ((typeof odoo == 'undefined' ? {} : odoo).session_info || {}).user_context;
        return time.getUserDateFormat(user_context);
    }
    odoo.getCalendar = function(){
        var user_context = ((typeof odoo == 'undefined' ? {} : odoo).session_info || {}).user_context;
        return time.getCalendar(user_context);
    }
    odoo.getUserDateFormat = function(){
        var user_context = ((typeof odoo == 'undefined' ? {} : odoo).session_info || {}).user_context;
        return time.getUserDateFormat(user_context);
    }

}