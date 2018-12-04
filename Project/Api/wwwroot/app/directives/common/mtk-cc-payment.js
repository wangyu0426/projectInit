(function () {
    'use strict';

    angular.module('app').directive('mtkCcPayment', ['$timeout', directive]);

    function directive($timeout) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                model: '='
            },
            templateUrl: function(element, attrs) {
                return attrs.templateUrl || '/app/directives/common/mtk-cc-payment.html';
            },
            link: function (scope, element) {
                scope.numberIsValid = false;

                $timeout(function() {
                    element.find('input[name="cardNumber"]').payment('formatCardNumber');
                    element.find('input[name="cardExpiry"]').payment('formatCardExpiry');
                    element.find('input[name="cardCvc"]').payment('formatCardCVC');
                });

                scope.$watch('model.cardNumber', function (n) {
                    selectCardType(n);

                    if (scope.model.cardType && scope.model.cardType !== '' && scope.model.cardType !== 'Unsupported') {
                        scope.numberIsValid = $.payment.validateCardNumber(n);
                    } else {
                        scope.numberIsValid = false;
                    }
                });

                scope.$watch('model.cardExpiry', function (n) {
                    var regexExpiry = /(\d{2})\s?\/?\s?(\d{2,4})/;
                    if (!regexExpiry.test(n)) {
                        return;
                    }

                    var monthYear = regexExpiry.exec(n);
                    element.find('input[type="hidden"][name="cardExpiryMonth"]').val(monthYear[1]);
                    element.find('input[type="hidden"][name="cardExpiryYear"]').val(monthYear[2]);
                });
 
                function selectCardType(cardNumber) {
                    if (!cardNumber || cardNumber !== 0) {
                        scope.model.cardType = $.payment.cardType(cardNumber);
                    } else {
                        scope.model.cardType = '';
                    }

                    switch (scope.model.cardType) {
                        case 'visa':
                            scope.model.cardType = 'Visa';
                            break;
                        case 'mastercard':
                            scope.model.cardType = 'MasterCard';
                            break;
                        case 'amex':
                            scope.model.cardType = 'Amex';
                            break;
                        default:
                            if (cardNumber && cardNumber.length > 4) {
                                scope.model.cardType = 'Unsupported';
                            } else {
                                scope.model.cardType = "";
                            }
                            break;
                    }
                }
            }
        };
    }
})();