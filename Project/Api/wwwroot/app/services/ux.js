(function () {
	'use strict';
	angular.module('app').service('ux', ['$rootScope', '$timeout', '$window', '$location', 'mtkAlert', 'textFormat', 'lookupAdaptor', 'config', 'iconMapper',uxService]);
    function uxService ($rootScope, $timeout, $window, $location, alert, textFormat, lookupAdaptor, config, iconMapper) {

        var lastFocusTimeOut;
        var timestamp;
        return {
            init: init,
            alert: alert,
            modal: bootbox,
            confirm: confirm,
            textFormat: textFormat,
            refreshData: refreshData,
            refreshActivityList: refreshActivityList,
            refreshJobQuotations: refreshJobQuotations,
            refreshContactAlerts: refreshContactAlerts,
            refreshMemberImage: refreshMemberImage,
            setVideoUrl: setVideoUrl,
            lookupAdaptor: lookupAdaptor,
            loadingStart: loadingStart,
            loadingEnd: loadingEnd,
			icon: iconMapper.icon,
			png: iconMapper.png,
            preloadImage: preloadImage,
            enableSettingsMenu: enableSettingsMenu,
            froalaOptions: froalaOptions,
            getAvatarUrl : getAvatarUrl,
            updateAvatarUrl : updateAvatarUrl,
            openIFrameForFirefox: openIFrameForFirefox
        };

        function init() {
            enableCloseButtons();
            enableAutoSelectAllOnInputs();
            checkTouchDevice();

            $rootScope.Math = window.Math;
            $rootScope.isLoadingMain = false;
        }

        function loadingStart() {
            $rootScope.isLoadingMain = true;
        }

        function loadingEnd() {
            $rootScope.isLoadingMain = false;
        }

        //this is part of ace functionality we can use without using all of Ace
        function enableCloseButtons() {
            $('body').on('click.close', function(ev){
                $(ev.target).closest('.closeable').hide();
            } );
        }


        function enableAutoSelectAllOnInputs() {
            //when an input element gets focus, immediately select all the text
            $('body').on('focus', 'input', function(ev){
                var tg = ev.target;
                if (tg.attributes['no-auto-select']) {
                    return;
                }
                if (tg.select && typeof tg.select === 'function') {
                    //Chrome needs this done after a timeout, see http://stackoverflow.com/questions/4067469/selecting-all-text-in-html-text-input-when-clicked
                    //we also want to prevent endlessly calling these things
                    if (!!lastFocusTimeOut) {
                        $timeout.cancel(lastFocusTimeOut);
                    }
                    lastFocusTimeOut = $timeout(function() {
                        tg.select();
                    });
                }
            } );
        }

        function checkTouchDevice(){
            if (('ontouchstart' in window) ||
                (navigator.maxTouchPoints > 0) ||
                (navigator.msMaxTouchPoints > 0)) {
                /* browser with either Touch Events of Pointer Events
                 running on touch-capable device */
                $rootScope.isTouchDevice = true;
            } else {
                $rootScope.isTouchDevice = false;
            }

        }

        function refreshData(scope, data) {
            if (scope) {
                scope.$broadcast(config.events.refreshData, data);
            } else {
                $rootScope.$broadcast(config.events.refreshData, data);
            }
        }

        function refreshActivityList(scope) {
            if (scope) {
                scope.$broadcast('mtk.activity.feed:refresh');
            } else {
                $rootScope.$broadcast('mtk.activity.feed:refresh');
            }
        }

        function refreshJobQuotations(scope) {
            if (scope) {
                scope.$broadcast('mtk.jobtask.quotations:refresh');
            } else {
                $rootScope.$broadcast('mtk.jobtask.quotations:refresh');
            }
        }

        function refreshContactAlerts(scope) {
            if (scope) {
                scope.$broadcast('mtk.contact.alerts:refresh');
            } else {
                $rootScope.$broadcast('mtk.contact.alerts:refresh');
            }
        }

        function refreshMemberImage(scope) {
            if (scope) {
                scope.$broadcast('mtk.member.image:refresh');
            } else {
                $rootScope.$broadcast('mtk.member.image:refresh');
            }
        }

        function setVideoUrl(scope, data) {
            if (scope) {
                scope.$broadcast(config.events.setVideoUrl, data);
            } else {
                $rootScope.$broadcast(config.events.setVideoUrl, data);
            }
        }

        function preloadImage(src, callback){
            var img = new Image();
            img.src = src;
            if(img.complete){
                callback(true);
                img.onload=function(){};
            } else {
                img.onload = function() {
                    callback(true);
                    img.onload=function(){};
                };
                img.onerror = function() {
                    callback(false);
                    img.onerror=function(){};
                };
            }
        }

        function enableSettingsMenu() {
            if ($location.path().indexOf('/setup/') < 0) {
                $rootScope.isSettingsView = true;
            } else {
                $rootScope.isSettingsView = false;
            }
        }

        function froalaOptions(minimalToolbar, withStyleFiles) {
            // Removed buttons:
            // 'insertVideo', 'insertFile', 'insertImage', 'emoticons', 'print', 'subscript', 'superscript', 'inlineStyle'
            //  '-', 'specialCharacters', 'selectAll', 'spellChecker', 'quote', 'fullscreen', 'paragraphStyle', 'insertHR'
            // 'strikeThrough'
            // Removed plugins:
            // , 'save', 'video', 'emoticons', 'file', 'image', 'imageManager', 'quote',

            $.FroalaEditor.DefineIcon('insertPageBreakIcon', {SRC: '/app/content/images/page-break.png', ALT: 'page break button', template: 'image'});
            $.FroalaEditor.RegisterCommand('insertPageBreak', {
                title: 'Insert Page Break',
                icon: 'insertPageBreakIcon',
                focus: true,
                undo: true,
                refreshAfterCallback: true,
                callback: function () {
                    this.html.insert('<hr data-content="Page Break" id="fr-page-break" class="fr-page-break" />');
                }
            })


            var options = {
                initOnClick: false,
                //useClasses: false, //When disable the useClasses option, the editor converts the style from CSS files to inline styles
                iframe: true,
                zIndex: 1051,
                charCounterCount: false,
                enter: $.FroalaEditor.ENTER_DIV,
                tableStyles: {
                    'fr-dashed-borders': 'Dashed Borders',
                    'fr-none-border-style': 'None Border'
                },
                tableCellStyles: {
                    'fr-highlighted': 'Highlighted',
                    'fr-thick': 'Thick',
                    'fr-none-border': 'None'
                },
                pluginsEnabled: ['align', 'charCounter', 'codeBeautifier', 'codeView', 'colors', 'draggable',  'entities', 'fontFamily', 'fontSize', 'fullscreen', 
                    'inlineStyle', 'lineBreaker', 'link', 'lists', 'paragraphFormat', 'paragraphStyle', 'table', 'url', 'wordPaste', 'quickInsert'],
                toolbarButtonsXS: ['fontFamily', 'fontSize', 'bold', 'italic', 'underline',
                    '|', 'align', 'insertTable', 'clearFormatting', 'undo', 'redo'],
                toolbarButtonsSM: ['fontFamily', 'fontSize', 'bold', 'italic', 'underline',
                    '|', 'align', 'insertTable', 'clearFormatting', 'undo', 'redo'],
                toolbarButtonsMD: ['fontFamily', 'fontSize', 'color',
                    '|', 'bold', 'italic', 'underline',
                    '|', 'align', 'formatOL', 'formatUL', 'outdent', 'indent',
                    '|', 'insertTable', 'insertPageBreak', 'clearFormatting', 'undo', 'redo'],
                toolbarButtons: ['paragraphFormat', 'fontFamily', 'fontSize', 'color',
                    '|', 'bold', 'italic', 'underline',
                    '|', 'align', 'formatOL', 'formatUL', 'outdent', 'indent',
                    '|', 'insertLink', 'insertTable', 'insertPageBreak', 'clearFormatting', 'help', 'html', 'undo', 'redo'],
            };

            if (minimalToolbar) {
                var buttons = ['fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'align', 'color', 'insertLink', 'formatUL', 'html' ];
                options.toolbarButtons = buttons;
                options.toolbarButtonsXS = buttons;
                options.toolbarButtonsSM = buttons;
                options.toolbarButtonsMD = buttons;
                options.placeholderText = '';
                //in Email stationery designer, the header and footer required style file
                if (withStyleFiles) {
                    options.iframeStyleFiles = [ '/api/comms/email/styles' ];
                }else {
                    // options.fontFamilyDefaultSelection = 'Arial';
                    // set default fr-view style for font-family to Arial
                    options.iframeStyle = '.fr-view { font-family:Arial,Helvetica,sans-serif !important; font-size:15 !important;}';
                }


            } else {
                options.iframeStyleFiles = [ '/api/comms/email/styles' ];
            }
            return options;
        }


        function getAvatarUrl(memberId, imageSize) {
            if (!timestamp) {
                timestamp =  new Date().getTime();
            }
            return '/api/v1/member/avatar/' + memberId + '?ImageSize=' + imageSize + '&t=' + timestamp;
        }

        function updateAvatarUrl(memberId, imageSize){
            timestamp =  new Date().getTime();

            return '/api/v1/member/avatar/' + memberId + '?ImageSize=' + imageSize + '&t=' + timestamp;
        }

        function openIFrameForFirefox(url) {
            var win = $window.open(url, '_blank');
            win.focus();
        }
    }
}());