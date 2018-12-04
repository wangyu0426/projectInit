(function(){
    'use strict';

    angular.module('app')
        .service('subscriptionUtility', ['$q','$window','server','config','modalDetail', 'libraryLoader', 'permissionService', subscriptionUtility]);

    function subscriptionUtility($q, $window, server, config, modalDetail, libraryLoader, permissionService) {
        var subscriptionUrl = '/api/v1/payment/subscription';

        return {
            loadData: loadDto,
            // subs
            removeSubscription : removeSubscription,
            modifyCreditCardSave : modifyCreditCardSave,
            // misc
            clearSessionReload : clearSessionReload
        };


        /// function

        function loadDto() {
            // init
            var defer = $q.defer();

            libraryLoader.Stripe.load().then(function() {
                server.getQuietly(subscriptionUrl).success(function (data) {
                    Stripe.setPublishableKey(data.gatewayPublicKey);
                    defer.resolve(data);
                });
            });
            return defer.promise;
        }

       

        function removeSubscription() {
            return server.delete(subscriptionUrl);
        }

        function modifyCreditCardSave(ccDetails) {
            
            var defer = $q.defer(),
                checkStripe = libraryLoader.Stripe.isLoaded;
            if (checkStripe) {
                Stripe.card.createToken(ccDetails, function (status, response) {
                    if (response.error) {
                        defer.reject(response.error.message);
                    } else {
                        server.post('/api/v1/payment/subscription', {
                            NewCardToken: response.id
                        }).success(function(data){
                            defer.resolve(data);
                        });
                    }
                });
            } else {
                defer.reject('Error: could not locate Stripe.');
            }
            return defer.promise;
        }

        // sms
    

        function clearSessionReload(){

            // clear session to force session reload
            config.session = null;

            // refresh the page
            $window.location.reload(true);
        }
    }

})();