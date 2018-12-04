(function () {
    'use strict';

    angular.module("app").controller('sidebarController', ['$scope', '$timeout', '$route', 'server', 'config', sidebar]);

    function sidebar($scope, $timeout, $route, server, config) {
        var vm = this;

        vm.isCurrent = isCurrent;
		vm.isOpen = isOpen;
        vm.refresh = refresh;
        vm.activeZendesk = activeZendesk;
        vm.menus = getMainMenus();
        vm.version = config.version;

        vm.unreadReadCount = 0;

        vm.minToggle = function () {
            $('body').toggleClass('sidebar-menu-min');
        };
        
        //////////////////////////

        function convertLinkToParams(link){
            var parts = link.split('/');
            if (parts.length === 3) {
                return {
                    section: parts[1],
                    page   : parts[2]
                };
            }
            if (parts.length === 2) {
                return {
                    section: parts[1]
                };
            }
            return {};
        }

        function isCurrent(menuItem) {
            var params = convertLinkToParams(menuItem.link);

            if ($route.current.loadedTemplateUrl === 'app/defaultRedirect.html' &&
                config.session &&
                config.session.Access) {
                if (params.section === 'dashboard') {
                    return true;
                }
            }

            //check if one this items submenus is the current
            for (var i = 0; i < menuItem.subMenus.length; i++) {
                if (isCurrent(menuItem.subMenus[i])) {
                    return true;
                }
            }

            if (!params.page) {
                return false;
            }

            return $route.current.params.page ===  params.page &&
                $route.current.params.section === params.section;
        }

		function isOpen(menuItem) {
			return menuItem.subMenuOpen;
        }
        
        function activeZendesk() {
            if ($zopim && $zopim.livechat && $zopim.livechat.isChatting()) {
                $zopim.livechat.window.show();
            } else if (zE) {
                zE.activate();
            }
        }
        
        function refresh(currentMenuItem) {
            vm.menus.forEach(function(menu) {
                 if (menu !== currentMenuItem && menu.subMenus.length > 0 && menu.subMenuOpen) {
                    $timeout(function() {
                        menu.subMenuOpen = false;
                    });
                }
            });
        }

		function getMainMenus(){
            var mainMenus = [               
                create("Dashboard", "#/dashboard/now", "icon-dashboard"),             
                create("Usage", "#/usage/list", "icon-list")   ,            
                create("Demo", "#/demo/demo", "icon-camera")   ,            
                create("Subscription", "#/payment/edit", "icon-vf-credit-card")   ,            
            ];
            return mainMenus;
        }

        function create (title, link, icon, subMenu, subMenuOpenByDefault, isHidden, id) {
            if (!id) {
                id = title;
            }

            var item = {
                title: title,
                link: link,
                icon: icon || "icon-double-angle-right",
                infoNumber: 0,
                alertNumber: 0,
                subMenus: subMenu || [],
				subMenuOpen: false,
                subMenuOpenByDefault: subMenuOpenByDefault || false,
                isSelected : true,
                childSelected:false,
                isHidden: isHidden || false,
                extraElement:null,
                id: id,

                //////////////////
                betaFeature: function() {
                    this.isBetaFeature = true;
                    this.isHidden = config.session.ReleaseChannel !== 'alpha' && config.session.ReleaseChannel !== 'beta';
                    return this;
                }
            };

            return item;
        }

        function isLocal() {
            return window.location && window.location.protocol === 'http:';
        }
    }
})();