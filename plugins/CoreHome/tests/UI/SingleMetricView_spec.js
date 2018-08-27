/*!
 * Piwik - free/libre analytics platform
 *
 * Dashboard screenshot tests.
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

describe('SingleMetricView', function () {
    this.timeout(0);

    var url = "?module=Widgetize&action=iframe&idSite=1&period=year&date=2012-08-09&moduleToWidgetize=Dashboard&"
        + "actionToWidgetize=index&idDashboard=5";
    var rangeUrl = "?module=Widgetize&action=iframe&idSite=1&period=range&date=2012-08-07,2012-08-10&moduleToWidgetize=Dashboard&"
        + "actionToWidgetize=index&idDashboard=5";

    it('should load correctly', async function () {
        await page.goto(url);
        await page.waitForNetworkIdle();
        await page.click('.dashboard-manager a.title');

        await (await page.jQuery('.widgetpreview-categorylist>li:contains(Live!)')).hover(); // have to mouse move twice... otherwise Live! will just be highlighted
        await (await page.jQuery('.widgetpreview-categorylist > li:contains(Generic)')).hover();

        await (await page.jQuery('.widgetpreview-widgetlist li:contains(Metric)')).hover();
        await (await page.jQuery('.widgetpreview-widgetlist li:contains(Metric)')).click();

        var elem = await page.waitForSelector('#widgetCoreVisualizationssingleMetricViewcolumn');
        await page.waitForNetworkIdle();
        await page.waitFor(250);
        expect(await elem.screenshot()).to.matchImage('loaded');
    });

    it('should handle formatted metrics properly', async function () {
        await (await page.$('#widgetCoreVisualizationssingleMetricViewcolumn .single-metric-view-picker .jqplot-seriespicker')).hover();
        console.log(1);
        await page.waitFor(100); // wait for popover visible
        await (await page.jQuery('.jqplot-seriespicker-popover label:contains(Revenue)')).click();
        await page.waitFor(250);
        console.log(2);
        var elem = await page.$('#widgetCoreVisualizationssingleMetricViewcolumn');
        expect(await elem.screenshot()).to.matchImage('formatted_metric');
    });

    it('should handle range periods correctly', async function () {
        await page.goto(rangeUrl);

        var elem = await page.waitForSelector('#widgetCoreVisualizationssingleMetricViewcolumn');
        await page.waitForNetworkIdle();
        await page.waitFor(250);
        expect(await elem.screenshot()).to.matchImage('range');
    });
});
