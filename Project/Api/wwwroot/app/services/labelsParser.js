(function () {
    'use strict';

    angular.module('app').service('labelsParser', ['server', service]);

    function service(server) {
        var self = this;

        self.labelTemplatePromiseDictionary = {};

        self.parseLabels = parseLabels;
        self.sortLabelsByPriority = sortLabelsByPriority;
        self.attachLabelPriority = attachLabelPriority;
        self.getLabelClass = getLabelClass;
        self.getLabelsString = getLabelsString;
        self.getLabelsInfo = getLabelsInfo;
        self.purgeCache = purgeCache;

        function parseLabels(labelString, type) {
            if(labelString && labelString.length > 2){
                var labelsArray = labelString.split('|');
                var labels = {
                    array: labelsArray.filter(function(value, index, self) {
                                            return (typeof value !== 'undefined') &&
                                                value !== null &&
                                                value !== '' &&
                                                self.indexOf(value) === index;
                                        }).map(function(label){
                                            return { name:label };
                                        })
                };

                if (typeof type !== 'undefined') {
                    type = type.toLowerCase();
                    if (typeof self.labelTemplatePromiseDictionary[type] === 'undefined' ||
                        self.labelTemplatePromiseDictionary[type] === null) {
                        self.labelTemplatePromiseDictionary[type] = server.getQuietly('/api/common/labels/template?type=' + type);
                    }

                    self.labelTemplatePromiseDictionary[type].success(function (systemLabels) {
                        labels.array = attachLabelPriority(labels.array, systemLabels);
                        labels.array = sortLabelsByPriority(labels.array);
                    });
                }

                return labels;
            }else{
                return { array: []};
            }
        }

        function attachLabelPriority(array, systemLabels) {
            for (var i = 0; i < array.length; i++) {
                var found = systemLabels.filter(function(systemLabel) {
                    return systemLabel.Name == array[i].name;
                });
                if (found.length > 0) {
                    array[i].priority = found[0].Priority;
                }
            }
            return array;
        }

        function sortLabelsByPriority(array) {
            array = array.sort(function(a, b) {
                var weightA = 0, weightB = 0;
                if (typeof a.priority === 'undefined') {
                    weightA = 0;
                } else if (a.priority === 'Info') {
                    weightA = 1;
                } else if (a.priority === 'Important') {
                    weightA = 2;
                }
                if (typeof b.priority === 'undefined') {
                    weightB = 0;
                } else if (b.priority === 'Info') {
                    weightB = 1;
                } else if (b.priority === 'Important') {
                    weightB = 2;
                }
                return weightB - weightA;
            });

            return array;
        }

        function getLabelClass(query) {
            switch (query[0].priority) {
                case 'Important':
                    return 'label-warning';

                case 'Info':
                    return 'label-info';

                default:
                    return 'label-default';
            }
        }

        function getLabelsString (labelsArray){
            if(labelsArray && labelsArray.length > 0){
                var nameArray = labelsArray.map(function(label){
                    return label.name;
                });
                var labelsString = '|' + nameArray.join('||') + '|';
                return labelsString;
            }else{
                return '';
            }
        }

        function getLabelsInfo(labelString){
            if(labelString && labelString.length > 2){
                var labels = labelString.split('|');
                labels = labels.filter(function(label){
                    return label && label.length > 0;
                });
                var labelsInfo = labels.join(',');
                labelsInfo = labelsInfo.replace(/^,|,$/g, ''); // remove start and end ,
                labelsInfo = labelsInfo.replace(/,/g, ', ');
                return labelsInfo;
            }
        }

        function purgeCache() {
            self.labelTemplatePromiseDictionary = {};
        }
    }
})();