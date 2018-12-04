(function () {
    'use strict';

    angular.module('app')
        .directive('mtkRadio', ['$timeout', '$filter', 'textFormat', 'server', 'logger', 'keyEvent', function ($timeout, $filter, textFormat, server, logger, keyEvent) {

            return {
                restrict: 'E',
                templateUrl: '/app/directives/common/mtk-radio.html',
                scope: {
                    source: '=',
                    model: '=',
                    limitTo: '=',
                    buttonClass: '@',
                    hasIcon:'@',
                    ngDisabled: '&'
                },
                link: function (scope, element) {

                    scope.$watch('source', init);

                    scope.activate = activate;
                    scope.getText = getText;
                    scope.isActive = isActive;

                    function activate(option) {
                        scope.model = option.Id || option.id || option;
                    }

                    function isActive(option) {
                        if (option.Id) {
                            //console.log(option.Name + ' _ ' + option.Id + ' - model: ' + scope.model + ' ==>  ' + (scope.model === option.Id));
                            return scope.model === option.Id;
                        } else if (option.id) {
                            return scope.model === option.id;
                        } else {
                            return scope.model === option;
                        }
                    }

                    //work with name,Name, label,Label, Reference, reference
                    function getText(option) {
                        return option.name || option.Name ||
                            option.label || option.Label ||
                            option.Reference || option.reference ||
                            option.toString();
                    }

                    function getCurrentIndex() {
                        for (var i = 0; i < scope.options.length; i++) {
                            if (scope.isActive(scope.options[i])) {
                                return i;
                            }
                        }
                        return 0;//default: the first.
                    }

                    function selectPreviousOption() {
                        var optionsLength = scope.options.length;
                        var currentIndex = getCurrentIndex();
                        var newIndex = (currentIndex + optionsLength - 1) % optionsLength;
                        var newOption = scope.options[newIndex];
                        scope.activate(newOption);
                    }

                    function selectNextOption() {
                        var optionsLength = scope.options.length;
                        var currentIndex = getCurrentIndex();
                        var newIndex = (currentIndex + 1) % optionsLength;
                        var newOption = scope.options[newIndex];
                        scope.activate(newOption);
                    }

                    //use 'string' as url to automatic get array from server
                    function init() {
                        if (typeof scope.source === 'string') {
                            server
                                .get(scope.source)
                                .success(function (result) {
                                    if (Array.isArray && Array.isArray(result)) {
                                        if (scope.limitTo) {
                                            result = $filter('limitTo')(result, scope.limitTo);
                                        }
                                        scope.options = result;
                                    }

                                });
                        } else {
                            scope.options = scope.source;
                        }

                        //handle focus and key events
                        scope.focused = false;
                        $timeout(function () {
                            var radioOptions = element.find('button');
                            radioOptions.bind('focus', function () {
                                scope.focused = true;
                            });

                            radioOptions.bind('blur', function () {
                                scope.focused = false;
                            });

                            radioOptions.bind('keydown', HandleKeys);
                        },1000);

                        function HandleKeys(e) {
                            if (e.keyCode === keyEvent.KEY_LEFT) {
                                e.preventDefault();
                                scope.$apply(function () {
                                    selectPreviousOption();
                                });
                            } else if (e.keyCode === keyEvent.KEY_RIGHT) {
                                e.preventDefault();
                                scope.$apply(function () {
                                    selectNextOption();
                                });
                            }
                        }
                    }
                }
            };
        }]);
})();
