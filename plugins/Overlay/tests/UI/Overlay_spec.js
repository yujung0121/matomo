/*!
 * Matomo - free/libre analytics platform
 *
 * Overlay screenshot tests.
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */
describe("Overlay", function () {
    this.timeout(0);

    var url = null;
    var urlWithSegment;

    async function removeOptOutIframe(page) {
        await page.evaluate(function () {
            $('iframe#optOutIframe', $('iframe').contents()).remove();
        });
    }

    before(async function() {
        var baseUrl = '?module=Overlay&period=year&date=today&idSite=3';
        var hash = '#?l=' + encodeURIComponent(testEnvironment.overlayUrl).replace(/[%]/g, "$");

        url = baseUrl + hash;
        urlWithSegment = baseUrl + '&segment=' + encodeURIComponent('visitIp==20.56.34.67') + hash;

        await testEnvironment.callApi("SitesManager.addSiteAliasUrls", {idSite: 3, urls: [config.piwikUrl]});
    });

    after(async function() {
        await testEnvironment.callApi("SitesManager.setSiteAliasUrls", {idSite: 3, urls: []});
    });

    it("should load correctly", async function() {
        await page.goto(url);

        await removeOptOutIframe(page);
        expect(await page.screenshot({ fullPage: true })).to.matchImage('loaded');
    });

    it("should show clicks when hover over link in iframe", async function() {
        var pos = await page.webpage.evaluate(() => {
            var iframe = $('iframe'),
                innerOffset = $('.btn.btn-large', iframe.contents()).offset();
            return {
                x: iframe.offset().left + innerOffset.left,
                y: iframe.offset().top + innerOffset.top
            };
        });
        await page.mouse.move(pos.x, pos.y);

        await page.evaluate(function () {
            $('div#PIS_StatusBar', $('iframe').contents()).each(function () {
                var html = $(this).html();
                html = html.replace(/localhost\:[0-9]+/g, 'localhost');
                $(this).html(html);
            });
        });
        await removeOptOutIframe(page);
        expect(await page.screenshot({ fullPage: true })).to.matchImage('page_link_clicks');
    });

    it("should show stats for new links when dropdown opened", async function() {
        await page.reload();
        await page.evaluate(function(){
            $('.dropdown-toggle', $('iframe').contents())[0].click();
        });
        await page.waitFor(1000);

        await removeOptOutIframe(page);
        expect(await page.screenshot({ fullPage: true })).to.matchImage('page_new_links');
    });

    it("should change page when clicking on internal iframe link", async function() {
        var pos = await page.webpage.evaluate(() => {
            var iframe = $('iframe'),
                innerOffset = $('ul.nav>li:nth-child(2)>a', iframe.contents()).offset();
            return {
                x: iframe.offset().left + innerOffset.left + 32, // position is incorrect for some reason w/o adding pixels
                y: iframe.offset().top + innerOffset.top
            };
        });
        await page.mouse.click(pos.x, pos.y);
        await page.waitForNetworkIdle();

        await removeOptOutIframe(page);
        expect(await page.screenshot({ fullPage: true })).to.matchImage('page_change');
    });

    it("should change date range when period changed", async function() {
        await page.waitForSelector('#overlayDateRangeSelect');
        await page.webpage.evaluate(function () {
            $('#overlayDateRangeSelect').val('day;yesterday').trigger('change');
        });

        await page.waitFor(500);
        await page.waitForNetworkIdle();

        await removeOptOutIframe(page);
        expect(await page.screenshot({ fullPage: true })).to.matchImage('period_change');
    });

    it("should open row evolution popup when row evolution link clicked", async function() {
        await page.click('#overlayRowEvolution');
        await page.waitForNetworkIdle();
        await page.evaluate(function () {
            $('.jqplot-xaxis').hide(); // xaxis will change every day so hide it
        });

        await removeOptOutIframe(page);
        expect(await page.screenshot({ fullPage: true })).to.matchImage('row_evolution');
    });

    it("should open transitions popup when transitions link clicked", async function() {
        await page.click('button.ui-dialog-titlebar-close');
        await page.click('#overlayTransitions');
        await page.waitForNetworkIdle();

        await removeOptOutIframe(page);
        expect(await page.screenshot({ fullPage: true })).to.matchImage('transitions');
    });

    it("should load an overlay with segment", async function() {
        await page.goto(urlWithSegment);
        await page.waitForNetworkIdle();

        await removeOptOutIframe(page);
        expect(await page.screenshot({ fullPage: true })).to.matchImage('loaded_with_segment');
    });
});