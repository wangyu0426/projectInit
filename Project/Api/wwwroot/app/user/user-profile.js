(function () {
    angular.module('app').controller('userProfileController', ['$rootScope', 'server', 'ux', controller]);

    function controller($rootScope,  server, ux) {
        var vm = this;
        vm.dto = {};
        vm.emailModified = false;
        vm.save = save;
        vm.updateEmail = updateEmail;
        vm.awaitingConfirmation = false;
        vm.notificationTypes = ['All','Personal'];
        vm.isUploadingLogo = false;
        vm.onImageStatusChange = onImageStatusChange;
        vm.notificationTypes = [
            { Id: 'All', Name: 'All' },
            { Id: 'Personal', Name: 'Personal only' },
            { Id: 'PersonalAndUnassigned', Name: 'Personal and unassigned' }
        ];

        vm.froalaOptions = ux.froalaOptions(true, true);

        load();

        function load() {
            server.get('sec/user/')
                .success(prepare);
        }
        
        function prepare(data) {
            vm.dto = data;
        }

        function save(stop) {
            if (vm.emailModified)  {
                ux.alert.error('The email address has been modified. Please save changes to the email address first.');
                stop();
            } else {
                server.post('sec/user/', {
                    FirstName: vm.dto.FirstName,
                    LastName: vm.dto.LastName,
                    JobTitle: vm.dto.JobTitle,
                    MobilePhone: vm.dto.MobilePhone,
                    WorkPhone: vm.dto.WorkPhone,
                    NotificationPreference: vm.dto.NotificationPreference,
                    Preferences: vm.dto.Preferences,
                    IsNotifySensitiveChanges: vm.dto.IsNotifySensitiveChanges,
                    Signature: vm.dto.Signature
                })
                .success(function(response) {
                    ux.alert.response(response, 'Profile Saved');
                    $rootScope.isDarkMenuOn = vm.dto.Preferences && vm.dto.Preferences.IsDarkMenuOn;
                });
            }
        }

        function updateEmail() {
            ux.modal.confirm('Are you sure you want to change your email address to <b>' + vm.dto.RegisteredEmail + '</b>?', function (confirmed) {
                if (confirmed) {
                    server.post('sec/user/emailupdate', {
                        MemberId: vm.dto.MemberId,
                        RegisteredEmail: vm.dto.RegisteredEmail,
                        FirstName: vm.dto.FirstName
                    })
                        .success(function(response) {
                            if (!response.IsSuccessful) {
                                ux.alert.warning(response.Message, 'Change email');
                                return;
                            }

                            vm.emailModified = false;
                            vm.awaitingConfirmation = true;
                            ux.alert.response(response,'Change email');

                            ux.alert.success('We have sent an email to the ' + vm.dto.RegisteredEmail + '. Please confirm this change by clicking on the link in the email.');
                        });
                }

            });
        }


        function onImageStatusChange(isUploading, isDeleted){
            vm.isUploadingLogo = isUploading;

            if(!isUploading){

            }
        }
    }
})();
