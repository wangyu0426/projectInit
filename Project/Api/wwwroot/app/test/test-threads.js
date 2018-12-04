(function () {
    'use strict';

    var controllerId = 'testThreadsController';
    angular.module('app').controller(controllerId, ['$location', '$filter', '$routeParams', 'server', 'ux', createController]);

    function createController($location, $filter, $routeParams, server, ux) {
        var apiUrl = '/api/comms/threads/';
        var sendAdhocPath = '/api/comms/messages/sendadhoc';

        var vm = this;
        vm.reply = null;
        vm.sendReply = sendReply;
        vm.showReply = false;
        vm.replyToThis = replyToThis;
        vm.moveToSpam = moveToSpam;

        clearReplyDto();

        init();

        ///////////////////////////

        function init() {
            server.get(apiUrl + $routeParams.id)
            .success(function (dto) {
                vm.dto = dto;
                clearReplyDto();
                vm.replyDto.Subject = dto.Subject;
                vm.replyDto.ContactPersonIds = dto.ContactPersonIds;
                vm.replyDto.ContactId = dto.ContactId;
                vm.replyDto.MessageThreadId = dto.Id;
                vm.replyDto.InReplyTo = dto.DefaultReplyToId;
                vm.replyDto.ToEmails = dto.DefaultReplyToEmail;
                vm.replyDto.ToNames = dto.DefaultReplyToName;
                vm.statusClass = getStatusClass();
            });
        }

        function clearReplyDto() {
            vm.replyDto = {
                MessageType: 'Email',
                Subject: '',
                Body: '',
                ContactId: null,
                ContactPersonIds: [],
                CcEmails: '',
                BccEmails: '',
                ToEmails: null,
                ToNames: null,
                MessageThreadId: null,
                InReplyTo: null
            };
        }

        function replyToThis(msg) {
            vm.showReply = true;
            vm.replyDto.InReplyTo = msg.ReplyToId;
            vm.replyDto.ToEmails = msg.FromEmail;
            vm.replyDto.ToNames = msg.FromName;
        }

        function sendReply() {
            if (vm.isProcessing) { return; } //stops the send button being hit twice in a row
            vm.isProcessing = true;

            server.post(sendAdhocPath, vm.replyDto)
                .success(function (response) {
                    ux.alert.response(response);
                    vm.isProcessing = false;
                    if (response.IsSuccessful) {
                        vm.showReply = false;
                        init();
                    }
                }, function (response) {
                    vm.isProcessing = false;
                    ux.alert.warning(response, 'Send Reply');
                    return false;
                });
        }

        function getStatusClass() {
            if (vm.dto.Status === 'Pending') {
                return 'infobox-success';
            } else if (vm.dto.Status === 'Closed') {
                return 'infobox-info';
            }

            var daysAgo = ux.textFormat.daysAgo(vm.dto.LastMessageOn);
            if (daysAgo < 1) {
                return 'infobox-info';
            } else if (daysAgo < 3) {
                return 'infobox-warning';
            } else {
                return 'infobox-error';
            }
        }

        function moveToSpam() {
            if (vm.isProcessing) { return; } //stops the send button being hit twice in a row
            vm.isProcessing = true;

            server.post('/api/comms/threads/moveToSpam', { MessageThreadIds: [ vm.dto.Id ] })
                .success(function (response) {
                    vm.isProcessing = false;
                    if (response.IsSuccessful) {
                        $location.path('/test/inbox');
                    }
                    ux.alert.response(response);
                });
        }

    }
})();