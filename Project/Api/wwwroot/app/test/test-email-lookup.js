(function () {
    var app = angular.module('app');

    app.controller('testEmailLookupController', ['$scope', 'server', '$timeout', '$interval', testEmailLookupController]);

    function testEmailLookupController (scope, server, $timeout, $interval) {

        var vm = this;

        vm.source = [];
        vm.selected1 = "";
        vm.isDisabled = false;

        vm.selected1 = ['samantha@email.com','wladimir@email.com'];
        // vm.source
        vm.source = [
            { name: 'Adam',      email: 'adam@email.com',      age: 12, country: 'United States' },
            { name: 'Amalie',    email: 'amalie@email.com',    age: 12, country: 'Argentina' },
            { name: 'Estefanía', email: 'estefania@email.com', age: 21, country: 'Argentina' },
            { name: 'Adrian',    email: 'adrian@email.com',    age: 21, country: 'Ecuador' },
            { name: 'Wladimir',  email: 'wladimir@email.com',  age: 30, country: 'Ecuador' },
            { name: 'Samantha',  email: 'samantha@email.com',  age: 30, country: 'United States' },
            { name: 'Nicole',    email: 'nicole@email.com',    age: 43, country: 'Colombia' },
            { name: 'Natasha',   email: 'natasha@email.com',   age: 54, country: 'Ecuador' },
            { name: 'Michael',   email: 'michael@email.com',   age: 15, country: 'Colombia' },
            { name: 'Nicolás',   email: 'nicolas@email.com',    age: 43, country: 'Colombia' }
        ];

        // test2 : server async load
        vm.selected2 = [];

        function getEmailAsync(url) {
            server.get(url).success(function (response) {
                // name, email, age, country
                // Id, ContactReference, ContactId, CustomerId, Email, EmailAddress, FirstName, LastName, LastUsedOn
                vm.response = response;
                console.log(response);

            });
        }

        function init() {
            // set timeout 10s
            // old path : 'entity/contacts/index?EmailContactPersons=true'
            // new path : '/api/comms/email/addresses
            var setTimeOut = $timeout(function(){
                getEmailAsync('/api/comms/email/addresses');
            }, 10000);
        }

        init();

    }

    /**
     * AngularJS default filter with the following expression:
     * "person in people | filter: {name: $select.search, age: $select.search}"
     * performs an AND between 'name: $select.search' and 'age: $select.search'.
     * We need to perform an OR.
     */
    app.filter('propsFilter', function() {
        return function(items, props) {
            var out = [];

            if (angular.isArray(items)) {
                var keys = Object.keys(props);

                items.forEach(function(item) {
                    var itemMatches = false;

                    for (var i = 0; i < keys.length; i++) {
                        var prop = keys[i];
                        var text = props[prop].toLowerCase();
                        if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                            itemMatches = true;
                            break;
                        }
                    }

                    if (itemMatches) {
                        out.push(item);
                    }
                });
            } else {
                // Let the output be the input untouched
                out = items;
            }

            return out;
        };
    });
})();
