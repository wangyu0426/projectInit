(function () {
    "use strict";

    //use "iconMapper.icon.job" etc if you have the exact key: "job"
    //otherwise use iconMapper.map("jobs"), or iconMapper.map("transactions");
    angular.module('app').service("iconMapper", iconMapper);

	//use inside html like <i class="{{vm.Value || toIcon}}"></i>
    angular.module('app').filter('toIcon', toIconFilter);

    var list = {
        job: 'icon-wrench',
        transaction: 'icon-vf-banknote-dark',
        receipt : 'icon-file',
        email:   'icon-vf-mail2',
        conversation: 'icon-inbox',
        message: 'icon-vf-paper-plane2',
        messagethread: 'icon-vf-mail2',
        comment: 'icon-comment-alt',
        membercomment: 'icon-comment-alt',
        letter: 'icon-print',
        print: 'icon-print',
        document: 'icon-print',
        statement: 'icon-file',
        sms: 'icon-vf-phone',
        text: 'icon-vf-phone',
        tenant: 'icon-contact-tenant',
        tenancy: 'icon-contact-tenant',
        owner: 'icon-contact-owner',
        ownership: 'icon-contact-owner',
        supplier: 'icon-contact-supplier',
        agent: 'icon-user',
        property: 'icon-home',
        lot: 'icon-home',
        sale: 'icon-vf-sign-house',
        seller: 'icon-vf-sign-house',
        buyer: 'icon-vf-sign-house',
        inspection: 'icon-vf-signup',
        contact: 'icon-user',
		task: 'icon-vf-clipboard',
        login: 'icon-vf-login'
	};

	var png = {
		mapMarker: {
			selected: 'app/content/images/maps/mamtkarker-blue.png',
			unselected: 'app/content/images/maps/mamtkarker-grey.png',
			userLocation: 'app/content/images/mamtkarker-green.png',
			error: 'app/content/images/mamtkarker-red.png'
		},
		blank: 'app/content/images/blankdot.png'
	};

    function iconMapper(){

        function map (str) {
            if (!str) return undefined;
            str = str.toLowerCase();
            var str_no_s = str;
            if (str.endsWith('s')) {
                str_no_s = str.slice(0,str.length-1);
            }
            return list[str] ||  list[str_no_s] ;
        }

        return {
            icon: list,
            map: map,
			png: png
        };
    }

    function toIconFilter() {
        return function(input) {
            return iconMapper().map(input);
        };
    }


})();