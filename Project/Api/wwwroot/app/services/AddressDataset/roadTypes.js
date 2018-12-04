( function () {
    'use strict';
    angular.module( 'app' ).service( 'roadTypeList', [ roadTypeListService ] );
    function roadTypeListService() {
        var roadTypes = {
            list: [ 'esplanade', 'cresent circuit', 'circuit', 'road', 'rd',
                'street', 'st', 'drive', 'dr', 'lane', 'ln', 'place', 'pl', 'parade',
                'pde', 'cresent', 'cres', 'cr', 'close', 'highway', 'hwy', 'hway', 'way',
                'avenue', 'ave', 'boulevard', 'blvd', 'circle', 'cir', 'square', 'terrace',
                'ter', 'court', 'ct', 'parkway' ],

            getRegExp: getRegExp
        };

        function getRegExp() {            
            return '(' + roadTypes.list.join( '|' ) + ')';
        }  
        return roadTypes;
    }
} )();