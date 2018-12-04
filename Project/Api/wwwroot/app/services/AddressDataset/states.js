( function () {
    'use strict';
    angular.module( 'app' ).service( 'stateList', [ stateListService ] );
    function stateListService() {
        var usState = {
            'Alabama': 'AL',
            'Alaska': 'AK',
            'Arizona': 'AZ',
            'Arkansas': 'AR',
            'California': 'CA',
            'Colorado': 'CO',
            'Connecticut': 'CT',
            'Delaware': 'DE',
            'Florida': 'FL',
            'Georgia': 'GA',
            'Hawaii': 'HI',
            'Idaho': 'ID',
            'Illinois': 'IL',
            'Indiana': 'IN',
            'Iowa': 'IA',
            'Kansas': 'KS',
            'Kentucky': 'KY',
            'Louisiana': 'LA',
            'Maine': 'ME',
            'Maryland': 'MD',
            'Massachusetts': 'MA',
            'Michigan': 'MI',
            'Minnesota': 'MN',
            'Mississippi': 'MS',
            'Missouri': 'MO',
            'Montana': 'MT',
            'Nebraska': 'NE',
            'Nevada': 'NV',
            'New Hampshire': 'NH',
            'New Jersey': 'NJ',
            'New Mexico': 'NM',
            'New York': 'NY',
            'North Carolina': 'NC',
            'North Dakota': 'ND',
            'Ohio': 'OH',
            'Oklahoma': 'OK',
            'Oregon': 'OR',
            'Pennsylvania': 'PA',
            'Rhode Island': 'RI',
            'South Carolina': 'SC',
            'South Dakota': 'SD',
            'Tennessee': 'TN',
            'Texas': 'TX',
            'Utah': 'UT',
            'Vermont': 'VT',
            'Virginia': 'VA',
            'Washington': 'WA',
            'West Virginia': 'WV',
            'Wisconsin': 'WI',
            'Wyoming': 'WY',
            'District of Columbia': 'DC',
            'American Samoa': 'AS',
            'Guam': 'GU',
            'Northern Mariana Islands': 'MP',

            'Puerto Rico': 'PR',
            'Virgin Islands': 'VI',

        };
        var canadaState = {
            'Alberta': 'AB',
            'British Columbia': 'BC',
            'Manitoba': 'MB',
            'New Brunswick': 'NB',
            'Newfoundland': 'NL',
            'Nova Scotia': 'NS',
            'Northwest Territories': 'NT',
            'Nunavut': 'NU',
            'Ontario': 'ON',
            'Prince Edward Island': 'PE',
            'Quebec': 'QC',
            'Saskatchewan': 'SK',
            'Yukon': 'YT'
        }
        var auState = {
            'New South Wales': 'NS',
            'Queensland': 'Qld',
            'South Australia': 'SA',
            'Tasmania': 'Tas',
            'Victoria': 'Vic',
            'Western Australia': 'WA',
            'Australian Capital Territory': 'ACT',
            'Jervis Bay Territory': 'JBT',
            'Northern Territory': 'NT',
            'Ashmore and Cartier Islands': '',
            'Australian Antarctic Territory': 'AAT',
            'Christmas Island': 'CX',
            'Cocos Islands': 'CC',
        };
        var nzState = {
            'Northland': '',
            'Auckland': '',
            'Waikato': '',
            'Bay of Plenty': '',
            'Gisborne': '',
            'Hawke\'s Bay': '',
            'Taranaki': '',
            'Manawatu-Wanganui': '',
            'Wellington': '',
            'Tasman': '',
            'Nelson': '',
            'Marlborough': '',
            'West Coast': '',
            'Canterbury': '',
            'Otago': '',
            'Southland': ''
        };
        var state = {
            list: {
                'United States': usState,
                'Canada': canadaState,
                'Australia': auState,
                'New Zealand': nzState
            },
            getRegionRegExp: getRegionRegExp
        };

        function getRegionRegExp( region ) {
            var stateList = [];
            if ( state.list[ region ] ) {
                Object.keys( state.list[ region ] )
                .forEach( function ( key ) {
                    stateList.push( key );
                    if ( state.list[ region ][ key ] != '' ) {
                        stateList.push( state.list[ region ][ key ] );
                    }
                } );            
            }
            return '(' + stateList.join( '|' ) + ')';        
        }    

        return state;
    }
} )();