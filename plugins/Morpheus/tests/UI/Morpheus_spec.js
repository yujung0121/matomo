/*!
 * Matomo - free/libre analytics platform
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

describe("Morpheus", function () {
    this.timeout(0);

    var url = "?module=Morpheus&action=demo";

    before(function () {
        // Enable development mode
        testEnvironment.overrideConfig('Development', 'enabled', true);
        testEnvironment.save();
    });

    it("should show all UI components and CSS classes", async function() {
        await page.goto(url);
        await page.waitFor(500); // wait for rendering
        expect(await page.screenshot({ fullPage: true })).to.matchImage('load');
    });
});
