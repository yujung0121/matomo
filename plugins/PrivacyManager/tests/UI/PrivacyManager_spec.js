/*!
 * Piwik - free/libre analytics platform
 *
 * Screenshot integration tests.
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

describe("PrivacyManager", function () {
    this.timeout(0);

    this.fixture = "Piwik\\Plugins\\PrivacyManager\\tests\\Fixtures\\MultipleSitesMultipleVisitsFixture";

    var generalParams = 'idSite=1&period=day&date=2017-01-02',
        urlBase = '?module=PrivacyManager&' + generalParams + '&action=';

    before(function () {
        testEnvironment.pluginsToLoad = ['PrivacyManager'];
        testEnvironment.save();
    });

    async function setAnonymizeStartEndDate(page)
    {
        // make sure tests do not fail every day
        await page.evaluate(function () {
            $('input.anonymizeStartDate').val('2018-03-02').change();
            $('input.anonymizeEndDate').val('2018-03-02').change();
        });
    }
    
    async function loadActionPage(page, action)
    {
        await page.goto(urlBase + action);
        await page.waitForNetworkIdle();

        if (action === 'privacySettings') {
            await setAnonymizeStartEndDate(page);
        }
    }

    async function selectModalButton(page, button)
    {
        var elem = await page.jQuery('.modal.open .modal-footer a:contains('+button+')');
        await elem.click();
        await page.waitFor(500);
        await page.waitForNetworkIdle();
    }

    async function findDataSubjects(page)
    {
        await page.click('.findDataSubjects .btn');
        await page.waitForNetworkIdle();
    }

    async function anonymizePastData(page)
    {
        await page.click('.anonymizePastData .btn');
        await page.waitFor(1000); // wait for animation
    }

    async function deleteDataSubjects(page)
    {
        await page.click('.deleteDataSubjects input');
        await page.waitFor(500); // wait for animation
    }

    async function enterSegmentMatchValue(page, value) {
        await page.evaluate(theVal => {
            $('.metricValueBlock input').each(function (index) {
                $(this).val(theVal).change();
            });
        }, value);
    }

    async function selectVisitColumn(page, title)
    {
        await page.evaluate(function () {
            $('.selectedVisitColumns:last input.select-dropdown').click();
        });
        var selector = '.selectedVisitColumns:last .dropdown-content li:contains(' + title + ')';
        await page.waitForFunction('$("'+selector+'").length > 0');
        var elem = await page.jQuery(selector);
        await elem.click();
        await page.waitFor(100);
    }

    async function selectActionColumn(page, title)
    {
        await page.evaluate(function () {
            $('.selectedActionColumns:last input.select-dropdown').click();
        });
        await page.evaluate(theTitle => {
            $('.selectedActionColumns:last .dropdown-content li:contains(' + theTitle + ')').click();
        }, title);
    }

    async function capturePage(screenshotName) {
        await page.waitForNetworkIdle();
        expect(await page.screenshotSelector('.pageWrap,#notificationContainer,.modal.open')).to.matchImage(screenshotName);
    }

    async function captureAnonymizeLogData(screenshotName) {
        await page.waitForNetworkIdle();
        expect(await page.screenshotSelector('.logDataAnonymizer,#notificationContainer,.modal.open,.logDataAnonymizer table')).to.matchImage(screenshotName);
    }

    async function captureModal(screenshotName) {
        await page.waitForNetworkIdle();
        expect(await page.screenshotSelector('.modal.open')).to.matchImage(screenshotName);
    }

    it('should load privacy opt out page', async function() {
        await loadActionPage(page, 'usersOptOut');
        await capturePage('users_opt_out_default');
    });

    it('should load privacy asking for consent page', async function() {
        await loadActionPage(page, 'consent');
        await capturePage('consent_default');
    });

    it('should load GDPR overview page', async function() {
        testEnvironment.overrideConfig('Deletelogs', 'delete_logs_enable', '1');
        testEnvironment.overrideConfig('Deletelogs', 'delete_logs_older_than', '95');
        testEnvironment.overrideConfig('Deletereports', 'delete_reports_enable', '1');
        testEnvironment.overrideConfig('Deletereports', 'delete_reports_older_than', '131');
        testEnvironment.save();
        await loadActionPage(page, 'gdprOverview');

        await capturePage('gdpr_overview');
    });

    it('should load GDPR overview page', async function() {
        testEnvironment.overrideConfig('Deletelogs', 'delete_logs_enable', '0');
        testEnvironment.overrideConfig('Deletereports', 'delete_reports_enable', '0');
        testEnvironment.save();
        await loadActionPage(page, 'gdprOverview');

        await capturePage('gdpr_overview_no_retention');
    });

    it('should load privacy settings page', async function() {
        await loadActionPage(page, 'privacySettings');
        await page.waitForNetworkIdle();
        await capturePage('privacy_settings_default');
    });

    it('should anonymize ip and visit column', async function() {
        await page.waitForSelector('[name="anonymizeIp"] label');
        await page.click('[name="anonymizeIp"] label');
        await selectVisitColumn(page, 'config_browser_name');
        await selectVisitColumn(page, 'config_cookie');

        captureAnonymizeLogData('anonymizelogdata_anonymizeip_and_visit_column_prefilled');
    });

    it('should show a confirmation message before executing any anonymization', async function() {
        await anonymizePastData(page);

        await captureModal('anonymizelogdata_anonymizeip_and_visit_column_confirmation_message');
    });

    it('should be able to cancel anonymization of past data', async function() {
        await selectModalButton(page, 'No');

        await captureAnonymizeLogData('anonymizelogdata_anonymizeip_and_visit_column_cancelled');
    });

    it('should be able to confirm anonymization of past data', async function() {
        await anonymizePastData(page);
        await selectModalButton(page, 'Yes');
        await setAnonymizeStartEndDate(page);

        await captureAnonymizeLogData('anonymizelogdata_anonymizeip_and_visit_column_confirmed');
    });

    it('should prefill anonymize location and action column', async function() {
        await loadActionPage(page, 'privacySettings');
        await page.click('[name="anonymizeLocation"] label');
        await page.click('[name="anonymizeTheUserId"] label');
        await page.waitFor(500);
        await selectActionColumn(page, 'time_spent_ref_action');
        await selectActionColumn(page, 'idaction_content_name');

        await captureAnonymizeLogData('anonymizelogdata_anonymizelocation_anduserid_and_action_column_prefilled');
    });

    it('should confirm anonymize location and action column', async function() {
        await anonymizePastData(page);
        await selectModalButton(page, 'Yes');
        await page.waitFor(1000);
        await setAnonymizeStartEndDate(page);

        await captureAnonymizeLogData('anonymizelogdata_anonymizelocation_anduserid_and_action_column_confirmed');
    });

    it('should anonymize only one site and different date pre filled', async function() {
        await page.click('.form-group #anonymizeSite .title');
        await page.waitFor(1000);
        await page.click(".form-group #anonymizeSite [title='Site 1']");
        await page.click('[name="anonymizeIp"] label');
        await page.evaluate(function () {
            $('input.anonymizeStartDate').val('2017-01-01').change();
            $('input.anonymizeEndDate').val('2017-02-14').change();
        });

        await captureAnonymizeLogData('anonymizelogdata_one_site_and_custom_date_prefilled');
    });

    it('should anonymize only one site and different date confirmed', async function() {
        await anonymizePastData(page);
        await selectModalButton(page, 'Yes');
        await page.waitFor(1000);
        await setAnonymizeStartEndDate(page);

        await captureAnonymizeLogData('anonymizelogdata_one_site_and_custom_date_confirmed');
    });

    it('should load GDPR tools page', async function() {
        await loadActionPage(page, 'gdprTools');

        await capturePage('gdpr_tools_default');
    });

    it('should show no visitor found message', async function() {
        await enterSegmentMatchValue(page, 'userfoobar')
        await findDataSubjects(page);

        await capturePage('gdpr_tools_no_visits_found');
    });

    it('should find visits', async function() {
        await enterSegmentMatchValue(page, 'userId203');
        await findDataSubjects(page);

        await capturePage('gdpr_tools_visits_found');
    });

    it('should be able to show visitor profile', async function() {
        var elem = await page.jQuery('.visitorLogTooltip:first');
        await elem.click();
        await page.waitForNetworkIdle();

        expect(await page.screenshotSelector('.ui-dialog')).to.matchImage('gdpr_tools_visits_showprofile');
    });

    it('should be able to add IP to segment search with one click', async function() {
        await page.click('#Piwik_Popover .visitor-profile-close');
        var elem = await page.jQuery('.visitorIp:first a');
        await elem.click();
        await page.waitForNetworkIdle();

        await capturePage('gdpr_tools_enrich_segment_by_ip');
    });

    it('should be able to uncheck a visit', async function() {
        await page.click('.entityTable tbody tr:nth-child(2) .checkInclude label');
        await capturePage('gdpr_tools_uncheck_one_visit');
    });

    it('should ask for confirmation before deleting any visit', async function() {
        await deleteDataSubjects(page);
        await capturePage('gdpr_tools_delete_visit_unconfirmed');
    });

    it('should be able to cancel deletion and not delete any data', async function() {
        await selectModalButton(page, 'No');
        await capturePage('gdpr_tools_delete_visit_cancelled');
    });

    it('should verify really no data deleted', async function() {
        await loadActionPage(page, 'gdprTools');
        await page.waitFor(1000);
        await enterSegmentMatchValue(page, 'userId203');
        await findDataSubjects(page);
        await page.click('.entityTable tbody tr:nth-child(2) .checkInclude label');

        await capturePage('gdpr_tools_delete_visit_cancelled_verified_no_data_deleted');
    });

    it('should be able to confirm deletion and then actually delete data', async function() {
        await deleteDataSubjects(page);
        await selectModalButton(page, 'Yes');

        await capturePage('gdpr_tools_delete_visit_confirmed');
    });

});