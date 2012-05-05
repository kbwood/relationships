/* http://keith-wood.name/relationships.html
   Relationships for jQuery v1.2.0.
   Written by Keith Wood (kbwood@virginbroadband.com.au) January 2008.
   Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and 
   MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses. 
   Please attribute the author if you use it. */

/* Display matched items across two sets.
   Attach it with options like:
   var integers = {images: 'integers.png', imageSize: [25, 29],
     items: ['Number one', 'Number two', 'Number three', 'Number four']};
   var intTypes = {images: 'intTypes.png', imageSize: [27, 27],
     items: ['Odd numbers', 'Even numbers', 'Prime numbers']};
   var intLinks = [[0, 0], [1, 1], [1, 2], [2, 0], [2, 2], [3, 1]];
   $('div selector').attachRelationships({set1: integers,
     set2: intTypes, links: intLinks, description: 'Integers'});
*/

(function($) { // Hide scope, no $ conflict

/* Relationships manager. */
function Relationships() {
	this._defaults = {
		opacity: 20 // Opacity of non-matching items, percentage
	};
}

var PROP_NAME = 'relationships';

$.extend(Relationships.prototype, {
	/* Class name added to elements to indicate already configured with relationships. */
	markerClassName: 'hasRelationships',
	
	/* Override the default settings for all relationships instances.
	   @param  options  object - the new settings to use as defaults
	   @return void */
	setDefaults: function(options) {
		extendRemove(this._defaults, options || {});
	},

	/* Attach the relationships widget to a div. */
	_attachRelationships: function(target, options) {
		target = $(target);
		if (target.is('.' + this.markerClassName)) {
			return;
		}
		target.addClass(this.markerClassName);
		if (!target[0].id) {
			target[0].id = 'rl' + new Date().getTime();
		}
		var inst = {};
		inst.options = $.extend({}, options);
		$.data(target[0], PROP_NAME, inst);
		this._updateRelationships(target, inst);
	},

	/* Redisplay the relationships with an updated display. */
	_updateRelationships: function(target, inst) {
		target.html(this._generateHTML(target[0].id, inst));
	},

	/* Reconfigure the settings for a relationships div. */
	_changeRelationships: function(target, options) {
		var inst = $.data(target, PROP_NAME);
		if (inst) {
			extendRemove(inst.options, options || {});
			$.data(target, PROP_NAME, inst);
			this._updateRelationships($(target), inst);
		}
	},

	/* Remove the relationships widget from a div. */
	_destroyRelationships: function(target) {
		target = $(target);
		if (!target.is('.' + this.markerClassName)) {
			return;
		}
		target.removeClass(this.markerClassName).empty();
		$.removeData(target[0], PROP_NAME);
	},
	
	/* Show the links for a selected item. */
	_showLinks: function(id, setId, itemId) {
		var target = $(id);
		var inst = $.data(target[0], PROP_NAME);
		if (inst) {
			this._showLinks(target, inst, setId, itemId);
		}
	},

	/* Get a setting value, defaulting if necessary. */
	_get: function(inst, name) {
		return (inst.options[name] != null ?
			inst.options[name] : $.relationships._defaults[name]);
	},
	
	/* Generate the HTML to display the relationships widget. */
	_generateHTML: function(id, inst) {
		var set1 = this._get(inst, 'set1');
		var set2 = this._get(inst, 'set2');
		var description = this._get(inst, 'description');
		var html = '<div class="relationships_set1" style="height: ' +
			set1.imageSize[1] + 'px;">' + this._addSet(id, set1, 1) + '</div>' +
			'<div class="relationships_set2" style="height: ' + set2.imageSize[1] +
			'px;">' + this._addSet(id, set2, 2) + '</div>' +
			'<div class="relationships_description">' + description + '</div>';
		return html;
	},
	
	/* Display one of the sets. */
	_addSet: function(id, set, setId) {
		var html = '';
		for (var i = 0; i < set.items.length; i++) {
			var item = set.items[i];
			html += '<span class="relationships_item" id="' + i + '" ' +
				'style="width: ' + set.imageSize[0] + 'px; ' +
				'height: ' + set.imageSize[1] + 'px; ' +
				($.browser.mozilla && $.browser.version.substr(0, 3) != '1.9' ?
				' padding-left: ' + set.imageSize[0] + 
				'px; padding-bottom: ' + (set.imageSize[1] - 18) + 'px;' : '') +
				'background: transparent url(\'' + set.images + '\') ' +
				'no-repeat -' + ((item.imageIndex || i) * set.imageSize[0]) + 'px 0px;" ' +
				'onmouseover="jQuery.relationships._showLinks(\'#' + id + '\',' + setId + ',' + i + ')" ' +
				'onmouseout="jQuery.relationships._showLinks(\'#' + id + '\')"></span>';
		}
		return html;
	},
	
	/* Show the links for a selected item. */
	_showLinks: function(id, setId, itemId) {
		var target = $(id);
		var inst = $.data(target[0], PROP_NAME);
		var description = this._get(inst, 'description');
		if (setId) {
			var set = this._get(inst, 'set' + setId);
			// description for selected item
			description = set.items[itemId].description || set.items[itemId];
			// highlight only the selected item in this set
			var highlightItems = [[], []];
			highlightItems[setId - 1] = [itemId];
			// determine matching items in other set
			var links = this._get(inst, 'links') || [];
			for (var i = 0; i < links.length; i++) {
				if (links[i][setId - 1] == itemId) {
					highlightItems[2 - setId][highlightItems[2 - setId].length] = links[i][2 - setId];
				}
			}
			// highlight matched items
			var opacity = (this._get(inst, 'opacity') || 20) / 100;
			target.children('.relationships_set1').children().each(function() {
				$(this).css('opacity', ($.inArray(
					parseInt(this.id), highlightItems[0]) > -1 ? '1.0' : opacity));
			});
			target.children('.relationships_set2').children().each(function() {
				$(this).css('opacity', ($.inArray(
					parseInt(this.id), highlightItems[1]) > -1 ? '1.0' : opacity));
			});
		}
		else {
			// show all
			target.find('span').each(function() {
				$(this).css('opacity', '1.0');
			});
		}
		// show selected item or default description
		target.children('.relationships_description').text(description);
	}
});

/* jQuery extend now ignores nulls! */
function extendRemove(target, props) {
	$.extend(target, props);
	for (var name in props) {
		if (props[name] == null) {
			target[name] = null;
		}
	}
	return target;
}

/* Attach the relationship functionality to a jQuery selection.
   @param  command  string - the command to run (optional, default 'attach')
   @param  options  object - the new settings to use for these relationships instances
   @return  jQuery object - for chaining further calls */
$.fn.relationships = function(options) {
	var otherArgs = Array.prototype.slice.call(arguments, 1);
	return this.each(function() {
		if (typeof options == 'string') {
			$.relationships['_' + options + 'Relationships'].
				apply($.relationships, [this].concat(otherArgs));
		}
		else {
			$.relationships._attachRelationships(this, options);
		}
	});
};

/* Initialise the relationships functionality. */
$(document).ready(function() {
   $.relationships = new Relationships(); // singleton instance
});

})(jQuery);
