(function () {
    'use strict';

    angular.module( 'app' ).service( 'addressParser', [ 'countryList', 'stateList', 'roadTypeList','config', service]);

    function service( countryList, stateList, roadTypeList, config) {
        var self = this;

        this.blankAddress = function () {
            this.Latitude = '';
            this.Longitude = '';
            this.BuildingName = '';
            this.Unit = '';
            this.Number = '';
            this.Street = '';
            this.Suburb = '';
            this.PostalCode = '';
            this.UnitIndicator = '';
            this.DuplexIndicator = '';
            this.StreetNumber = '';
            this.State = '';
            this.Country = '';
            this.Text = self.combine(this);
            this.modeType = { google: 0, manual: 1};
            this.mode = this.modeType.manual;
            this.IsInit = undefined;
        };

        this.validateAddress = function (address) {
            var mandatory = ['number', 'street', 'suburb', 'postalcode', 'state'];
            var valid = 0;

            for (var p in address) {
                if (valid === mandatory.length) {
                    break;
                }
                if (mandatory.indexOf(p.toLowerCase()) > -1 && address[p]) {
                    valid++;
                }
            }

            return valid === mandatory.length;
        };
        this.isHaveValidLatLng = function (address) {
            return  address.Latitude !== '' &&
                address.Longitude !== '' &&
                address.Latitude !== null &&
                address.Longitude !== null;
        }
        this.parseBingAddress = function ( place) {
            var address = this.split( place.address.formattedAddress );
            if ( place.point ) {
                address.Latitude = place.point.coordinates[ 0 ];
                address.Longitude = place.point.coordinates[ 1 ];                
            }
            address.Street = this.getNotEmptyValueInOrder([address.Street , place.address.addressLine]);
            address.Suburb = this.getNotEmptyValueInOrder( [ place.address.neighborhood, place.address.locality, address.Suburb]);
            address.PostalCode = this.getNotEmptyValueInOrder( [ address.PostalCode, place.address.postalCode ] );
            address.State = this.getNotEmptyValueInOrder( [ place.address.adminDistrict, address.State  ] );
            address.Country = this.getNotEmptyValueInOrder( [ address.Country, place.address.countryRegion ] );
            address.mode = address.modeType.google;
            address.IsInit = false;

            return address;
        }
        this.getNotEmptyValueInOrder = function (arr) {
            for ( var i = 0; i < arr.length; i++ ){
                if(arr[i] !== undefined && arr[i] !== null && arr[i] !== '') {
                    return arr[i];
                }
            }
            return null;
        }
        this.parseGoogleAddress = function (place) {
            var address = new self.blankAddress();

            address.Latitude = place.geometry.location.lat();
            address.Longitude = place.geometry.location.lng();
            address.BuildingName = getPart('establishment');
            address.Unit = getPart('subpremise');
            address.Number = getPart('street_number');
            address.Street = getPart('route');
            address.Suburb = getPart('locality');
            address.PostalCode = getPart('postal_code');
            address.State = getPart('administrative_area_level_1');
            address.Country = getPart('country', true);
            address.mode = address.modeType.google;
            address.IsInit = false;

            return address;

            function getPart(addressType, longName) {
                if (!place) {
                    return '';
                }
                for (var i = 0; i < place.address_components.length; i++) {
                    var part = place.address_components[i];
                    for (var j = 0; j < part.types.length; j++) {
                        var type = part.types[j];
                        if (type === addressType) {
                            if (longName) {
                                return part.long_name;
                            } else {
                                return part.short_name;
                            }
                        }
                    }
                }
                return '';
            }
        };

        this.combine = function (address, isRoadAddress) {
            var a = address,
                text = '';
            if ( !isRoadAddress ) {
                text +=
                    ( a.BuildingName ? a.BuildingName + ' ' : '' ) +
                    ( a.Unit ? a.Unit + '/' : '' );
            }
            text +=
                ( a.Number ? a.Number + ' ' : '' ) +
                ( a.MailboxName ? a.MailboxName + ' ' : '' ) +    
                (a.Street ? a.Street + ', ' : '') +
                (a.Suburb ? a.Suburb + ', ' : '') +
                (a.State ? a.State + ' ' : '' ) +
                (a.PostalCode ? a.PostalCode + ' ' : '' ) +
                (a.Country ? a.Country : '' );
            return text.trim();
        };
        this.split = function (text) {
            var result = self.process(text);
            if (!result) {
                result = {};
            }

            var address = new self.blankAddress();
            address.Unit = fixNull(result.unit);
            address.Number = fixNull( result.number ) + ( fixNull( result.duplexIndicator ) );
            address.Street = (fixNull(result.street) + ' ' + fixNull(result.roadtype)).toTitleCase();
            address.Suburb = (fixNull(result.suburb)).toTitleCase();
            address.PostalCode = fixNull(result.postal);
            address.State = fixNull(result.state).toUpperCase();
            address.Country = ( fixNull( result.country ) ).toTitleCase();
            address.DuplexIndicator = ( fixNull( result.duplexIndicator ) );
            address.StreetNumber = fixNull( result.number );
            address.MailboxName = fixNull( result.MailboxName );
            address.IsInit = false;
            return address;

            function fixNull(value) {
                if (value === null || value === undefined) {
                    return '';
                }
                return value;
            }
        };

        this.process = function (text) {
            var result = {};
            var country = pickFromLast( countryList.getRegionRegExp(), text );
            var countryName = config && config.session && config.session.Region ? config.session.Region.Country : 'Australia';
            var addressCountry = countryList.getRegionName( country.match ) || countryName;
            var postal = pickFromLast( '(\\d{4,8})', country.everythingElse );
            var state = pickFromLast( stateList.getRegionRegExp( addressCountry ), postal.everythingElse );

            result.country = country.match;
            result.postal = postal.match;
            result.state = state.match;

            var patterns = self.compilePatterns();
            if (!text) {
                return null;
            }
            text += ''; //add an empty string to force it to be a string
            text = text.replace(/[,\n]/g, '');
            text = text.replace(/<BR>/g, '');
            for (var i = 0; i < patterns.length; i++) {
                var rx = new RegExp(patterns[i].pattern, 'i');
                var test = rx.test(text);
                if (!test) {
                    continue;
                }
                var match = rx.exec(text);
                if (match && match.length - 1 === patterns[i].extract.length) {
                    for (var k = 1; k < patterns[i].extract.length + 1; k++) {
                        result[ patterns[ i ].extract[ k - 1 ] ] = result[ patterns[ i ].extract[ k - 1 ] ] || match[k];
                    }
                    return result;
                }
            }
            return null;
        };
        function pickFromLast( pattern, text ) {
            var rx = new RegExp( pattern, 'gi' );
            var test = rx.test( text );
            if ( test ) {
                var match = text.match( rx );
                if ( match && match.length > 0 ) {
                    var matchedText = match[ match.length - 1 ];
                    var indexOfMatch = text.lastIndexOf( matchedText )
                    var everythingElse = text.substr( indexOfMatch + matchedText.length );
                    return {
                        match: matchedText,
                        everythingElse: text.substr( 0, indexOfMatch ) + everythingElse
                    };
                }
            }
            return { everythingElse: text};            
        }
        
        this.patterns = [];

        this.compilePatterns = function () {
            if (self.patterns.length > 0) {
                return self.patterns;
            }

            var roadType = roadTypeList.getRegExp();
            var number = '(\\w?\\d{1,6}-?\\d{0,6})';
            var streetNumber = '(\\w?\\d{1,6}-?\\d{0,6})(\\w?)';
            var unitNumber = number + '(/|\\\\|\\.){1}' + streetNumber;
            var prefixNumber = '[uU]{1}[nN]?[iI]?[tT]?\\s?' + number + '\\s' + streetNumber;
            var state = '([A-Z\\sa-z]*?)';
            var postal = '(\\d{4,8})';
            var mailbox_name = '(p\\.? ?o\\.? box \\d{1,6}|locked bag \\d{1,6})';
            var street = '(.*?)';
            var suburb = '(.*?)';
            var suburbAggressive = '(.*)';
            var patterns = [
                { pattern: 'MAILBOX_NAME SUBURB-A STATE POSTAL',
                    extract: ['MailboxName',
                        'suburb',
                        'state',
                        'postal']
                },
                { pattern: 'MAILBOX_NAME SUBURB POSTAL',
                    extract: ['MailboxName',
                        'suburb',
                        'postal']
                },
                {
                    pattern: 'UNITNUMBER STREET ROADTYPE SUBURB-A STATE POSTAL (.*)',
                    extract: [ 'unit', 'unitIndicator',
                        'number', 'duplexIndicator',
                        'street',
                        'roadtype',
                        'suburb',
                        'state',
                        'postal',
                        'country' ]
                },
                {
                    pattern: 'PREFIXNUMBER STREET ROADTYPE SUBURB-A STATE POSTAL (.*)',
                    extract: [ 'unit',
                        'number', 'duplexIndicator',
                        'street',
                        'roadtype',
                        'suburb',
                        'state',
                        'postal',
                        'country' ]
                },
                {
                    pattern: 'NUMBER STREET ROADTYPE SUBURB-A STATE POSTAL (.*)',
                    extract: [ 'number', 'duplexIndicator',
                        'street',
                        'roadtype',
                        'suburb',
                        'state',
                        'postal',
                        'country' ]
                },
                {
                    pattern: 'PREFIXNUMBER STREET ROADTYPE SUBURB-A STATE POSTAL',
                    extract: [ 'unit',
                        'number', 'duplexIndicator',
                        'street',
                        'roadtype',
                        'suburb',
                        'state',
                        'postal' ]
                },
                { pattern: 'UNITNUMBER STREET ROADTYPE SUBURB-A STATE POSTAL',
                    extract: [ 'unit','unitIndicator',
                        'number', 'duplexIndicator',
                        'street',
                        'roadtype',
                        'suburb',
                        'state',
                        'postal']
                },
                { pattern: 'NUMBER STREET ROADTYPE SUBURB-A STATE POSTAL',
                    extract: [
                        'number', 'duplexIndicator',
                        'street',
                        'roadtype',
                        'suburb',
                        'state',
                        'postal']
                },
                {
                    pattern: 'NUMBER STREET ROADTYPE SUBURB POSTAL',
                    extract: [
                        'number', 'duplexIndicator',
                        'street',
                        'roadtype',
                        'suburb',
                        'postal']
                },
                {
                    pattern: 'UNITNUMBER STREET ROADTYPE SUBURB-A STATE',
                    extract: [ 'unit', 'unitIndicator',
                        'number', 'duplexIndicator',
                        'street',
                        'roadtype',
                        'suburb',
                        'state']
                },
                {
                    pattern: 'PREFIXNUMBER STREET ROADTYPE SUBURB-A STATE',
                    extract: [ 'unit',
                        'number', 'duplexIndicator',
                        'street',
                        'roadtype',
                        'suburb',
                        'state' ]
                },
                {
                    pattern: 'NUMBER STREET ROADTYPE SUBURB-A STATE',
                    extract: [
                        'number', 'duplexIndicator',
                        'street',
                        'roadtype',
                        'suburb',
                        'state']
                },
                {
                    pattern: 'UNITNUMBER STREET ROADTYPE SUBURB',
                    extract: [ 'unit', 'unitIndicator',
                        'number', 'duplexIndicator',
                        'street',
                        'roadtype',
                        'suburb']
                },
                {
                    pattern: 'PREFIXNUMBER STREET ROADTYPE SUBURB',
                    extract: [ 'unit',
                        'number', 'duplexIndicator',
                        'street',
                        'roadtype',
                        'suburb' ]
                },
                {
                    pattern: 'UNITNUMBER STREET ROADTYPE',
                    extract: [ 'unit', 'unitIndicator',
                        'number', 'duplexIndicator',
                        'street',
                        'roadtype' ]
                },
                {
                    pattern: 'NUMBER STREET ROADTYPE SUBURB',
                    extract: [
                        'number', 'duplexIndicator',
                        'street',
                        'roadtype',
                        'suburb']
                },
                {
                    pattern: 'PREFIXNUMBER STREET ROADTYPE',
                    extract: [ 'unit',
                        'number', 'duplexIndicator',
                        'street',
                        'roadtype' ]
                },
                { pattern: 'NUMBER STREET ROADTYPE',
                    extract: [
                        'number', 'duplexIndicator',
                        'street',
                        'roadtype']
                },
                {
                    pattern: 'MAILBOX_NAME SUBURB',
                    extract: ['MailboxName',
                        'suburb']
                },
                { pattern: 'MAILBOX_NAME',
                    extract: ['MailboxName']
                },
                {
                    pattern: 'STREET ROADTYPE SUBURB-A STATE POSTAL (.*)',
                    extract: ['street',
                        'roadtype',
                        'suburb',
                        'state',
                        'postal',
                        'country' ]
                },
                {
                    pattern: 'STREET ROADTYPE SUBURB-A STATE',
                    extract: [ 'street',
                        'roadtype',
                        'suburb',
                        'state' ]
                },
                {
                    pattern: 'STREET ROADTYPE SUBURB',
                    extract: ['street',
                        'roadtype',
                        'suburb']
                },
                {
                    pattern: 'PREFIXNUMBER STREET',
                    extract: [ 'unit',
                        'number', 'duplexIndicator',
                        'street' ]
                },
                {
                    pattern: 'UNITNUMBER STREET',
                    extract: [ 'unit', '',
                        'number', 'duplexIndicator',
                        'street' ]
                },
                { pattern: 'NUMBER STREET ',
                    extract: [
                        'number', 'duplexIndicator',
                        'street']
                },
                { pattern: 'MAILBOX_NAME',
                    extract: ['MailboxName']
                },
                { pattern: 'STREET',
                    extract: ['street']
                }
            ];
            for (var i = 0; i < patterns.length; i++) {
                var compiled = patterns[i].pattern;
                compiled = compiled.replace('PREFIXNUMBER', prefixNumber);
                compiled = compiled.replace('UNITNUMBER', unitNumber);
                compiled = compiled.replace('ROADTYPE', roadType);
                compiled = compiled.replace('NUMBER', streetNumber);
                compiled = compiled.replace('STATE', state);
                compiled = compiled.replace('POSTAL', postal);
                compiled = compiled.replace('MAILBOX_NAME', mailbox_name);
                compiled = compiled.replace('STREET', street);
                compiled = compiled.replace('SUBURB-A', suburbAggressive);
                compiled = compiled.replace('SUBURB', suburb);
                patterns[i].pattern = compiled;
            }

            return patterns;
        };
    }
})();