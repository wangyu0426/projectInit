(function () {
    angular.module("app").service("dtoFactory", ['$http', '$timeout', 'logger', dtoFactoryService]);

    function dtoFactoryService ($http, $timeout, logger) {
        var prototypes = [];
        var guids = [];

        this.init = init;
        this.create = create;
        this.getGuids = getGuids;
        this.newGuid = newGuid;
        this.emptyGuid = "00000000-0000-0000-0000-000000000000";
        this.isEmptyId = isEmptyId;

        ////////////////////////////////////////////////////////////////////
        function init() {
            if (prototypes.length === 0) {
                prototypes = mtk_MODELS;
            }
            getGuids();
        }

        function create(typename) {
            var proto;

            for (var i = 0; i < prototypes.length; i++) {
                if (typename === prototypes[i].Item1) {
                    proto = prototypes[i].Item2;
                }
            }
            if (!proto) {
                throw new Error(typename + " not found. Cannot create model.");
            } else {
                return  angular.fromJson(proto);
            }
        }

        function getGuids() {
            $http.post('/api/entity/common/newids').success(function (data) {
                if (data) {
                    guids = data;
                }
            });
        }

        function newGuid() {
            if (guids.length < 10) {
                getGuids();
            }
            return guids.pop();
        }

        function emptyGuid() {
            return this.emptyGuid;
        }

        function isEmptyId(id) {
            return id === undefined || id === null || id === '' || id === this.emptyGuid;
        }

    }
})();