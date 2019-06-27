describe('A HistoryBuffer', function () {
    'use strict';

    it('has a query method', function () {
        var hb = new HistoryBuffer(10);

        expect(hb.query).toEqual(jasmine.any(Function));
    });

    it('has a rangeX method', function () {
        var hb = new HistoryBuffer(10);

        expect(hb.rangeX).toEqual(jasmine.any(Function));
    });

    it('has a rangeY method', function () {
        var hb = new HistoryBuffer(10);

        expect(hb.rangeY).toEqual(jasmine.any(Function));
    });

    it('has basic query capabilities', function () {
        var hb = new HistoryBuffer(10);

        hb.push(5);

        expect(hb.query(0, 1, 1)).toEqual([0, 5]);
    });

    it('has basic rangeX capabilities', function () {
        var hb = new HistoryBuffer(10);

        hb.appendArray([2, 5, 4, 6]);

        expect(hb.rangeX(0)).toEqual({xmin:0, xmax: 3, deltamin: 1});
    });

    it('has basic rangeY capabilities', function () {
        var hb = new HistoryBuffer(10);

        hb.appendArray([2, 5, 4, 6]);

        expect(hb.rangeY(1,2,0)).toEqual({ymin: 4, ymax: 5});
    });

    it('works with empty parameters for rangeY', function () {
        var hb = new HistoryBuffer(10);

        hb.appendArray([2, 5, 4, 6]);

        expect(hb.rangeY(null, null, null)).toEqual({ymin: 2, ymax: 6});
    });

    it('rangeY ignores NaN, null and undefined values', function () {
        var hb = new HistoryBuffer(10);

        hb.appendArray([2, 5, null, NaN, undefined, 4, 6]);

        expect(hb.rangeY(0, 10, 0)).toEqual({ymin: 2, ymax: 6});
    });

    it('has basic query capabilities for buffers with multiple data series', function () {
        var hb = new HistoryBuffer(10, 2);

        hb.push([5, 6]);

        expect(hb.query(0, 1, 1, 0)).toEqual([0, 5]);
        expect(hb.query(0, 1, 1, 1)).toEqual([0, 6]);
    });

    it('has basic query capabilities for buffers with multiple data series', function () {
        var hb = new HistoryBuffer(10, 2);

        hb.push([5, 6]);
        hb.push([15, 16]);

        expect(hb.rangeX(0)).toEqual({xmin:0, xmax: 1, deltamin: 1});
        expect(hb.rangeX(1)).toEqual({xmin:0, xmax: 1, deltamin: 1});
    });

    it('returns empty data series when querying an empty history Buffer', function () {
        var hb = new HistoryBuffer(10);

        expect(hb.query(0, 10, 1)).toEqual([]);
    });

    it('returns empty range when querying an empty history Buffer', function () {
        var hb = new HistoryBuffer(10);

        expect(hb.rangeX()).toEqual({});
    });

    it('returns empty data series when querying outside of the bounds', function () {
        var hb = new HistoryBuffer(10);

        hb.appendArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

        expect(hb.query(12, 13, 1)).toEqual([]);
        expect(hb.query(0, 1, 1)).toEqual([]);
    });

    it('returns proper data series after the buffer has slid', function () {
        var hb = new HistoryBuffer(10);

        hb.appendArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

        expect(hb.query(10, 10, 1)).toEqual([10, 10]);
        expect(hb.query(0, 2, 1)).toEqual([2, 2]);
    });

    it('returns a decimated data series for big buffers', function () {
        var size = 32768;
        var hb = new HistoryBuffer(size);

        for (var i = 0; i < size; i++) {
            hb.push(i);
        }

        var res = hb.query(0, 32768, 64);
        expect(res.length).toBeGreaterThan(1023);
        expect(res.length).not.toBeGreaterThan(2048);
        expect(res.slice(0, 4)).toEqual([0, 0, 63, 63]);
        expect(indexesAreInAscendingOrder(res)).toBe(true);
    });

    it('returns a correctly decimated data series for steps not multiple of 32', function () {
        var size = 32768;
        var hb = new HistoryBuffer(size);

        for (var i = 0; i < size; i++) {
            hb.push(i);
        }

        var res = hb.query(0, 32768, 99);
        expect(res.slice(0, 4)).toEqual([0, 0, 98, 98]);
        expect(indexesAreInAscendingOrder(res)).toBe(true);
    });

    it('gives the same answer when using the queries vs toDataSeries with step 10', function () {
        var hbSize = 200;
        var hb;
        var step = 10;
        var arr = [-221.85291510634124, -246.04653050377965, -151.78832260798663, 144.27369455527514, 144.56944866478443, 90.68919277377427, 53.512750804424286, -135.86282426398247, -141.51867881510407, -97.66538087837398, -253.53739414270967, -187.60230323765427, 247.81563513725996, 137.88111602514982, 163.35517396777868, -241.80482274480164, 117.128308176063, 248.53530455566943, 235.3106337301433, -186.18678852450103, 63.65153900440782, -223.634405516088, -52.78648662753403, 123.22961756587029, -180.77537014055997, -179.4641258250922, -116.3951157303527, -71.3419539174065, -74.3008337393403, 104.36698244791478];

        hb = new HistoryBuffer(hbSize);

        hb.appendArray(arr);

        var decimatedRes = decimateRawData(hb, step);
        var query = hb.query(0, hb.count, step);

        expect(JSON.stringify(decimatedRes)).toEqual(JSON.stringify(query));
    });

    /* simple function that decimates data, we check the query results against this function*/
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

    /*makes sure that we get the query results in order*/
    function indexesAreInAscendingOrder(dataSeries) {
        var res = true;
        for (var i = 2; i < dataSeries.length; i+=2) {
            if (dataSeries[i - 2] >= dataSeries[i]) {
                res = false;
            }
        }

        return res;
    }
});
