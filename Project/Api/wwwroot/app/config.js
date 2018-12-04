/* globals angular toastr  */

(function () {
    'use strict';

    var app = angular.module('app');

    var events = {
        userSignedIn: 'user.signedIn',
        userSignedOut: 'user.signedOut',
        refreshData: 'ux.refreshData',
        recalcData: 'ux.recalcData', //used for 'refreshes' that do not involve calling the server
        expandAddress: 'ux.expandAddress',
        setVideoUrl: 'ux.setVideoUrl',
		mapReady: 'ux.mapReady',
        uploadNewFile: 'ux.uploadNewFile',
        uploadFinishedAll: 'ux.uploadFinishedAll',
        uploadFinishedItem: 'ux.uploadFinishedItem',
        refreshSystemAlerts: 'ux.refreshSystemAlerts',
        noItemsInTaskList: 'mtkTaskList.noItems',
        currentFileProcessed: 'files:currentFileProcessed',

        ajaxDone: 'ajax.done',
        serverDisconnected: 'server:disconnected',
        serverReconnected: 'server:reconnected',
        updateFilters: 'ux.updateFilters'
    };

    var PATH_MAP = {
       
    };

    var config = {
        version: MTK_VER,
        appErrorPrefix: '[MTK Error] ', //Configure the exceptionHandler decorator
        docTitle: 'Veriface: ',
        events: events,
        session: null,
        sessionTimeoutUrl: '/signin.html?error=Your+session+has+expired.+Please+sign+in+again.',
        pastRoutes: [],
        pageSize:50,
        routeBack: function () {
            this.pastRoutes.shift();
            var url = this.pastRoutes.shift();
            window.location = url;
        },
        enabledProviders: null,
        PATH_MAP: PATH_MAP,
    };

    app.value('config', config);

    app.config(['$logProvider', 'ChartJsProvider', function ($logProvider, chartJsProvider ) {
        // turn debugging off/on (no info or warn)
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(true);
        }
    }]);

    app.config(['$httpProvider', function($httpProvider) {
        // Force application id to be sent with every request

        var applicationId = 'Veriface WebApp ' + MTK_VER;
        $httpProvider.defaults.headers.common['x-application-id'] = applicationId;
        $.ajaxSetup({
            beforeSend: function(xhr) {
                xhr.setRequestHeader('x-application-id', applicationId);
            }
        });
    }]);
})();
