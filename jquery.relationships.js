/* http://keith-wood.name/relationships.html
   Relationships for jQuery v1.1.0.
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
	this._nextId = 0; // Next ID for a relationships instance
	this._inst = []; // List of instances indexed by ID
	this._defaults = {
		opacity: 20 // Opacity of non-matching items, percentage
	};
}

$.extend(Relationships.prototype, {
	/* Class name added to elements to indicate already configured with relationships. */
	markerClassName: 'hasRelationships',
	
	/* Register a new relationships instance - with custom settings. */
	_register: function(inst) {
		var id = this._nextId++;
		this._inst[id] = inst;
		return id;
	},

	/* Retrieve a particular relationships instance based on its ID. */
	_getInst: function(id) {
		return this._inst[id] || id;
	},

	/* Override the default settings for all relationships instances.
	   @param  settings  object - the new settings to use as defaults
	   @return void */
	setDefaults: function(settings) {
		extendRemove(this._defaults, settings || {});
	},

	/* Attach the relationships widget to a div. */
	_attachRelationships: function(target, inst) {
		target = $(target);
		if (target.is('.' + this.markerClassName)) {
			return;
		}
		target.addClass(this.markerClassName);
		target[0]._relId = inst._id;
		inst._target = target;
		this._updateRelationships(inst._id);
	},

	/* Redisplay the relationships with an updated display. */
	_updateRelationships: function(id) {
		var inst = this._getInst(id);
		inst._target.html(inst._generateHTML());
	},

	/* Reconfigure the settings for a relationships div. */
	_changeRelationships: function(target, settings) {
		var inst = this._getInst(target._relId);
		if (inst) {
			extendRemove(inst._settings, settings || {});
			this._updateRelationships(inst._id);
		}
	},

	/* Remove the relationships widget from a div. */
	_destroyRelationships: function(target) {
		target = $(target);
		if (!target.is('.' + this.markerClassName)) {
			return;
		}
		target.removeClass(this.markerClassName);
		target.empty();
		this._inst[target[0]._cdnId] = null;
		target[0]._relId = undefined;
	},
	
	/* Show the links for a selected item. */
	_showLinks: function(id, setId, itemId) {
		var inst = this._getInst(id);
		if (inst) {
			inst._showLinks(setId, itemId);
		}
	}
});

/* Individualised settings for relationships widgets applied to one or more divs.
   Instances are managed and manipulated through the Relationships manager. */
function RelationshipsInstance(settings) {
	this._id = $.relationships._register(this);
	this._target = null; // jQuery wrapper of target div
	// Customise the relationships object - uses manager defaults if not overridden
	this._settings = extendRemove({}, settings || {}); // clone
}

$.extend(RelationshipsInstance.prototype, {
	/* Get a setting value, defaulting if necessary. */
	_get: function(name) {
		return (this._settings[name] != null ? this._settings[name] : $.relationships._defaults[name]);
	},
	
	/* Generate the HTML to display the relationships widget. */
	_generateHTML: function() {
		var set1 = this._get('set1');
		var set2 = this._get('set2');
		var description = this._get('description');
		var html = '<div class="relationships_set1" style="height: ' +
			set1.imageSize[1] + 'px;">' + this._addSet(set1, 1) + '</div>' +
			'<div class="relationships_set2" style="height: ' + set2.imageSize[1] +
			'px;">' + this._addSet(set2, 2) + '</div>' +
			'<div class="relationships_description">' + description + '</div>';
		return html;
	},
	
	/* Display one of the sets. */
	_addSet: function(set, setId) {
		var html = '';
		for (var i = 0; i < set.items.length; i++) {
			var item = set.items[i];
			html += '<span class="relationships_item" id="' + i + '" ' +
				'style="width: ' + set.imageSize[0] + 'px; ' +
				'height: ' + set.imageSize[1] + 'px; ' +
				($.browser.mozilla ? ' padding-left: ' + set.imageSize[0] + 
				'px; padding-bottom: ' + (set.imageSize[1] - 18) + 'px;' : '') +
				'background: transparent url(\'' + set.images + '\') ' +
				'no-repeat -' + ((item.imageIndex || i) * set.imageSize[0]) + 'px 0px;" ' +
				'onmouseover="jQuery.relationships._showLinks(' + this._id + ',' + setId + ',' + i + ')" ' +
				'onmouseout="jQuery.relationships._showLinks(' + this._id + ')"></span>';
		}
		return html;
	},
	
	/* Show the links for a selected item. */
	_showLinks: function(setId, itemId) {
		var description = this._get('description');
		if (setId) {
			var set = this._get('set' + setId);
			// description for selected item
			description = set.items[itemId].description || set.items[itemId];
			// highlight only the selected item in this set
			var highlightItems = [[], []];
			highlightItems[setId - 1] = [itemId];
			// determine matching items in other set
			var links = this._get('links') || [];
			for (var i = 0; i < links.length; i++) {
				if (links[i][setId - 1] == itemId) {
					highlightItems[2 - setId][highlightItems[2 - setId].length] = links[i][2 - setId];
				}
			}
			// highlight matched items
			var opacity = (this._get('opacity') || 20) / 100;
			this._target.children('.relationships_set1').children().each(function() {
				$(this).css('opacity', ($.inArray(this.id, highlightItems[0]) > -1 ? '1.0' : opacity));
			});
			this._target.children('.relationships_set2').children().each(function() {
				$(this).css('opacity', ($.inArray(this.id, highlightItems[1]) > -1 ? '1.0' : opacity));
			});
		}
		else {
			// show all
			this._target.children().children().each(function() {
				$(this).css('opacity', '1.0');
			});
		}
		// show selected item or default description
		this._target.children('.relationships_description').text(description);
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
			$.relationships._attachRelationships(this, new RelationshipsInstance(options));
		}
	});
};

/* Initialise the relationships functionality. */
$(document).ready(function() {
   $.relationships = new Relationships(); // singleton instance
});

})(jQuery);
