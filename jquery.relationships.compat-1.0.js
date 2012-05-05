/* http://keith-wood.name/relationships.html
   Relationships for jQuery compatibility from v1.0.0 to v1.1.0.
   Written by Keith Wood (kbwood@virginbroadband.com.au) January 2008.
   Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and 
   MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses. 
   Please attribute the author if you use it. */

(function($) { // Hide scope, no $ conflict

/* Attach the relationships functionality to a jQuery selection.
   @param  settings  object - the new settings to use for these relationships instances
   @return  jQuery object - for chaining further calls */
$.fn.attachRelationships = function(settings) {
	return this.relationships(settings);
};

/* Remove the relationships functionality from a jQuery selection.
   @return  jQuery object - for chaining further calls */
$.fn.removeRelationships = function() {
	return this.relationships('destroy');
};

/* Reconfigure the settings for a relationships div.
   @param  settings  object - the new settings
   @return  jQuery object - for chaining further calls */
$.fn.changeRelationships = function(settings) {
	return this.relationships('change', settings);
};

})(jQuery);
