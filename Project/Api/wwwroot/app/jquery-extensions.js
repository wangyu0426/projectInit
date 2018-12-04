/*
 * This script extends the JQuery object to add useful methods.
 * */

jQuery.fn.extend({

    //replaceClass
    //a companion to toggleClass, removeClass - this replaces oldClass with newClass
    replaceClass: function(oldClass, newClass) {
        return $(this).removeClass(oldClass).addClass(newClass);

    }
});
