/*!
 * Matomo - free/libre analytics platform
 *
 * UsersManager screenshot tests.
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

describe("UsersManager", function () {
    this.timeout(0);
    this.fixture = "Piwik\\Plugins\\UsersManager\\tests\\Fixtures\\ManyUsers";

    var url = "?module=UsersManager&action=index";

    before(async function() {
        await page.webpage.setViewport({
            width: 1250,
            height: 768
        });
    });

    it('should display the manage users page correctly', async function () {
        await page.goto(url);

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('load');
    });

    it('should change the results page when next is clicked', async function () {
        await page.click('.usersListPagination .btn.next');
        await page.mouse.move(-10, -10);
        await page.waitForNetworkIdle();

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('next_click');
    });

    it('should filter by username and access level when the inputs are filled', async function () {
        await page.type('#user-text-filter', 'ight');
        await page.evaluate(function () {
            $('select[name=access-level-filter]').val('string:view').change();
        });
        await page.waitForNetworkIdle();

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('filters');
    });

    it('should display access for a different site when the roles for select is changed', async function () {
        // remove access filter
        await page.evaluate(function () {
            $('select[name=access-level-filter]').val('string:').change();
        });

        await page.click('th.role_header .siteSelector a.title');
        await page.waitForNetworkIdle();
        var elem = await page.jQuery('.siteSelector .custom_select_container a:contains(relentless)');
        await elem.click();
        await page.waitForNetworkIdle();

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('role_for');
    });

    it('should select rows when individual row select is clicked', async function () {
        await (await page.jQuery('td.select-cell label:eq(0)')).click();
        await (await page.jQuery('td.select-cell label:eq(3)')).click();
        await (await page.jQuery('td.select-cell label:eq(8)')).click();

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('rows_selected');
    });

    it('should select all rows when all row select is clicked', async function () {
        await page.click('th.select-cell label');

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('all_rows_selected');
    });

    it('should select all rows in search when link in table is clicked', async function () {
        await page.click('.toggle-select-all-in-search');
        await page.mouse.move(0, 0);

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('all_rows_in_search');
    });

    it('should deselect all rows in search except for displayed rows when link in table is clicked again', async function () {
        await page.click('.toggle-select-all-in-search');
        await page.mouse.move(0, 0);

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('all_rows_selected');
    });

    it('should show bulk action confirm when bulk change access option used', async function () {
        // remove filters
        await page.evaluate(function () {
            $('select[name=access-level-filter]').val('string:').change();
        });

        await page.click('.toggle-select-all-in-search'); // reselect all in search

        await page.click('.bulk-actions.btn');
        await (await page.jQuery('#user-list-bulk-actions>li:first')).hover();
        await (await page.jQuery('#bulk-set-access a:contains(Admin)')).click();

        expect(await page.screenshotSelector('.change-user-role-confirm-modal')).to.matchImage('bulk_set_access_confirm');
    });

    it('should change access for all rows in search when confirmed', async function () {
        await (await page.jQuery('.change-user-role-confirm-modal .modal-close:not(.modal-no)')).click();
        await page.waitForNetworkIdle();

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('bulk_set_access');
    });

    it('should remove access to the currently selected site when the bulk remove access option is clicked', async function () {
        await page.click('th.select-cell label'); // select displayed rows

        await page.click('.bulk-actions.btn');
        await (await page.jQuery('#user-list-bulk-actions a:contains(Remove Permissions)')).click();
        await (await page.jQuery('.change-user-role-confirm-modal .modal-close:not(.modal-no)')).click();
        await page.waitForNetworkIdle();

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('bulk_remove_access');
    });

    it('should go back to first page when previous button is clicked', async function () {
        await page.click('.usersListPagination .btn.prev');
        await page.waitForNetworkIdle();

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('previous');
    });

    it('should delete a single user when the modal is confirmed is clicked', async function () {
        await (await page.jQuery('.deleteuser:eq(0)')).click();
        await (await page.jQuery('.delete-user-confirm-modal .modal-close:not(.modal-no)')).click();
        await page.waitForNetworkIdle();

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('delete_single');
    });

    it('should delete selected users when delete users bulk action is used', async function () {
        await page.click('th.select-cell label'); // select displayed rows

        await page.click('.bulk-actions.btn');
        await (await page.jQuery('#user-list-bulk-actions a:contains(Delete Users)')).click();
        await (await page.jQuery('.delete-user-confirm-modal .modal-close:not(.modal-no)')).click();
        await page.waitForNetworkIdle();

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('delete_bulk_access');
    });

    it('should show the add new user form when the add new user button is clicked', async function () {
        await page.click('.add-user-container .btn');
        await page.waitForNetworkIdle();

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('add_new_user_form');
    });

    it('should create a user and show the edit user form when the create user button is clicked', async function () {
        await page.type('#user_login', '000newuser');
        await page.type('#user_password', 'thepassword');
        await page.tyoe('#user_email', 'theuser@email.com');

        await page.click('piwik-user-edit-form .siteSelector a.title');
        await (await page.jQuery('piwik-user-edit-form .siteSelector .custom_select_container a:eq(1)')).click();

        await page.click('piwik-user-edit-form [piwik-save-button]');
        await page.waitForNetworkIdle();

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('user_created');
    });

    it('should show the permissions edit when the permissions tab is clicked', async function () {
        await page.click('.userEditForm .menuPermissions');
        await page.mouse.move(0, 0);

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('permissions_edit');
    });

    it('should select all sites in search when in table link is clicked', async function () {
        // remove filters
        await page.evaluate(function () {
            $('div.site-filter>input').val('').change();
            $('.access-filter select').val('string:').change();
        });

        await page.click('.userPermissionsEdit th.select-cell label');
        await page.click('.userPermissionsEdit tr.select-all-row a');

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('permissions_all_rows_in_search');
    });

    it('should add access to all websites when bulk access is used on all websites in search', async function () {
        await page.click('.userPermissionsEdit .bulk-actions > .dropdown-trigger.btn');
        await (await page.jQuery('#user-permissions-edit-bulk-actions>li:first')).hover();
        await (await page.jQuery('#user-permissions-edit-bulk-actions a:contains(Write)')).click();

        await (await page.jQuery('.change-access-confirm-modal .modal-close:not(.modal-no)')).click();

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('permissions_all_sites_access');
    });

    it('should go to the next results page when the next button is clicked', async function () {
        await page.click('.sites-for-permission-pagination a.next');
        await page.waitForNetworkIdle();

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('permissions_next');
    });

    it('should remove access to a single site when the trash icon is used', async function () {
        await page.click('#sitesForPermission .deleteaccess');
        await (await page.jQuery('.delete-access-confirm-modal .modal-close:not(.modal-no)')).click();
        await page.waitForNetworkIdle();

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('permissions_remove_single');
    });

    it('should select multiple rows when individual row selects are clicked', async function () {
        await (await page.jQuery('#sitesForPermission td.select-cell label:eq(0)')).click();
        await (await page.jQuery('#sitesForPermission td.select-cell label:eq(3)')).click();
        await (await page.jQuery('#sitesForPermission td.select-cell label:eq(8)')).click();

        pageWrap = await page.$('.usersManager');
        expect(await pageWrap.screenshot()).to.matchImage('permissions_select_multiple');
    });

    it('should set access to selected sites when set bulk access is used', async function () {
        await page.click('.userPermissionsEdit .bulk-actions > .dropdown-trigger.btn');
        await (await page.jQuery('#user-permissions-edit-bulk-actions>li:first')).hover();
        await (await page.jQuery('#user-permissions-edit-bulk-actions a:contains(Admin)')).click();

        await (await page.jQuery('.change-access-confirm-modal .modal-close:not(.modal-no)')).click();
        await page.waitForNetworkIdle();

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('permissions_bulk_access_set');
    });

    it('should filter the permissions when the filters are used', async function () {
        await page.type('div.site-filter>input', 'nova');
        await page.evaluate(function () {
            $('.access-filter select').val('string:admin').change();
        });
        await page.waitForNetworkIdle();

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('permissions_filters');
    });

    it('should select all displayed rows when the select all checkbox is clicked', async function () {
        await page.click('.userPermissionsEdit th.select-cell label');

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('permissions_select_all');
    });

    it('should set access to all sites selected when set bulk access is used', async function () {
        await page.click('.userPermissionsEdit .bulk-actions > .dropdown-trigger.btn');
        await (await page.jQuery('#user-permissions-edit-bulk-actions>li:first')).hover();
        await (await page.jQuery('#user-permissions-edit-bulk-actions a:contains(View)')).click();

        await (await page.jQuery('.change-access-confirm-modal .modal-close:not(.modal-no)')).click();

        await page.evaluate(function () { // remove filter
            $('.access-filter select').val('string:some').change();
        });
        await page.waitForNetworkIdle();

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('permissions_bulk_access_set_all');
    });

    it('should set access to single site when select in table is used', async function () {
        await page.evaluate(function () {
            $('.userPermissionsEdit tr select:eq(0)').val('string:admin').change();
        });

        await (await page.jQuery('.change-access-confirm-modal .modal-close:not(.modal-no)')).click();
        await page.waitForNetworkIdle();

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('permissions_single_site_access');
    });

    it('should remove access to displayed rows when remove bulk access is clicked', async function () {
        // remove filters
        await page.evaluate(function () {
            $('div.site-filter>input').val('').change();
            $('.access-filter select').val('string:').change();
        });

        await page.click('.userPermissionsEdit th.select-cell label');
        await page.click('.userPermissionsEdit tr.select-all-row a');

        await page.click('.userPermissionsEdit .bulk-actions > .dropdown-trigger.btn');
        await (await page.jQuery('.userPermissionsEdit a:contains(Remove Permissions)')).click();

        await (await page.jQuery('.delete-access-confirm-modal .modal-close:not(.modal-no)')).click();
        await page.waitForNetworkIdle();

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('permissions_remove_access');
    });

    it('should display the superuser access tab when the superuser tab is clicked', async function () {
        await page.click('.userEditForm .menuSuperuser');
        await page.mouse.move(0, 0);

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('superuser_tab');
    });

    it('should show superuser confirm modal when the superuser toggle is clicked', async function () {
        await page.click('.userEditForm #superuser_access+label');

        expect(await page.screenshotSelector('.superuser-confirm-modal')).to.matchImage('superuser_confirm');
    });

    it('should give the user superuser access when the superuser modal is confirmed', async function () {
        await page.click('.superuser-confirm-modal .modal-close:not(.modal-no)');
        await page.waitForNetworkIdle();

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('superuser_set');
    });

    it('should go back to the manage users page when the back link is clicked', async function () {
        await page.click('.userEditForm .entityCancelLink');

        await page.evaluate(function () { // remove filter so new user shows
            $('#user-text-filter').val('').change();
        });
        await page.waitForNetworkIdle();

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('manage_users_back');
    });

    it('should show the edit user form when the edit icon in a row is clicked', async function () {
        await (await page.jQuery('button.edituser:eq(0)')).click();
        await page.waitForNetworkIdle();

        expect(await page.screenshotSelector('.usersManager')).to.matchImage('edit_user_form');
    });

    // admin user tests
    describe('UsersManager_admin_view', function () {
        before(async function () {
            var idSites = [];
            for (var i = 1; i !== 46; ++i) {
                idSites.push(i);
            }

            testEnvironment.idSitesAdminAccess = idSites;
            testEnvironment.save();

            await page.webpage.setViewport({
                width: 1250,
                height: 768
            });
        });

        after(function () {
            delete testEnvironment.idSitesAdminAccess;
            testEnvironment.save();
        });

        it('should hide columns & functionality if an admin user views the manage user page', async function () {
            await page.goto(url);

            expect(await page.screenshotSelector('.usersManager')).to.matchImage('admin_load');
        });

        it('should show the add user form for admin users', async function () {
            await page.click('.add-user-container .btn');
            await page.waitForNetworkIdle();

            expect(await page.screenshotSelector('.usersManager')).to.matchImage('admin_add_user');
        });

        it('should not allow editing basic info for admin users', async function () {
            await page.evaluate(function () {
                $('.userEditForm .entityCancelLink').click();
            });
            await (await page.jQuery('button.edituser:eq(0)')).click();
            await page.waitForNetworkIdle();

            expect(await page.screenshotSelector('.usersManager')).to.matchImage('edit_user_basic_info');
        });

        it('should allow editing user permissions for admin users', async function () {
            await page.click('.userEditForm .menuPermissions');

            expect(await page.screenshotSelector('.usersManager')).to.matchImage('admin_edit_permissions');
        });

        it('should show the add existing user modal', async function () {
            await page.evaluate(function () {
                $('.userEditForm .entityCancelLink').click();
            });

            await page.click('.add-existing-user');
            await page.waitFor(500); // wait for animation

            expect(await page.screenshotSelector('.add-existing-user-modal')).to.matchImage('admin_existing_user_modal');
        });

        it('should add a user by email when an email is entered', async function () {
            await page.type('input[name="add-existing-user-email"]', '0_login3conchords@example.com');
            await (await page.jQuery('.add-existing-user-modal .modal-close:not(.modal-no)')).click();
            await page.waitForNetworkIdle();

            await page.evaluate(function () { // show new user
                $('#user-text-filter').val('0_login3conchords@example.com').change();
            });
            await page.waitFor(500);

            expect(await page.screenshotSelector('.usersManager')).to.matchImage('admin_add_user_by_email');
        });

        it('should add a user by username when a username is entered', async function () {
            await page.click('.add-existing-user');
            await page.type('input[name="add-existing-user-email"]', '10_login8');
            await (await page.jQuery('.add-existing-user-modal .modal-close:not(.modal-no)')).click();
            await page.waitForNetworkIdle();

            await page.evaluate(function () { // show new user
                $('#user-text-filter').val('10_login8').change();
            });

            expect(await page.screenshotSelector('.usersManager')).to.matchImage('admin_add_user_by_login');
        });

        it('should fail if an email/username that does not exist is entered', async function () {
            await page.click('.add-existing-user');
            await page.type('input[name="add-existing-user-email"]', 'sldkjfsdlkfjsdkl');
            await (await page.jQuery('.add-existing-user-modal .modal-close:not(.modal-no)')).click();
            await page.waitForNetworkIdle();

            await page.evaluate(function () { // show no user added
                $('#user-text-filter').val('sldkjfsdlkfjsdkl').change();
            });

            expect(await page.screenshotSelector('.usersManager')).to.matchImage('admin_add_user_not_exists');
        });
    });
});