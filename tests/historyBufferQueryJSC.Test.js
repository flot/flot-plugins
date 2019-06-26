describe('HistoryBufferNumeric Query QuickCheck', function () {
    'use strict';

    it('should give the same answer when using the queries vs toDataSeries with step 1', function () {
        var hbSize = 100;
        var hb;

        var property = jsc.forall(shrinkableLongArrayGenerator(jsc.number()), function (array) {
            hb = new HistoryBufferNumeric(hbSize);

            for (var i = 0; i < array.length; i++) {
                hb.push(array[i]);
            }

            var toDataSeries = hb.toDataSeries().reduce(function(arr, pair) {
                return arr.concat(pair);
            }, [])
            var query = hb.query(0, hb.count, 1);

            return JSON.stringify(toDataSeries) === JSON.stringify(query);
        });

        expect(property).toHold({
            size: 2 * hbSize
        });
    });

    it('should give the same answer when using random data to query and toDataSeries with step 10', function () {
        var hbSize = 200;
        var hb;
        var step = 10;

        var property = jsc.forall(shrinkableLongArrayGenerator(jsc.number()), function (array) {
            hb = new HistoryBufferNumeric(hbSize);
            hb.setBranchingFactor(4);

            for (var i = 0; i < array.length; i++) {
                hb.push(array[i]);
            }

            var decimatedRes = decimateRawData(hb, step);
            var query = hb.query(0, hb.count, step);

            return JSON.stringify(decimatedRes) === JSON.stringify(query);
        });

        expect(property).toHold({
            size: 2 * hbSize,
            tests: 200
        });
    });

    function decimateRawData(hb, step) {
        var toDataSeries = hb.toDataSeries();
        var decimatedRes = [];

        for (var i = 0; i < toDataSeries.length; i += step) {
            var section = toDataSeries.slice(i, i + step);

            section.sort(function (a, b) {
                return a[1] - b[1];
            }); // sort by data

            section.splice(1, section.length - 2); // remove everything except min and max

            section.sort(function (a, b) {
                return a[0] - b[0];
            }); // sort by index

            section.forEach(function (s) {
                decimatedRes = decimatedRes.concat(s);
            });
        }

        return decimatedRes;
    }

    /*custom shrinkable input generator for arb arrays*/
    var sLongArrayGenerator = function (arb) {
        return {
            generator: function (size) {
                var arrsize = jsc.random(0, size);
                var arr = new Array(arrsize);
                for (var i = 0; i < arrsize; i++) {
                    arr[i] = arb.generator(size);
                }
                return arr;
            },
            shrink: jsc.array(arb).shrink,
            show: jsc.array(arb).show
        };
    };

    var shrinkableLongArrayGenerator = function (arb) {
        return jsc.bless(sLongArrayGenerator(arb));
    };
});
