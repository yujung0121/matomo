/*!
 * Matomo - free/libre analytics platform
 * 
 * SegmentEditor screenshot tests.
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

describe("SegmentSelectorEditorTest", function () {
    var selectorsToCapture = ".segmentEditorPanel,.segmentEditorPanel .dropdown-body,.segment-element";
    
    this.timeout(0);

    var generalParams = 'idSite=1&period=year&date=2012-08-09';
    var url = '?module=CoreHome&action=index&' + generalParams + '#?' + generalParams + '&category=General_Actions&subcategory=General_Pages';

    async function selectFieldValue(fieldName, textToSelect)
    {
        await page.webpage.evaluate((fieldName) => {
            $(fieldName + ' input.select-dropdown').click();
        }, fieldName);
        await page.webpage.evaluate((fieldName, textToSelect) => {
            $(fieldName + ' .dropdown-content.active li:contains("' + textToSelect + '"):first').click();
        }, fieldName, textToSelect);
    }

    async function selectDimension(prefixSelector, category, name)
    {
        await (await page.jQuery(prefixSelector + ' .metricListBlock .select-wrapper')).click();
        await (await page.jQuery(prefixSelector + ' .metricListBlock .expandableList h4:contains(' + category + ')')).click();
        await (await page.jQuery(prefixSelector + ' .metricListBlock .expandableList .secondLevel li:contains(' + name + ')')).click();
    }

    it("should load correctly", async function() {
        await page.goto(url);
        expect(await page.screenshotSelector(selectorsToCapture)).to.matchImage('0_initial');
    });

    it("should open selector when control clicked", async function() {
        await page.click('.segmentationContainer .title');
        expect(await page.screenshotSelector(selectorsToCapture)).to.matchImage('1_selector_open');
    });

    it("should open segment editor when edit link clicked for existing segment", async function() {
        await page.evaluate(function() {
            $('.segmentList .editSegment:first').click()
        });
        await page.waitForNetworkIdle();
        expect(await page.screenshotSelector(selectorsToCapture)).to.matchImage('2_segment_editor_update');
    });

    it("should start editing segment name when segment name edit link clicked", async function() {
        await page.click('.segmentEditorPanel .editSegmentName');
        await page.waitFor(250); // animation
        expect(await page.screenshotSelector(selectorsToCapture)).to.matchImage('3_segment_editor_edit_name');
    });

    it("should show the egment editor's available segments dropdown", async function() {
        var elem = await page.$('.available_segments a.dropList');
        await elem.hover();
        await page.click('.available_segments a.dropList');
        expect(await page.screenshotSelector(selectorsToCapture)).to.matchImage('6_segment_editor_droplist');
    });

    it("should change segment when another available segment clicked in segment editor's available segments dropdown", async function() {
        await (await page.jQuery('.ui-menu-item a:contains(Add new segment)')).click();
        await page.waitForNetworkIdle();
        expect(await page.screenshotSelector(selectorsToCapture)).to.matchImage('6_segment_editor_different');
    });

    it("should close the segment editor when the close link is clicked", async function() {
        await page.evaluate(function () {
            $('.segmentEditorPanel .segment-footer .close').click();
        });
        expect(await page.screenshotSelector(selectorsToCapture)).to.matchImage('7_segment_editor_closed');
    });

    it("should open blank segment editor when create new segment link is clicked", async function() {
        await page.click('.segmentationContainer .title');
        await page.click('.add_new_segment');
        await page.waitForNetworkIdle();
        expect(await page.screenshotSelector(selectorsToCapture)).to.matchImage('8_segment_editor_create');
    });

    it("should update segment expression when selecting different segment", async function() {
        await selectDimension('.segmentRow0', 'Actions', 'Action URL');
        await page.waitForNetworkIdle();
        expect(await page.screenshotSelector(selectorsToCapture)).to.matchImage('dimension_drag_drop');
    });

    // phantomjs won't take screenshots of dropdown windows, so skip this test
    it.skip("should show suggested segment values when a segment value input is focused", async function() {
        await page.click('.segmentEditorPanel .ui-autocomplete-input');
        expect(await page.screenshotSelector(selectorsToCapture)).to.matchImage('suggested_values');
    });

    it("should add an OR condition when clicking on add OR", async function() {
        await page.click('.segmentEditorPanel .segment-add-or');
        await page.waitForNetworkIdle();
        expect(await page.screenshotSelector(selectorsToCapture)).to.matchImage('add_new_or_condition');
    });

    it("should add an OR condition when a segment dimension is selected in the OR placeholder section", async function() {
        await selectDimension('.segmentRow0 .segment-row:last', 'Actions', 'Clicked URL');
        await page.waitForNetworkIdle();
        expect(await page.screenshotSelector(selectorsToCapture)).to.matchImage('drag_or_condition');
    });

    it("should add an AND condition when clicking on add AND", async function() {
        await page.click('.segmentEditorPanel .segment-add-row');
        await page.waitForNetworkIdle();
        expect(await page.screenshotSelector(selectorsToCapture)).to.matchImage('add_new_and_condition');
    });

    it("should add an AND condition when a segment dimension is dragged to the AND placeholder section", async function() {
        await selectDimension('.segmentRow1', 'Actions', 'Clicked URL');
        await page.waitForNetworkIdle();
        expect(await page.screenshotSelector(selectorsToCapture)).to.matchImage('drag_and_condition');
    });

    it("should save a new segment and add it to the segment list when the form is filled out and the save button is clicked", async function() {
        await page.evaluate(function () {
            $('.metricValueBlock input').each(function (index) {
                $(this).val('value ' + index).change();
            });
        });

        await page.type('input.edit_segment_name', 'new segment');
        await page.click('.segmentRow0 .segment-or'); // click somewhere else to save new name

        await page.evaluate(function () {
            $('button.saveAndApply').click();
        });
        await page.waitForNetworkIdle();

        await page.click('.segmentationContainer');
        expect(await page.screenshotSelector(selectorsToCapture)).to.matchImage('saved');
    });

    it("should show the new segment after page reload", async function() {
        await page.reload();
        await page.click('.segmentationContainer .title');
        expect(await page.screenshotSelector(selectorsToCapture)).to.matchImage('saved');
    });

    it("should correctly load the new segment's details when the new segment is edited", async function() {
        await page.click('.segmentList li[data-idsegment="4"] .editSegment');
        await page.waitForNetworkIdle();
        expect(await page.screenshotSelector(selectorsToCapture)).to.matchImage('saved_details');
    });

    it("should correctly should show a confirmation when changing segment definition", async function() {
        await page.click('.segmentEditorPanel .editSegmentName');
        await page.evaluate(function () {
            $('input.edit_segment_name').val('').change();
        });
        await page.type('input.edit_segment_name', 'edited segment');
        await (await page.jQuery('.segmentRow0 .segment-or:first')).click(); // click somewhere else to save new name

        await selectFieldValue('.segmentRow0 .segment-row:first .metricMatchBlock', 'Is not');
        await selectFieldValue('.segmentRow0 .segment-row:last .metricMatchBlock', 'Is not');
        await selectFieldValue('.segmentRow1 .segment-row .metricMatchBlock', 'Is not');

        await page.evaluate(function () {
            $('.metricValueBlock input').each(function (index) {
                $(this).val('new value ' + index).change();
            });
        });

        await page.evaluate(function () {
            $('button.saveAndApply').click();
        });
        await page.waitForNetworkIdle();
        await page.waitFor(500); // animation to show confirm

        expect(await page.screenshotSelector('.modal.open')).to.matchImage('update_confirmation');
    });

    it("should correctly update the segment when saving confirmed", async function() {
        var elem = await page.jQuery('.modal.open .modal-footer a:contains(Yes):visible');
        await elem.click();
        await page.waitForNetworkIdle();
        await page.click('.segmentationContainer');
        await page.waitForNetworkIdle();
        expect(await page.screenshotSelector(selectorsToCapture)).to.matchImage('updated');
    });

    it("should show the updated segment after page reload", async function() {
        await page.reload();
        await page.click('.segmentationContainer .title');
        expect(await page.screenshotSelector(selectorsToCapture)).to.matchImage('updated');
    });

    it("should correctly load the updated segment's details when the updated segment is edited", async function() {
        await page.click('.segmentList li[data-idsegment="4"] .editSegment');
        await page.waitForNetworkIdle();
        expect(await page.screenshotSelector(selectorsToCapture)).to.matchImage('updated_details');
    });

    it("should correctly show delete dialog when the delete link is clicked", async function() {
        await page.click('.segmentEditorPanel a.delete');
        await page.waitFor(500); // animation
        expect(await page.screenshotSelector('.modal.open')).to.matchImage('deleted_dialog');
    });

    it("should correctly remove the segment when the delete dialog is confirmed", async function() {
        var elem = await page.jQuery('.modal.open .modal-footer a:contains(Yes):visible');
        await elem.click();
        await page.waitForSelector('.segmentationContainer .title');

        await page.click('.segmentationContainer .title');
        expect(await page.screenshotSelector(selectorsToCapture + ',.modal.open')).to.matchImage('deleted');
    });

    it("should not show the deleted segment after page reload", async function() {
        await page.reload();
        await page.waitForSelector('.segmentationContainer .title');

        await page.click('.segmentationContainer .title');
        expect(await page.screenshotSelector(selectorsToCapture)).to.matchImage('deleted');
    });
});
