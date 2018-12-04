(function () {
    'use strict';

    angular.module('app').controller('testAngularSelectorController', ['$scope','server', 'ux', testAngularSelectorController]);

    function testAngularSelectorController($scope, server, ux) {

        var loadEmailPath = '/api/comms/email/addresses';
        var contactsLoaded = false;

        var vm = this;
        vm.contacts = [];
        vm.contactList = [];
        vm.Recipients = [];

        // message thread dto
        vm.dto = {
            Id: null,
            MessageThreadId: null,
            MemberId : null,
            ContactId: null,
            ContactPersonIds: [],
            Subject: '',
            BodyHtml: '',
            ToEmails: [],
            CcEmails: [],
            BccEmails: [],
            InReplyTo: ''
        };

        vm.isDisabled = undefined;
        vm.searchEnabled = undefined;

        var start = performance.now();
        server.get(loadEmailPath).success(function (data) {
            // prepare data for ui-select (vm.contacts)
            // Id, ContactReference, ContactId, CustomerId, Email, EmailAddress, FirstName, LastName, LastUsedOn
            vm.contacts = data;
            console.log('there are this many contacts :' + vm.contacts.length);
            // trim the data to the first 100 - for performance
            // vm.contacts = data.splice(0,100);
            vm.contactList = _.object(_.map(vm.contacts, function(item) {
                return [item.Email, item];
            }));

            // set contacts loaded flag
            contactsLoaded = true;
            var end = performance.now();
            var exectime = end - start;
            console.log('Loading email list time: ' + exectime);
        });

        vm.setInputFocus = function (){
            $scope.$broadcast('UiSelectDemo1');
        };

        vm.enable = function() {
            vm.isDisabled = false;
        };

        vm.disable = function() {
            vm.isDisabled = true;
        };

        vm.enableSearch = function() {
            vm.searchEnabled = true;
        };

        vm.disableSearch = function() {
            vm.searchEnabled = false;
        };

        vm.clear = function() {
            // vm.person.selected = undefined;
            // vm.address.selected = undefined;
            // vm.country.selected = undefined;
        };

        // this does not work in our page because binding to the model
        $scope.$watch('vm.Recipients', updateDto);

        function updateDto() {
            var resultArr = [];
            for (var i=0; i<vm.Recipients.length; i++) {
                var email = vm.Recipients[i];
                if (_.isEmpty(email)) { continue; }

                vm.found = vm.contactList[email];
                if (vm.found) {
                    // build obj
                    var contactDto = {
                        Id: (!_.isEmpty(vm.found.Id) ? vm.found.Id : null),
                        ContactId: (!_.isEmpty(vm.found.ContactId) ? vm.found.ContactId : null),
                        ContactReference: (!_.isEmpty(vm.found.ContactReference) ? vm.found.ContactReference : ''),
                        CustomerId: (!_.isEmpty(vm.found.CustomerId) ? vm.found.CustomerId : null),
                        Email: (!_.isEmpty(vm.found.Email) ? vm.found.Email : ''),
                        EmailAddress: (!_.isEmpty(vm.found.EmailAddress) ? vm.found.EmailAddress : ''),
                        FirstName: (!_.isEmpty(vm.found.FirstName) ? vm.found.FirstName : ''),
                        LastName: (!_.isEmpty(vm.found.LastName) ? vm.found.LastName : ''),
                        Name: (!_.isEmpty(vm.found.Name) ? vm.found.Name : '')
                        // LastUsedOn: (!_.isEmpty(vm.found.LastUsedOn) ? vm.found.LastUsedOn : '')
                    };
                    console.log('in updateDto - contact found');
                    console.log(contactDto);
                    resultArr.push(contactDto);
                } else {
                    console.log('in updateDto - contact not found');
                    var newContactDto = {
                        Name: '',
                        Email: email,
                        EmailAddress: '<' + email +'>'
                    };
                    console.log(newContactDto);
                    resultArr.push(newContactDto);
                }
            }
            // vm.dto.ToEmails = resultArr;
            angular.copy(resultArr, vm.dto.ToEmails);
        }

        vm.tagTransform = function(newTag) {
            return {
                Name: '',
                Email: newTag,
                EmailAddress: '<' + newTag +'>'
            };
        };

        vm.counter = 0;
        vm.onSelectCallback = function (item, model){
            vm.counter++;
            vm.eventResult = {item: item, model: model};

            // console.log(vm.eventResult);
            var re = /^([\w-\.]+@(?!gmail.com)(?!yahoo.com)(?!hotmail.com)([\w-]+\.)+[\w-]{2,4})?$/; //$ig
            var inputString = model;
            var found;
            /* jshint ignore:start */
            if (found = inputString.match(re))
            /* jshint ignore:end */
            {
                console.log('matching model - as input');
                console.log(found);
            }
        };

        // vm.updateContactsLookup = updateContactsLookup;
        // function updateContactsLookup(obj) {
        //     var key = obj.Email.toString();
        //     if (!_.isEmpty(key)) {
        //         vm.contacts.push(obj);
        //         // vm.contactList[email] = obj;
        //         vm.newEntryLookup[obj.Email] = obj;
        //
        //         _.extend(vm.contactList, vm.newEntryLookup);
        //     }
        // };
        /*

        // broken samples
        vm.Recipients = ['samantha@email.com','wladimir@email.com'];
        vm.contacts =[{
            "Id": "a62c0320-957c-44a3-b8a2-76d0cdbd14ad",
            "CustomerId": "a62c0320-949a-41b6-855d-964dc7cf9f0d",
            "Email": "nathanutama@propertyme.com",
            "LastUsedOn": "2016-06-26T23:46:14.0000000Z",
            "ContactId": "a62c0320-957c-483e-8abf-365aae802b88",
            "ContactReference": "Nathan Utama - PM & Another Me",
            "FirstName": "Nathan",
            "LastName": "Utama",
            "Name": "Nathan Utama",
            "EmailAddress": "Nathan Utama <nathanutama@propertyme.com>"
        },
        {
            "Id": "a634039f-60c6-4131-b56f-63632a941258",
            "CustomerId": "a62c0320-949a-41b6-855d-964dc7cf9f0d",
            "Email": "testing@testing.com",
            "LastUsedOn": null,
            "ContactId": "a62c0320-957c-483e-8abf-365aae802b88",
            "ContactReference": "Nathan Utama - PM & Another Me",
            "FirstName": "Another",
            "LastName": "Me",
            "Name": "Another Me",
            "EmailAddress": "Another Me <testing@testing.com>"
        },
        {
            "Id": "a63c0399-9b6c-4dd5-b4e4-dfe7f00967c9",
            "CustomerId": "a62c0320-949a-41b6-855d-964dc7cf9f0d",
            "Email": "bergy_nj@hotmail.com",
            "LastUsedOn": null,
            "ContactId": "a63c0399-9b5e-41a6-8997-0f7776cd5099",
            "ContactReference": "Spocky Spock",
            "FirstName": "Spock",
            "LastName": "My Property Owner",
            "Name": "Spock My Property Owner",
            "EmailAddress": "Spock My Property Owner <bergy_nj@hotmail.com>"
        },
        {
            "Id": "a63c039a-a1ed-44af-96a9-dab96a9d2c86",
            "CustomerId": "a62c0320-949a-41b6-855d-964dc7cf9f0d",
            "Email": "bergy_nj@yahoo.com",
            "LastUsedOn": null,
            "ContactId": "a63c039a-a1e6-4466-931f-76afd674ed98",
            "ContactReference": "Kirk Tenant My Property",
            "FirstName": "Kirk",
            "LastName": "Tenant My Property",
            "Name": "Kirk Tenant My Property",
            "EmailAddress": "Kirk Tenant My Property <bergy_nj@yahoo.com>"
        },{
            "Name": null,
            "Email": "Dude My Property Owner <testlalala@hotmail.com>",
            "EmailAddress": "Dude My Property Owner <testlalala@hotmail.com>",
        }];

        vm.invalidEmails = [{
            "Id": null,
            "ContactId": null,
            "ContactReference": "",
            "CustomerId": null,
            "Email": "Dude My Property Owner <testlalala@hotmail.com>",
            "EmailAddress": "Dude My Property Owner <testlalala@hotmail.com>",
            "FirstName": "",
            "LastName": "",
            "Name": "",
            "LastUsedOn": ""
        }];

        vm.nullEmails =  [{
            "Name": null,
            "Email": "Dude My Property Owner <testlalala@hotmail.com>",
            "EmailAddress": "Dude My Property Owner <testlalala@hotmail.com>",
        }];

        vm.emailToBeMerged =  [{
            "Name": "Samantha",
            "Email": "samantha@email.com",
            "EmailAddress": "Samantha <samantha@email.com>",
        }];
        */
    }
})();