(function () {
    'use strict';


    ////// ARRAYS /////////////
    // clone()
    // returns a clone of an array - a different copy that can be modified withouu affecting the original
    if (!Array.prototype.clone) {
        Array.prototype.clone = function () {
            return this.map(function (x) {
                return x;
            });
        };
    }

    // first(n)
    // returns an array of the first n elements only
    // if n == 1 or undefined, returns an array of the first element
    if (!Array.prototype.first) {
        Array.prototype.first = function (n) {
            if (!n) n = 1;
            return this.slice(0, n, 0);
        };
    }

	// lastElement
	if (!Array.prototype.lastElement) {
		Array.prototype.lastElement = function () {
			return this[this.length-1];
		};
	}

    //contains
    //returns true if array contains val
    if (!Array.prototype.contains) {
        Array.prototype.contains = function (n) {
            return this.indexOf(n) >= 0;
        };
    }

    //tail
    if (!Array.prototype.tail) {
        Array.prototype.tail = Array.prototype.slice;
    }

    //randomElement
    //returns a random element from the array
    if (!Array.prototype.randomElement) {
        Array.prototype.randomElement = function () {
            return this[ parseInt(Math.random() * this.length)] || this[0];
        };
    }

    //getBy (key, value)
    //searches an array of objects and returns the first object that has the property key = value
    //eg getBy('Id', 785) will return the object from the array that has an Id of 785
    if (!Array.prototype.getBy) {
        Array.prototype.getBy = function (key, value) {
            var l = this.length;
            for (var i = 0; i < l; i++) {
                if (this[i] && this[i][key] === value) {
                    return this[i];
                }
            }
            return undefined;
        };
    }

    //getIndexOf (key, value)
    //searches an array of objects and returns the index of the first object that has the property key = value
    //eg getBy('Id', 785) will return the index of the object from the array that has an Id of 785
    if (!Array.prototype.getIndexOf) {
        Array.prototype.getIndexOf = function (key, value) {
            var l = this.length;
            for (var i = 0; i < l; i++) {
                if (this[i] && this[i][key] === value) {
                    return i;
                }
            }
            return -1;
        };
    }

    //Remove (value)
    //Removes the first element that exactly matches value
    if (!Array.prototype.remove) {
        Array.prototype.remove = function (value) {
            var l = this.length;
            var j = -1;
            for (var i = 0; i < l; i++) {
                if (this[i] === value) {
                    j = i;
                    break;
                }
            }
            if (j>=0) {
                this.splice(j, 1);
            }
            return this;
        };
    }

    // Remove duplicates in an array
    if (!Array.prototype.unique) {
        Array.prototype.unique = function (mutate) {
            var unique = this.reduce(function (accum, current) {
                if (accum.indexOf(current) < 0) {
                    accum.push(current);
                }
                return accum;
            }, []);
            if (mutate) {
                this.length = 0;
                for (var i = 0; i < unique.length; ++i) {
                    this.push(unique[i]);
                }
                return this;
            }
            return unique;
        };
    }

    // Merge two arrays unless the item already exists
    if (!Array.prototype.mergeByKey) {
        Array.prototype.mergeByKey = function (newItems, key) {
            var isChanged = false;
            for (var i = newItems.length-1; i >= 0; i--) {
                var isFound = false;
                for (var j = 0; j < this.length; j++) {
                    if (this[j][key] === newItems[i][key]) {
                        isFound = true;
                        break;
                    }
                }
                if (!isFound) {
                    this.unshift(newItems[i]);
                    isChanged = true;
                }
            }
            return isChanged;
        };
    }

    //Count elements of an array  that satisfy the given condition
    if (!Array.prototype.countIf) {
        Array.prototype.countIf = function (fnCondition) {
            var count = 0;
            this.forEach(function (el) {
                if (fnCondition(el)) {count ++;}
            });
            return count;
        };
    }

    ///////// STRINGS ////////

    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (prefix) {
            var str = this;
            return str.indexOf(prefix) === 0;
        };
    }

    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function (suffix) {
            var str = this;
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        };
    }

	if (!String.prototype.contains) {
		String.prototype.contains = function (n) {
			return this.indexOf(n) >= 0;
		};
	}

	//containsWhich
	//given an array, searches the string for each element in turn,
	// if it finds it in the string, returns the found element
	if (!String.prototype.containsWhich) {
		String.prototype.containsWhich = function (arrayOfStrings) {
			var str = this;
			for (var i = 0; i < arrayOfStrings.length;i++){
				var s = arrayOfStrings[i];
				if (str.indexOf(s) >= 0) return s;
			}
			return false;
		};
	}

    //containsAll
    //given an array of strings, returns true if all elements of the array
    //are contained inside the given string
    if (!String.prototype.containsAll) {
        String.prototype.containsAll = function (arrayOfStrings) {
            var str = this;
            for (var i = 0; i < arrayOfStrings.length;i++){
                var s = arrayOfStrings[i];
                if (str.indexOf(s) < 0) return false;
            }
            return true;
        };
    }


	if (!String.prototype.toTitleCase) {
        String.prototype.toTitleCase = function () {
            var result = this.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
            return result.trim();
        };
    }

    if (!String.prototype.firstLetterUpperCase) {
        String.prototype.firstLetterUpperCase = function () {
                return this.charAt(0).toUpperCase() + this.substr(1).toLowerCase();
        };
    }

    if (!String.prototype.insertAt) {
        String.prototype.insertAt = function (str, pos) {
            return (this.slice(0, pos) + str + this.slice(pos));
        };
    }

    if (!String.prototype.fromCamelCaseToSentence) {
        String.prototype.fromCamelCaseToSentence = function() {
            return  this.replace(/([A-Z])([a-z])/g, " $1$2").trim() || '';
        };
    }

    if (!String.prototype.fromEnumToSentence) {
        String.prototype.fromEnumToSentence = function() {
            return  this.fromCamelCaseToSentence().replace(/Lot/g, "Property").replace(/lot/g, "property") || '';
        };
    }

    if (!String.prototype.stripWhiteSpace) {
        String.prototype.stripWhiteSpace = function() {
            return (!this) ? '' : this.replace(/ /g, '');
        };
    }

    if (!String.prototype.isNullOrEmpty) {
        String.prototype.isNullOrEmpty = function(str) {
            str = str || this;
            return str === null || str === undefined || str === ''; //needs double equals here
        };
    }

})();

