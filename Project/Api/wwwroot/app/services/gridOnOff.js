(function () {
	'use strict';

	angular.module('app').factory('gridOnOff', ['$rootScope', '$compile', factory]);


	function factory($scope, $compile) {
		function _factory (template, changeFn) {
			var self = this;
            self.ChangeFn = changeFn;

			self.render = function(value, action, obj) {
                self.id = obj.Id;

				var template = '<label class="checkbox-container"><input type="checkbox" id="' + obj.Id + '" ' +
								(value ? 'checked' :'' ) +
								' class="ace ace-switch ace-switch-4"><span class="lbl"></span></label>';

                return template;
			};

			self.link = function(rowElement) {
                rowElement.find('#'+self.id).on('click', function(event, data){
                    //event.stopPropagation();
                    self.ChangeFn(event,{id:$(this).attr('id')});
                    //return false;
                });
			};
		}

		return _factory;
	}
})();
