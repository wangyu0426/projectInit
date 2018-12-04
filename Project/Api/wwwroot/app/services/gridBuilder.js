(function () {
    'use strict';

    var serviceId = 'gridBuilder';
    angular.module('app').factory(serviceId, ['textFormat', 'gridDetail', 'gridOnOff', 'labelsParser', '$compile', gridBuilder]);

	function gridBuilder (textFormat, gridDetail, gridOnOff, labelsParser, $compile) {

        function mergeTemplate(template, obj) {
            var result = template;
            for (var prop in obj) {
                var match = "[" + prop + "]";
                if (result.indexOf(match) > -1) {
                    result = result.replace(match, obj[prop]);
                }
            }
            return result;
        }

        function TableDef (url, container, selector, data) {
            var table = {
                selector: selector || "#grid",
                url: url,
                container: container,
                data: data,
                isServerSide: false,
                cols: [],
                colsToHide: [],
                detailRow: null,
                sortSpec: [
                    [ 1, "asc" ]
                ],
                groupCol: null,
                class: '',
                enableOpenRow: false,
                selectableCondition: function() { return true; },
                selectedOnDefault: function() { return false; }
            };

            function addCellWrapper (txt) {
                return '<span class="grid-td-inner">' + (txt ? txt : '' ) + '</span>';
            }

            function createRenderer(fn) {
                return  function render (value, action, obj) {
                    var v = value;
                    if (typeof value !== 'object') {
                        v = textFormat.escapeHtml(value);
                    }

                    return addCellWrapper(fn(v, action, obj));
                };
            }

            function simpleRenderer(value) {
                return value;
            }

            this._data = table;

            this.getDef = function () {
                return this._data;
            };

            this.serverSide = function () {
                table.isServerSide = true;
                return this;
            };

            this.groupBy = function (fieldName, excludeCols) {
                table.groupCol = fieldName;

                for (var e = 0; e < excludeCols.length; e++) {
                    for (var c = 0; c < table.cols.length; c++) {
                        if (table.cols[c].mData === excludeCols[e]) {
                            table.cols[c].noGroup = true;
                        }
                    }
                }
                return this;
            };

            this.selectableCondition = function (fn) {
                table.selectableCondition = fn;
                return this;
            };

            //this allows you to choose which rows will be marked as selected by default - parameter should be a function of the form fn(rowObject) that returns true if that row is to be selected on default
            this.selectedOnDefault = function (fn) {
                table.selectedOnDefault = fn;
                return this;
            };

            //this allows you to say the entire grid should be selected on defualt
            this.selectAllByDefault = function () {
                table.selectAllByDefault = true;
                return this;
            };

            this.hideableColumns = function (cols) {
                table.colsToHide = cols;
                return this;
            };

            this.disableFilter = function () {
                table.disabledFilter = true;
                return this;
            };

            this.sort = function (index, direction) {
                // only sort for first 12 columns
                if(index < 13) {
                    table.sortSpec = [[index, direction]];
                }

                return this;
            };

            this.andThenSort = function (index, direction) {
                // only sort for first 9 columns
                if(index < 10 && table.sortSpec.length > 0) {
                    table.sortSpec.push([index, direction]);
                }

                return this;
            };

            this.disableSort = function() {
                table.sortSpec = [];
                return this;
            };

            this.openRow = function () {
                table.enableOpenRow = true;
                return this;
            };

            this.textCol = function (title, field, width, className) {
                table.cols.push({
                    mData: field || title,
                    sTitle: title,
                    sWidth: width || '8%',
                    sClass: className || null, //,
                    mRender: createRenderer(simpleRenderer)
                });
                return this;
            };

            this.blankCol = function () {
                table.cols.push({
                    mData: null,
                    sTitle: '',
                    mRender: function() {return '&nbsp;';},
                    bSortable: false
                });
                return this;
            };

            // TenantInvoiceType => Tenant Invoice Type
            this.enumCol = function (title, field, width) {
                table.cols.push({
                    mData: field || title, sTitle: title, sWidth: width || '8%',
                    mRender: createRenderer(function (value) {
                        var result = '';

                        if (angular.isDefined(value) && value !== null) {
                            result = String(value).fromEnumToSentence();
                        }
                        return result;
                    })
                });
                return this;
            };

            this.textColFromObject = function (title, field_object, property, width, visible) {
                if (_.isUndefined(visible)) {
                    visible = true;
                }
                table.cols.push({
                    mData: field_object || title, sTitle: title, sWidth: width || '8%',
                    mRender: createRenderer(function (value) {
                        var result = "", comma = "";
                        for (var i in value) {
                            if (i === property) {
                                result = value[i];
                                break;
                            }
                        }
                        return result;
                    }),
                    bVisible: visible,
                    bSortable: false
                });
                return this;
            };

            this.textColFromArray = function (title, field) {
                table.cols.push({
                    mData: field || title, sTitle: title,
                    mRender: createRenderer(function (value) {
                        var result = "", comma = "";
                        value.forEach(function (item) {
                            result += comma + item.charAt(0).toUpperCase() + item.slice(1);
                            if (comma === "") comma = ", ";
                        });
                        return result;
                    })
                });
                return this;
            };

            this.textColSentence = function (title, field, width) {
                table.cols.push({
                    mData: field || title, sTitle: title, sWidth: width || '8%',
                    mRender: createRenderer(function (value) {
                        return value.charAt(0).toUpperCase() + value.slice(1);
                    })
                });
                return this;
            };

            this.hiddenCol = function (field) {
                table.cols.push({
                    mData: field,
                    bVisible: false
                });
                return this;
            };

            this.dateCol = function (title, field, width) {
                table.cols.push({
                    mData: field || title,
                    sTitle: title,
                    sClass: "col-date", sWidth: width || '8%',
                    sType: "date",
                    mRender: function (value, action, obj) {
                        if (action === 'display') {
                            return textFormat.date(value);
                        } else {
                            return value;
                        }
                    }
                });
                return this;
            };

            this.dateLinkCol = function (title, field, url,  width) {
                table.cols.push({
                    mData: field || title, sTitle: title,
                    sClass: "col-date", sWidth: width || '8%',
                    sType: "date",
                    mRender: createRenderer(function (value, action, obj) {
                        if (value) {
                            return "<a href='" + mergeTemplate(url, obj) + "'" + ">" + textFormat.date(value) + "</a>";
                        } else {
                            return "";
                        }
                    })
                });
                return this;
            };

            this.dateTimeCol = function (title, field, width) {
                table.cols.push({
                    mData: field || title, sTitle: title,
                    sClass: "col-date", sWidth: width || "16%",
                    sType: "numeric",
                    mRender: createRenderer(function (value, action, obj) {
                        if (action === 'display') {
                            return textFormat.dateTime(value);
                        } else {
                            return moment(value).unix();
                        }
                    })
                });
                return this;
            };

            this.amountCol = function (title, field, width) {
                table.cols.push({
                    mData: field || title, sTitle: title,
                    sClass: "col-amount", sWidth: width || "8%",
                    sType: "numeric",
                    mRender: function (value, action, obj) {
                        if (action === 'display') {
                            return textFormat.currency(value, '');
                        } else {
                            return value;
                        }
                    }
                });
                return this;
            };

            this.amountWithEmptyCol = function (title, field, width) {
                table.cols.push({
                    mData: field || title, sTitle: title,
                    sClass: "col-amount", sWidth: width || "8%",
                    sType: "numeric",
                    mRender: function (value, action, obj) {
                        if (action === 'display') {
                            if (value !== 0) {
                                return textFormat.currency(value);
                            } else {
                                return "";
                            }
                        } else {
                            return value;
                        }
                    }
                });
                return this;
            };

            this.numberOpenCol = function (title, field) {
                table.cols.push({
                    mData: field,
                    sTitle: title,
                    sType: 'numeric',
                    sClass: 'col-amount',
                    mRender: function (value, action) {
                        if (action === 'display') {
                            return '#' + value;
                        } else {
                            return value;
                        }
                    }
                });
                return this;
            };

            this.padNumberCol = function (title, field, size, width, url) {
                table.cols.push({
                    mData: field || title, sTitle: title,
                    sClass: "col-amount",
                    sWidth: width || '8%',
                    sType: "numeric",
                    mRender: function (value, action, obj) {
                        if (value) {
                            var result = size === 0 ? value : textFormat.padNumber(value, size);
                            if(url) {
                                return "<a href='" + mergeTemplate(url, obj) + "' " +  " >" + result + "</a>";
                            }else{
                                return result;
                            }
                        } else {
                            return "";
                        }
                    }
                });
                return this;
            };

            this.padNumberWithEmptyCol = function (title, field, size, width) {
                table.cols.push({
                    mData: field || title, sTitle: title, sClass: "col-amount",
                    sWidth: width || '8%',
                    sType: "numeric",
                    mRender: function (value, action, obj) {
                        if (action === 'display') {
                            if (value > 0) {
                                return textFormat.padNumber(value, size || 6);
                            } else {
                                return "";
                            }
                        } else {
                            return value;
                        }
                    }
                });
                return this;
            };

            this.boolCol = function (title, field, width) {
                table.cols.push({
                    mData: field || title, sTitle: title,
                    sClass: "col-bool",
                    sWidth: width || '32px',
                    mRender: function (value, action) {
                        if (action === 'display') {
                            return value ? '<i class="icon-ok"></i>' : '';
                        } else {
                            return value;
                        }
                    }
                });
                return this;
            };

            this.numberCol = function (title, field, width, sClass) {
                table.cols.push({
                    mData: field || title, sTitle: title,
                    sClass: sClass || "col-amount",
                    sWidth: width || '8%',
                    sType: "numeric",
                    mRender: function (value, action, obj) {
                        if (action === 'display') {
                            return textFormat.integer(value);
                        } else {
                            return value;
                        }
                    }
                });
                return this;
            };

            this.floatCol = function (title, field, width, sClass) {
                table.cols.push({
                    mData: field || title, sTitle: title,
                    sClass: sClass || "col-amount",
                    sWidth: width || '8%',
                    sType: "numeric",
                    mRender: function (value, action, obj) {
                        if (action === 'display') {
                            return value;
                        }
                    }
                });
                return this;
            };

            this.percentCol = function (title, field, width) {
                table.cols.push({
                    mData: field || title, sTitle: title,
                    sClass: "col-amount",
                    sWidth: width || '8%',
                    sType: "numeric",
                    mRender: function (value) {
                        return textFormat.decimal(value, 1) + '%';
                    }
                });
                return this;
            };

            this.contactLinkCol = function (title, field, idField, width) {
                table.cols.push({
                    mData: field || title, sTitle: title, sWidth: width || '8%',
                    mRender: createRenderer(function (value, display, obj) {
                        if (value) {
                            return '<a href="/#/contact/card/' + obj[idField] + '" > <i class="icon-user"></i> ' +
                                 value + '</a>';
                        } else {
                            return '';
                        }
                    })
                });
                return this;
            };

            this.lotLinkCol = function (title, field, idField, width) {
                table.cols.push({
                    mData: field || title, sTitle: title, sWidth: width || '8%',
                    mRender: createRenderer(function (value, display, obj) {
                        if (value) {
                            return '<a href="/#/property/card/' + obj[idField] + '" > <i class="icon-home"></i> ' +
                                 value + '</a>';
                        } else {
                            return '';
                        }
                    })
                });
                return this;
            };

            this.openCol = function (title, field, width) {
                table.cols.push({
                    mData: field || title, sTitle: title, sWidth: width || '8%',
                    mRender: createRenderer(function (value, ar1, obj) {
                        if (value) {
                            return "<a href='' class='open' >" + value + "</a>";
                        } else {
                            return "";
                        }
                    })
                });
                return this;
            };

            this.linkCol = function (title, field, url, width, openInNewTab) {
                table.cols.push({
                    mData: field || title, sTitle: title, sWidth: width || '8%',
                    mRender: createRenderer(function (value, ar1, obj) {
                        if (value) {
                            return "<a href='" + mergeTemplate(url, obj) + "' " + (openInNewTab ? " target='_blank' " : "") + " >" + value + "</a>";
                        } else {
                            return "";
                        }
                    })
                });
                return this;
            };

            this.linkColWithDefaultText = function (title, field, url, width, openInNewTab, defaultText) {
                table.cols.push({
                    mData: field || title, sTitle: title, sWidth: width || '8%',
                    mRender: createRenderer(function (value, ar1, obj) {
                        if (!value) {
                            value = defaultText;
                        }
                        return "<a href='" + mergeTemplate(url, obj) + "' " + (openInNewTab ? " target='_blank' " : "") + " >" + value + "</a>";
                    })
                });
                return this;
            };

            this.linkColFromArray = function (title, field, url, width, openInNewTab) {
                table.cols.push({
                    mData: field || title, sTitle: title, sWidth: width || '8%',
                    mRender: createRenderer(function (value) {
                        var result = '', comma = '';
                        value.forEach(function (item) {
                            result += comma + '<a href="' + mergeTemplate(url, item) + '" ' + (openInNewTab ? ' target="_blank" ' : '') + ' >' + item.Reference + '</a>';
                            if (comma === '') comma = ', ';
                        });
                        return result;
                    })
                });
                return this;
            };

            this.iconLinkCol = function (title, field, url, icon, width, hiddenField) {
                table.cols.push({
                    mData: field || title, sTitle: title,
                    sWidth: width || '32px',
                    sClass: "col-icon",
                    mRender: function (value, ar1, obj) {
                        if (value) {
                            return hiddenField && obj[hiddenField] ? "" : "<a target='_blank' href='" + mergeTemplate(url, obj) + "'><i class='" + icon + " icon-large'></i></a>";
                        } else {
                            return "";
                        }
                    }
                });
                return this;
            };

            this.timeLinkCol = function (title, field, url, width) {
                table.cols.push({
                    mData: field || title, sTitle: title,
                    sClass: "col-date", sWidth: width || '8%',
                    sType: "date",
                    mRender: createRenderer(function (value, action, obj) {
                        if (value) {
                            return "<a href='" + mergeTemplate(url, obj) + "'" + ">" + textFormat.timeLocal(value) + "</a>";
                        } else {
                            return "";
                        }
                    })
                });
                return this;
            };

            this.timeCol = function (title, field, url, width) {
                table.cols.push({
                    mData: field || title, sTitle: title,
                    sClass: "col-date", sWidth: width || '8%',
                    sType: "date",
                    mRender: function (value) {
                        return value ? textFormat.timeString(value) : "";
                    }
                });
                return this;
            };

            this.labelCol = function (title, field, width, $scope, entityType) {
                table.cols.push({
                    mData: field || title,
                    sTitle: title,
                    sClass: '',
                    sWidth: width || '20%',
                    mRender: function () {
                        return '<div class="grid-td-inner"><span ng-repeat="label in labels.array | limitTo: 5" mtk-tooltip data-original-title="{{label.name}}" class="label label-default" ' +
                            'ng-class="{\'label-info\': label.priority === \'Info\', \'label-warning\': label.priority === \'Important\' }">' +
                            '{{label.name}}</span></div>';
                    },
                    fnCreatedCell: function(nTd, sData, oData) {
                        var cellScope = $scope.$new(true);

                        // the lableCol is common method to build lable column in Grid,
                        // the pramatter 'entityType' is an identity type (e.g. lot, job) to load different label templates in parseLabels function
                        // if the entityType is undefined, means the label column is used in Label Template list grid.
                        // just convert cellScope.labels value by object data.
                        if (typeof entityType !== 'undefined') {
                            cellScope.labels = labelsParser.parseLabels(sData, entityType);
                        }else {
                            cellScope.labels = { array: [{ name: oData.Name, priority: oData.Priority }]};
                        }

                        $compile(nTd)(cellScope);
                    },
                    bSortable: false
                });

                return this;
            };

            this.detailRow = function ( detailCol, templateUrl, addToScope, fnOpenOnLoad, hideCollapseBtn) {
                var fnRender = new gridDetail( templateUrl, addToScope, hideCollapseBtn).render;
                table.detailRow = { detailCol: detailCol, mRender: fnRender, fnOpenOnLoad: fnOpenOnLoad, hideCollapseBtn: hideCollapseBtn};
                return  this;
            };

            this.onOff = function (field, title, width, template,  fnLink) {
                var onOff = new gridOnOff(template, fnLink);
                var fnRender = onOff.render;
                var col= {
                    mData: field || title, sTitle: title,
                    sClass: "col-date", sWidth: width || '8%',
                    mRender: fnRender,
                    fnLink: fnLink
                };

                table.cols.push(col);

                table.fnLinkForEachRow = onOff.link;
                return  this;
            };

            this.custom = function (colObj) {
                table.cols.push(colObj);
                return this;
            };

            this.templateCol = function (title, field, width, className, $scope, templateUrl) {
                table.cols.push({
                    mData: field || title,
                    sTitle: title,
                    sClass: className || null,
                    sWidth: width || null,
                    mRender: function () {
                        return '<div class="grid-td-inner" ng-include="\'' + templateUrl + '\'"></div>';
                    },
                    fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                        var cellScope = $scope.$new();
                        cellScope.sData = sData;
                        cellScope.oData = oData;
                        cellScope.iRow = iRow;
                        cellScope.iCol = iCol;
                        $compile(nTd)(cellScope);
                    },
                    bSortable: false
                });

                return this;
            };

            this.clickableCol = function (title, field, width, callbackFn, $scope) {
                table.cols.push({
                    mData: field || title,
                    sTitle: title,
                    sWidth: width || null,
                    mRender: function (value, action) {
                        if (action === 'display') {
                            return '<a href="" ng-click="fn()">' + value || '' + '</a>';
                        } else {
                            return value;
                        }
                    },
                    fnCreatedCell: function (nTd, sData, oData) {
                        var cellScope = $scope.$new();
                        cellScope.fn = function() {
                            return callbackFn(oData);
                        };
                        $compile(nTd)(cellScope);
                    },
                    bSortable: true
                });

                return this;
            };
            this.comboCol = function ( title, field, width, callbackFn, source, $scope ) {
                table.cols.push( {
                    mData: field || title,
                    sTitle: title,
                    sWidth: width || null,
                    sClass:"overflow-visible",
                    mRender: function ( value, action ) {
                        if ( action === 'display' ) {
                            return '<mtk-lookup on-change="onChange(model)"model="model" source="source"></mtk-lookup>';
                        } else {
                            return value;
                        }
                    },
                    fnCreatedCell: function ( nTd, sData, oData ) {
                        var cellScope = $scope.$new();
                        cellScope.onChange = function ( model) {
                            callbackFn(oData,model)
                        };
                        cellScope.model = sData;
                        cellScope.source = source;
                        $compile( nTd )( cellScope );
                    },
                    bSortable: true
                } );

                return this;
            };

            this.thresholdFormat = function (field, fnCompare, lessThanClass, equalClass, greaterThanClass, removeOddEven) {
                table.thresholdFormat = {
                    field: field,
                    lessThanClass: lessThanClass,
                    equalClass: equalClass,
                    greaterThanClass: greaterThanClass,
                    fnCompare: fnCompare,
                    removeOddEven: removeOddEven
                };
                return this;
            };
        }

        return {
            TableDef: TableDef
        };
    }
})();
