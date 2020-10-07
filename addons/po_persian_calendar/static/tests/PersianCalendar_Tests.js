odoo.define('po.persian_calendar_tests', function (require) {
    "use strict";

    var time = require('web.time');
    var testUtils = require('web.test_utils');
    var createView = testUtils.createView;

    QUnit.module('Persian Calendar', {
        beforeEach: function () {
            this.data = {
                'crm.team': {
                    fields: {
                        foo: {
                            string: "Foo",
                            type: 'char'
                        },
                        invoiced_target: {
                            string: "Invoiced_target",
                            type: 'integer'
                        },
                    },
                    records: [{
                        id: 1,
                        foo: "yop"
                    }, ],
                },
            };
        }
    });

    QUnit.test('time class is fixed', async function (assert) {

        assert.expect(2);
        assert.ok(typeof time.getCalendar === 'function', 'time.getCalendar exists');
        assert.ok(typeof time.getUserDateFormat === 'function', 'time.getUserDateFormat exists');

    });
    QUnit.test('jalali moment tests.', async function (assert) {

        assert.expect(4);
        var jy = 1399;
        var jm = 1;
        var jd = 1;
        var jdate = jy + "/" + jm + "/" + jd;
        var m = moment(jdate, 'jYYYY/jM/jD')
        assert.ok(m.year() === 2020, 'year() is okay.');
        assert.ok(m.jYear() === jy, 'jYear() is okay.');
        assert.ok(m.jMonth() === jm-1, 'jMonth() is okay.');
        assert.ok(m.jDate() === jd, 'jDate() is okay.');
    });

});