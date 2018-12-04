(function () {
    'use strict';
    angular.module('app').service('permissionService', ['$rootScope', '$route', '$timeout', 'config', 'ux', permissionService]);
    function permissionService ($rootScope, $route, $timeout, config ,ux) {
        var session;

        var self = {
            init: init,
            isEditAllowed: false,
            isEditAccountAllowed: false,
            isDebugMode: false,
            isSubscriber: false,
            isAdmin: false,
            isAgent: false,
            checkPermission: checkPermission, 
            checkRole: checkRole,
            maxRole: maxRole,
            possibleRoles: {
                all: ['admin','standard','limited','readonly'], //standard guest'.split(' '),
                allOptions: [{Name: 'Admin', Id:'admin'}, {Name:'Standard', Id:'standard'}, {Name:'Limited',Id:'limited'}, {Name:'Read Only', Id:'readonly'}], //standard guest'.split(' '),   //these need to be written in descending order of seniority
                nonReadOnly: [
                    { Name: 'Admin', Id: 'admin' },
                    { Name: 'Standard', Id: 'standard' },
                    { Name: 'Limited', Id: 'limited' }
                ],
                subscriber: ['admin']
            },
            isReady: false,

            folioAccessList: [],
            helpRegionCode: null, //ONLY applicable for Admin: This is the region code value for the currently shown inline help. The user can change this to show different help text for different regions

            showOnly:showOnly
        };

        return self;

        function init(sessionVal) {
            session = sessionVal;
            setEditAllowed();
            setIsSubscriber();
            setIsAdmin();

            self.folioAccessList = session.FolioAccessList;
            self.isAgent = !!(session.Access);

            setDebugMode();
            addAdminFeatures();

            self.isReady = true;
            $rootScope.$broadcast(config.events.userSignedIn, session);
        }

        function setEditAllowed() {
            self.isEditAllowed = checkRole('standard') || checkRole('limited') || checkPermission('admin');
            self.isEditAccountAllowed = checkRole('standard') || checkPermission('admin');
        }
        function setIsSubscriber() {
            self.isSubscriber =  checkRole('admin');
        }
        function setIsAdmin() {
            self.isAdmin =  checkPermission('administrator');
        }
        function setDebugMode() {
           
        }
        function checkRole(role) {
            if (!session || !session.Access || !session.Access.MemberRoles) return false;
            return session.Access.MemberRoles.contains(role) || session.Access.MemberRoles.contains(role.toLowerCase());
        }

        function checkPermission(perm) {
            if (!session || !session.Permissions) return false;
            return session.Permissions.contains(perm) || session.Permissions.contains(perm.toLowerCase());
        }

        function maxRole() {
            for (var i = 0; i <= self.possibleRoles.all.length; i ++) {
                if (checkRole(self.possibleRoles.all[i])) {
                    return self.possibleRoles.all[i];
                }
            }
            return undefined;
        }

        function addDebugFns() {
                window.addRole = function (r) {session.Access.MemberRoles.push(r); setEditAllowed();};
                window.setRole = function (r) {session.Access.MemberRoles = [r]; setEditAllowed();};
                window.addPermission = function (r) {session.Permissions.push(r); setEditAllowed();};
                window.setPermission = function (r) {session.Permissions = [r]; setEditAllowed();};
                window.removeRole = function (r) {session.Access.MemberRoles.remove(r); setEditAllowed();};
                window.removePermission = function (r) {session.Permissions.remove(r); setEditAllowed();};
                window.mtkSession = session;
        }

        function showOnly(elm, condition){
            // Not yet handling if element has ngShow or ngHide
            var isPassCheck = false;
            isPassCheck = angular.isFunction(condition) ? condition() : condition;

            if (isPassCheck) {
                show();
            } else {
                hide();
            }

            function hide() {
                elm.addClass('hidden-by-permission');
            }
            function show() {
                elm.removeClass('hidden-by-permission');
            }

        }

        function addAdminFeatures() {
            if (!self.isAdmin) return;

            $rootScope.regionAdmin = {
                helpRegionCode      :    self.helpRegionCode,
                setHelpRegionCode   : setRegionCode,
                regions:
                    [{name: "Qld, Australia", code: 'AU_QLD'},
                    {name: "NSW, Australia", code: 'AU_NSW'},
                    {name: "Vic, Australia", code: 'AU_VIC'},
                    {name: "WA, Australia", code: 'AU_WA'},
                    {name: "SA, Australia", code: 'AU_SA'},
                    {name: "Tas, Australia", code: 'AU_TAS'},
                    {name: "NT, Australia", code: 'AU_NT'},
                    {name: "ACT, Australia", code: 'AU_ACT'},
                    {name: "Califonia, United States", code: 'US_CA'},
                    {name: "New Zealand", code: 'NZ'},
                    {name: "Great Britain", code: 'GB'}]
            };


            //run this by default to set the admin region to global
            setRegionCode();

            function setRegionCode(code) {
                self.helpRegionCode = code;
                $rootScope.regionAdmin.helpRegionCode = self.helpRegionCode;

                //clear global help values
                window.mtk_Help = null;

                //we load 'helptext.js?v=' + window.mtk_HELPTEXT_VERSION multiple times, so we need some extra randomness to stop caching
                var rnd = Math.floor(Math.random() * 100) + '';

                //the help javascript file must be EXECUTED by the browser, so we create a script tag and add it in.
                var tag=document.createElement('script');
                tag.setAttribute("type","text/javascript");
                // console.log(tag);

                //this callback will be run at the end of the new script.
                window.helpRegionCallback = function() {
                    $rootScope.$broadcast(config.events.refreshData);
                    $rootScope.$apply();
                };

                //add it to body, load it and execute it
                document.getElementsByTagName("body")[0].appendChild(tag);

            }
        }
    }
}());
