(function () {
    'use strict';
    var EVERYTHING_ICON_CLASS = 'forest-green selected';
    var app = angular.module('app');
    app.directive('mtkDatatable', ['$timeout', 'logger', 'config', createDirective ]);

    function createDirective($timeout, logger, config) {
        var icon_detail_collapse = 'icon-minus', icon_detail_expand = 'icon-plus';

        // Uses DataTables.net
        var directive = {
            link: link,
            restrict: 'A',
            scope: {
                onChanged: '&',
                tableDef: '&mtkDatatable',
                filterBy: '=filterBy',
                entityName: '=',
                onLoad:'&'
            }
        };
        return directive;

        function link(scope, element) {
            var tableDef = scope.tableDef().getDef();
            var url = angular.isFunction(tableDef.url) ? tableDef.url() : tableDef.url;
            if ($(element).find('tbody').length > 0) {
                var existing = $(element).dataTable();
                existing.fnDestroy();
                $(element).empty();
            }
            //add the bootstrap table classes to the table
            $(element).addClass('table');

            var container = new GridContainer(element, tableDef, url, scope.onChanged, scope.entityName, scope.onLoad);

            var _timeout = null;
            scope.$watch('filterBy', function (newVal, oldVal) {
                if (newVal || oldVal !== newVal) {
                    container.doFilter(newVal);
                }
            });

            scope.$on(config.events.refreshData, function (e, newUrl) {
                if (newUrl && newUrl.length > 0) {
                    /**********/
                    /* The fnReloadAjax lib has been MODIFIED */
                    $(element).dataTable().fnReloadAjax(newUrl);
                } else if (newUrl && newUrl.replaceUrl) {
                    container.replaceUrl(newUrl.replaceUrl);
                } else {
                    container.refresh();
                }
            });

            //remove window resize listener
            scope.$on('$destroy', function() {
                $(window).off('resize');
            });
        }

        function GridContainer( DOMtable, tableDef, url, onChanged, entityName, onLoad) {
            var container = this;
            container.DataTable = null;
            container.isDynamicTotal = false;

            container.IdsForAllRecords = [];
            // to replace IdsForAllRecords
            container.SelectAllData = {
                totalRecords: 0 ,
                filterUrl: url
            };

            container.allowSelectEverything = false;
            var element;
            var lastRow = null;
            var rowClass = 'oddGroup';
            var unique_class_name = 'dataTable_' + Math.random().toString().substr(3, 7);
            var currentState = {
                name: unique_class_name,
                selectedCount: null,
                selectedIds: [],
                selectAllMode: null, //or 'page' or 'everything'
                filterCount: null,
                rowStart: null,
                rowEnd: null,
                rowCount: null,
                selectedRows: [],
                selectedAll: null,
                maxTotalRows: 0,
                isReachedActualTotal:false
            };
            DOMtable = $(DOMtable);
            tableDef = prepareTableDef(tableDef);

            container.getState = function () {
                currentState.selectedIds = [];
                // initialise the selectedRows array
                currentState.selectedRows = [];
                if (container.selectAllMode === 'everything') {
                    currentState.selectedIds = container.IdsForAllRecords;

                    currentState.selectedRows = container.DataTable.rows().data();

                    currentState.selectedAll = container.SelectAllData;
                    currentState.selectedCount = container.SelectAllData.totalRecords;
                } else {
                    if (!element) {
                        element = DOMtable.closest('.dataTables_wrapper');
                    }

                    element.find('td.col-select  .icon-grid-row-select.selected').each(function (i, el) {
                        currentState.selectedIds.push(container.DataTable.cell(el.parentNode).data());
                        // this adds each row to the selectedRows array
                    });

                    if (currentState.selectedIds.length > 0) {
                        currentState.selectedRows = _.filter(
                            container.DataTable.rows().data(), function(row) {
                                return _.contains(currentState.selectedIds, row.Id);
                            });
                    }

                    currentState.selectedAll = null;
                    currentState.selectedCount = currentState.selectedIds.length;
                }

                return currentState;
            };
            container.countSelected = function () {
                container.getState();

                getGridInfo();
                displayInfo();

                //onChanged is a function in the page controller
                if (onChanged && onChanged()) {
                    if(currentState.selectedAll){
                        currentState.selectedAll.searchText = currentState.searchText;
                    }
                    onChanged()(currentState);
                }
            };

            container.doFilter = function (f) {
                currentState.searchText = f;
                container.DataTable.search(f);
                container.DataTable.draw();
                displayInfo();
            };

            container.refresh = function () {
                container.DataTable.ajax.reload();
                displayInfo();
            };

            container.replaceUrl = function (replaceUrl) {
                var newUrl =  container.DataTable.ajax.url().replace(replaceUrl.oldValue, replaceUrl.newValue);
                $(DOMtable).dataTable().fnReloadAjax(newUrl);
                displayInfo();
            };

            // unused selectedRows feature
            //container.getSelectedRows = function () {
            //    return container.DataTable.rows({selected: true});
            //};

            createDataTable();

            //paging events - these fire at the very end, after drawTableCallback
            container.DataTable
                .on( 'xhr.dt', function ( e, settings, json, xhr) {
                    //when xhr finishes, hide spinner
                    $('.dataTables_paginate').show().parent().find('#datatables-paging-spinner').remove();
                    setSelectAll();
                    
                    DOMtable.removeClass('grid-is-loading');
                })
                .on('preXhr.dt', function() {
                    //when xhr begins
                    if ($('#datatables-paging-spinner').length === 0) {
                        $('.dataTables_paginate').hide().parent().append(
                            '<span id="datatables-paging-spinner" class="disp-ib padding-v6 padding-h6"><i class="icon-refresh icon-spin icon-large text-info" ></i></span>');
                    }
                    DOMtable.addClass('grid-is-loading');

                });

            return container;

            function setSelectAll(){
                //only allow select everything if there is > 1 page of records
                container.allowSelectEverything = (container.DataTable.page.info().pages > 1 && container.SelectAllData.totalRecords > config.pageSize );

                if (tableDef.selectAllByDefault) {
                    if (container.allowSelectEverything) {
                        //more than a page of records
                        container.selectAllMode = 'everything';
                    } else {
                        //only one page of records
                        container.selectAllMode = 'page';
                    }
                    markEveryRecordBasedOnSelectAllMode();
                    tableDef.selectAllByDefault = false; //reset this value, so that it only selects everything on default on the first page, once the user starts paging, they don't want it to reselect everything
                } else {
                    container.selectAllMode = null;
                }

                container.countSelected();
            }
            function createDataTable() {
                container.DataTable = DOMtable.DataTable({
                    uniqueClassName:unique_class_name,
                    aaData: tableDef.data,
                    bServerSide: tableDef.isServerSide,
                    bDestroy: false,
                    deferRender: true,
                    bRetrieve: true,
                    bAutoWidth: false,
                    bPaginate: true,
                    iDisplayLength: config.pageSize,
                    bProcessing: tableDef.isServerSide,
                    sAjaxDataProp: tableDef.isServerSide ? 'aaData' : '',
                    sAjaxSource: url,
                    aoColumns: prepareColumns(tableDef).cols,
                    aaSorting: tableDef.sortSpec, //don't use passed sort variable, use this object's own sort property sort,
                    oLanguage: {
                        sLoadingRecords: '<span class="grid-loading"><i class="icon-refresh icon-spin"></i> Loading...</span>',
                        sProcessing: '<span class="grid-loading"><i class="icon-refresh icon-spin"></i> Loading...</span>',
                        sZeroRecords: '<div class="grid-no-records"><div class="text-muted">(no records)</div></div>'
                    },
                    sDom: '<" ' + unique_class_name + ' table-container " <"grid-header-container"> t <"grid-footer-container" <"footer-tools"<"pull-right" p><"grid-info" r>>>>',
                    fnDrawCallback: drawTableCallback,
                    fnRowCallback: drawRowCallback,
                    fnServerData: serverData
                });

                if (tableDef.enableOpenRow) {
                    DOMtable.addClass('open-row');
                }
            }

            function prepareColumns(tableDef) {
                //add the hide if narrow class where necessary
                tableDef.colsToHide.forEach(function(coltitle) {
                    tableDef.cols.getBy('sTitle', coltitle).sClass += ' hide-on-narrow-screens';
                });

                return tableDef;

            }

            function serverData(sSource, aoData, fnCallback, oSettings) {
                oSettings.jqXHR = $
                    .getJSON(sSource, aoData, function(json) {
                        fnCallback(json);
                        
                        //get the ids for every record this grid fitler has returned and store it
                        container.IdsForAllRecords = json.allIds || [];
                        container.SelectAllData.totalRecords = json.iTotalRecords;
                        container.isDynamicTotal = json.isDynamicTotal;
                        if ( onLoad && onLoad() ) {
                            onLoad()( json );
                        }
                        //we have overwritten the serverData function, thus we need to manually  trigger datatables' xhr event
                        DOMtable.trigger('xhr.dt');
                    })
                    .fail(serverError);

            }

            function serverError(data, statusText, error) {
                if (data.status === 401) {
                    window.location = config.sessionTimeoutUrl;
                } else if (data.status === 403) {
                    //permission fail
                    var msg = data.statusText || 'You do not have permission to view this data.';
                    $('.grid-loading').html('<span class="DarkGrey"><i class="icon-ban-circle DarkGrey"></i>' + msg + '</span> ');
                    $('.footer-tools').addClass('permission-denied-diagonal-stripe-background');
                } else {
                    logger.logError(error + ': ' + this.url);
                }
            }

            function prepareTableDef(tableDef) {
                // for checkbox or expansion button
                //first, delete the first column from before
                if (tableDef.cols[0].mData === 'Id') {
                    tableDef.cols.shift();
                }
                if ( tableDef.detailRow && !tableDef.detailRow.hideCollapseBtn) {
                    //if a detailRow is included, don't show check box, instead show expansion button
                    tableDef.cols.unshift({
                        mData: 'Id',
                        bSortable: false,
                        sTitle: '&nbsp;',
                        sClass: 'col-expand',
                        sWidth: '32px',
                        mRender: function (idValue, arg1, arg2) {
                            return  '<i class="muted ' + icon_detail_expand + '" data-id="' + idValue + '"></i>';
                        }
                    });
                } else if (tableDef.selectableCondition) {
                    tableDef.cols.unshift({
                        mData: 'Id',
                        bSortable: false,
                        sTitle: '<i id="selectAll" class="icon-grid-row-select"></i><span class="grid-select-all-badge">0</span> ',
                        sClass: 'col-select overflow-visible position-r',
                        sWidth: '32px',
                        mRender: function (idValue, arg2, parentRow) {
                            if (tableDef.selectableCondition(parentRow)) {
                                //selectableCondition returns whether to allow selection
                                if (tableDef.selectedOnDefault(parentRow)) {
                                    return  '<i class="icon-grid-row-select selected" data-id="' + idValue + '"></i>';
                                } else {
                                    return  '<i class="icon-grid-row-select" data-id="' + idValue + '"></i>';
                                }
                            } else {
                                return  ' &nbsp; ';
                            }
                        }
                    });
                }
                return tableDef;
            }

            function getGridInfo() {
                if (!container.DataTable) return;
                var p = container.DataTable.page.info();
                currentState.filterCount = p.recordsDisplay;
                currentState.totalCount = p.recordsTotal;
                currentState.rowCount = p.end - p.start; //(p.length -is just the page length limit, not the actual count for this page)
                currentState.rowStart = p.start;
                currentState.rowEnd = p.end;
            }
            function displayInfo() {
                var h = '', c = currentState;
               
                if (!element) {
                    element = DOMtable.closest('.dataTables_wrapper');
                }

                if (angular.isDefined(c) && (angular.isDefined(c.selectedIds) || c.selectedAll) && angular.isDefined(c.totalCount)) {
                    // Support a dynamic row count to reduce the query cost of fetching all rows
                    var totalRowsStr = c.totalCount + ' ';
                    c.maxTotalRows = Math.max(c.totalCount, c.maxTotalRows);
                    if ( container.isDynamicTotal ) {
                        totalRowsStr = c.maxTotalRows + ( c.isReachedActualTotal ? ' ' : '+ ' );
                    }
                    if ( !container.isDynamicTotal && !c.isReachedActualTotal ) {
                        c.isReachedActualTotal = true;
                    }
                    var total = totalRowsStr + getEntityName(c.totalCount);

                    if (c.filterCount !== c.totalCount) {
                        total = c.filterCount + ' ' + getEntityName(c.filterCount) +
                             ' (filtered from ' + totalRowsStr + ')';
                    }
					h = 'Showing ' + (c.rowStart + 1) + ' to ' + c.rowEnd + ' of ' + total + ' ';

                    if (container.selectAllMode === 'everything') {
                        h = '<i class="icon-grid-row-select ' + EVERYTHING_ICON_CLASS + '  mgr-3"></i > <span class="forest-green mgr-6">' + container.SelectAllData.totalRecords + ' selected</span>' +
                            h	;
                    } else if (c.selectedIds.length > 0) {

                        h = '<i class="icon-grid-row-select selected navy mgr-3"></i > <span class="navy mgr-6">' + c.selectedIds.length + ' selected</span>' +
							h	;
                    }

                    if (c.totalCount === 0) {
                        //empty
                        h = '0 ' + getEntityName(0);
                    }

                    //var csvUrl = url.indexOf('?') >= 1 ? '&format=csv' : '?format=csv';
                    //h +=  ' &nbsp;<a href="' + url + csvUrl + '"><i class="icon-download icon-large"></i></a>';

                    refreshSelectAllButton();

                }
                element.find('.grid-info').html(h);
            }

            function markEveryRecordBasedOnSelectAllMode() {
                if (!element) {
                    return;
                }

                element.find('td.col-select i').removeClass('selected ' + EVERYTHING_ICON_CLASS);
                if (container.selectAllMode === null) {
                    return;
                }
                if (container.selectAllMode === 'page') {
                    element.find('td.col-select i').addClass('selected');
                }
                if (container.selectAllMode === 'everything') {
                    element.find('td.col-select i').addClass(EVERYTHING_ICON_CLASS);
                }

            }
            function refreshSelectAllButton() {
                var i = element.find('i#selectAll');
                var badge = i.next('.grid-select-all-badge');
                badge.removeClass('everything page');
                i.removeClass('selected ' + EVERYTHING_ICON_CLASS);

                if (container.selectAllMode === 'everything') {
                   i.addClass(EVERYTHING_ICON_CLASS);
                    badge.html(currentState.selectedCount + ' of ' + currentState.totalCount).addClass('everything').show();
                } else {
                    if (currentState.selectedCount === currentState.rowCount && currentState.selectedCount > 0) {
                        i.addClass('selected');
                        badge.html('<b>' + currentState.selectedCount  + '</b> of ' + currentState.totalCount).addClass('page').show();
                    } else {
                        i.removeClass('selected');
                        badge.hide();
                    }
                }
                if (currentState.totalCount === 0) {
                    i.hide();
                } else {
                    i.show();
                }
            }

            function getEntityName(count) {
                if (entityName.name) {
                    if (count === 1) return entityName.name;
                    return entityName.pluralName || entityName.name + 's';
                } else {
                    if (count === 1) return entityName;
                    return entityName + 's';
                }
            }

            function drawTableCallback() {
                element = DOMtable.closest('.dataTables_wrapper');
                addSelectionBehaviour();

                $(element).find('.arrearsBadge').tooltip();//add tooltip hovers for arrears badges
                if (tableDef.detailRow) addDetailRows(); //add detail row click event

                currentState.selectedIds = []; //reset
                currentState.selectedAll = null; // reset

                container.getState();

                fixUI();
            }

            function drawRowCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                if (tableDef.groupCol) {
                    if (iDisplayIndex === 0) {
                        lastRow = null;
                    }
                    if (lastRow && lastRow[tableDef.groupCol] !== aData[tableDef.groupCol]) {
                        if (rowClass === 'oddGroup') {
                            rowClass = 'evenGroup';
                        }
                        else {
                            rowClass = 'oddGroup';
                        }
                    }
                    $(nRow).addClass(rowClass);
                    lastRow = aData;
                }

                //add details row data
                if (tableDef.detailRow) {
                    var rowD = aData;
                    var d = aData[tableDef.detailRow.detailCol];
                    var packet = {rowData: rowD, detailData: d};
                    //this will execute before drawTableCallback which adds the detail rows,
                    //but we want to run fnOpenOnLoad in the context of the row,
                    //so we run it here, and add a flag to the data packet, if necessary
                    if (tableDef.detailRow.fnOpenOnLoad) {
                        packet.openOnLoad =  (tableDef.detailRow.fnOpenOnLoad(rowD));
                    }
                    $(nRow).data(packet);
                }

                if (tableDef.thresholdFormat) {
                    if (tableDef.thresholdFormat.removeOddEven) {
                        //remove odd/even
                        $(nRow).removeClass('odd').removeClass('even');
                    }
                    var v = aData[tableDef.thresholdFormat.field];
                    var chk = tableDef.thresholdFormat.fnCompare(v);
                    if (chk < 0) {
                        $(nRow).addClass(tableDef.thresholdFormat.lessThanClass);
                    } else if (chk === 0) {
                        $(nRow).addClass(tableDef.thresholdFormat.equalClass);
                    } else if (chk > 0) {
                        $(nRow).addClass(tableDef.thresholdFormat.greaterThanClass);
                    }
                }

                // link onOff event after row rendered, to fix the scope doesn't always existing issue
                if(tableDef.fnLinkForEachRow){
                    tableDef.fnLinkForEachRow($(nRow));
                }

                //make sure each td has a width attribute
                var tds = $(nRow).find('td');
                var cols = getVisibleCols();
                cols.forEach(function(colDef, i) {
                    tds[i].style.width = (colDef.sWidth);
                });

                function getVisibleCols() {
                    return tableDef.cols.filter(function (col) { return col.bVisible !== false; });
                }
            }

            function addSelectionBehaviour() {
                if (container.addedEvents || !container.DataTable) return;
                container.addedEvents = true;
                // Selecting individual row - td
                container.DataTable.on('click.gridSelectRow', 'td.col-select', function (ev) {
                    var $cell = $(ev.target).closest('td');

                    if (container.selectAllMode === 'everything') {
                        //means the user no longer wants to select everything, they just want this oen row
                        container.selectAllMode = null;
                        markEveryRecordBasedOnSelectAllMode();
                    } else  {
                        //means either the user has previously selected all and  the user wants to remove this record from their selection
                        //or they are just toggling it in the normal way
                        //either way once they have toggled a record, the select all mode goes back to null
                        container.selectAllMode = null;
                        $cell.find('i').toggleClass('selected');
                    }

                    container.countSelected();
                    refreshSelectAllButton();
                });

                // Clicking header (th) = select all
                container.DataTable.on('click.gridSelectAll', 'th.col-select', function (ev) {
                    //event might be on the i, or on its parent
                    var i = $(ev.target).closest('th').find('i#selectAll');

                    container.selectAllMode = threeStateToggle(container.selectAllMode);
                    markEveryRecordBasedOnSelectAllMode();
                    refreshSelectAllButton();
                    container.countSelected();

                    function threeStateToggle(s) {
                        if (container.allowSelectEverything ) {
                            //allow user to select "everything"
                            if (s === 'page') return 'everything';
                            if (s === 'everything') return null;
                            return 'page';
                        } else {
                            if (s === 'page') return null;
                            return 'page';
                        }

                    }
                });
            }

            function addDetailRows() {
                var tableObj = $(DOMtable).dataTable();
                if ( !tableDef.detailRow.hideCollapseBtn ) {
                    DOMtable.find( 'tbody > tr' ).click( function () {
                        var tr = this, $tr = $( tr );
                        if ( tableObj.fnIsOpen( this ) ) {
                            hideDetail( $tr );
                        } else {
                            showDetail( $tr );
                        }
                    } );
                }
                

                DOMtable.find('tbody > tr').each(function () {
                    var tr = this, $tr = $(tr);
                    if ($tr.data('openOnLoad')) {
                        showDetail($tr);
                    }
                });

                function showDetail(tr) {
                    var detailData = tr.data('detailData'),
                        rowData = tr.data('rowData'),
                        renderFn = tableDef.detailRow.mRender,
                        html = renderFn.call(this, detailData, rowData);

                    //make a new row using datatables fnOpen
                    var newRow = $(tableObj.fnOpen(tr[0], html));
                    newRow.addClass('details');

                    //by default datatables creates a new tr with a new td of colspan equal to how many columns there are in the table,

                    //we need to add the expand/collapse button as another column
                    var bigCol = newRow.find('td[colspan]'), //the big column with our new row
                        colspan = bigCol.attr('colspan');
                    
                    if ( !tableDef.detailRow.hideCollapseBtn ) {
                        bigCol.attr( 'colspan', colspan - 1 ) //adjust colspan to handle our new column
                            .addClass( 'bigCol' );
                        var btnCollapse = $( '<td class="col-expand"><i class="muted ' + icon_detail_collapse + '"></i></td>' )
                            .click( function () {
                                hideDetail( tr );
                            } );
                        newRow.prepend( btnCollapse );
                        //hide the row that called us and fix the button on it.
                        tr.addClass( 'hidden' ).find( 'i' ).replaceClass( icon_detail_expand, icon_detail_collapse ).addClass( 'open' );                        
                    }
                    else {
                        tr.addClass( 'no-border-bottom' );
                        tr.addClass( 'side-bar-bg' );
                        newRow.addClass( 'no-border-bottom' );
                        bigCol.attr( 'colspan', colspan - 1 ) //adjust colspan to handle our new column
                            .addClass( 'big-light-col' );
                    }
                }

                function hideDetail(tr) {
                    tableObj.fnClose(tr[0]);
                    tr.removeClass('hidden').find('i').replaceClass(icon_detail_collapse, icon_detail_expand).removeClass('open');
                }
            }

            function fixUI() {

                if (DOMtable.closest('.inline-grid-container').length) {
                    // if we are in inline mode, just fix the table height just once
                    // need timeout to calculate the right height, after grid populated
                    fixTableHeaderAlignment();

                    $timeout(function() {
                        fixTableHeight();
                    }, 1000);
                   
                } else {
                    fixTableHeight();
                    fixTableHeaderAlignment();
                    $(window).resize(fixTableHeight);
                }
            }

            function fixTableHeight() {
                var tableMargin = DOMtable.outerHeight(true) - DOMtable.outerHeight(false);
                var box = DOMtable.closest('.scrolling-grid-container');
                   
                DOMtable.height(box.height() - tableMargin);
                
            }
            function fixTableHeaderAlignment(){
                //taken from Modernizr hiddenscroll test
                var box = DOMtable.closest('.scrolling-grid-container');
                var contentGrid = $(box).find('.table-container tbody')
                if(contentGrid.length > 0){
                    var scrollWidth = contentGrid[0].offsetWidth - contentGrid[0].clientWidth;
                    if ( scrollWidth >= 0 ){
                        $(box).find('.table-container thead tr').css('margin-right',scrollWidth)
                    }
                }            
            }
        }
    }
})();
