( function () {
    'use strict';
    angular.module( 'app' ).service( 'countryList', [ countryListService ] );
    function countryListService() {
        var countries = {
            list: {
                "United States": [ "US", "USA" ],
                "Canada": [ "CA" ],
                "Australia": [ "AU", 'AUS' ],
                "New Zealand": [ "NZ" ],
            },
            getRegionRegExp: getRegionRegExp,
            getRegionName: getRegionName
        };
        
        function getRegionRegExp() {
            var countryList = [];
            Object.keys( countries.list )
                .forEach( function ( key ) {
                    countryList.push( key );
                    countries.list[ key ].forEach( function ( item ) {
                        countryList.push( item );
                    } );
                } );
            return '(' + countryList.join( '|' ) + ')';
        }
        function getRegionName( regionText ) {
            var result;
            Object.keys( countries.list )
                .forEach( function ( key ) {
                    if ( key.localeCompare( regionText, 'en', { sensitivity: 'base' } ) === 0 ) {
                        result = key;
                    } else {
                        countries.list[ key ].forEach( function ( item ) {
                            if ( item.localeCompare( regionText, 'en', { sensitivity: 'base' } ) === 0 ) {
                                result = item;
                            }
                        } );
                    }                    
                } );
            return result;
        }
        return countries;
    }
} )();