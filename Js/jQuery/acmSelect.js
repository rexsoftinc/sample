;(function( $, window, document, undefined ){
	var acmSelect = function(el, options) {
		this.el = el;
		this.$el = $(el);
		this.options = options;
		this.metadata = this.$el.data('options');
		this.init();
	};
	acmSelect.prototype = {
		selected: [],
		values: [],
		structure: [],
		defaults : {
			selected: [],
			values: [],
			structure: [],
			placeholder: 'Select',
			onChange: function($wrap, $select) {
			},
			onSelect: function($wrap, $select) {
			},
			onRemove: function($wrap, $select) {
			},
			onOpen: function($wrap, $select) {
			},
			onClose: function($wrap, $select) {
			},
		},
		init: function() {
			if(this.$el.data('acm')=='1') return this;
			this.time = new Date().getTime();
			this.config = $.extend({}, this.defaults, this.options, this.metadata);
			this.config.multiple = this.$el.attr('multiple')!=undefined;
			if(this.$el.attr('placeholder')) {
				this.config.placeholder = this.$el.attr('placeholder');	
			}
			this.selected = [];
			this.values = [];
			this.structure = [];
			this.getSelected();
			this.getOptions(this.$el, this.structure);
			this.renderHtml();
			this.attachEvents();
			this.$el.data('acm', '1');
			return this;
		},
		getSelected: function() {
			var _this = this;
			var $selected = this.$el.find('option:selected');
			var childs = [];
			$selected.each(function(i) {
				_this.selected.push({
					name: $(this).text(),
					value: $(this).attr('value')
				});
				_this.values.push($(this).attr('value'));
			});
			this.structure.push({
				type: 'selectedGroup',
				name: 'Selected',
				childs: _this.selected
			});
		},
		getOptions: function($parent, options_array) {
			var _this = this;
			var $childs = $parent.children();
			$childs.each(function(i) {
				var $this = $(this);
				switch($this.prop("tagName").toLowerCase()) {
					case 'optgroup':
						_this.pushGroup($this);
						break;
					case 'option':
						_this.pushOption($this, options_array);
						break;
				}
			});
		},
		pushGroup: function($group) {
			var childs = [];
			this.getOptions($group, childs);
			this.structure.push({
				type: 'group',
				name: $group.attr('label'),
				childs: childs,
				$el: $group
			});
		}, 
		pushOption: function($option, options_array) {
			options_array.push({
				type: 'option',
				name: $option.text(),
				value: $option.attr('value'),
				selected: $.inArray($option.attr('value'), this.values),
				$el: $option,
			});
		},
		renderHtml: function () {
			var classes = '';
			if(this.$el.hasClass('require')) classes += ' require';
			var placeholder_class = (this.selected.length)?' values':' placeholder';
			this.$wrap = this.$el.wrap('<div class="plg-acmSelect'+placeholder_class+classes+'" />').closest('.plg-acmSelect');
			this.$wrap.append(' \
				<div class="acm-placeholder"> \
					<span class="placeholder" data-action="open">'+this.config.placeholder+'</span> \
					<div class="acm-selected">'+this.templates.list('values', this.selected)+'</div> \
				</div> \
				<a href="#" class="button" data-action="open"> \
					<svg class="svg-icon dropdown"> \
						<use xlink:href="#ico-select" /> \
					</svg> \
					<svg class="svg-icon add-more"> \
						<use xlink:href="#ico-add" /> \
					</svg> \
				</a> \
				<div class="acm-list"> \
					<ul> \
						'+this.templates.render('structure', this.structure)+' \
					</ul> \
				</div> \
			');
			this.$dropdown = this.$wrap.find('.acm-list');
			this.$selectedGroup = this.$dropdown.find('.acm-selected-group');
			this.$selectedList = this.$selectedGroup.children('ul');
			this.$placehoder = this.$wrap.find('.acm-placeholder');
			this.$placehoderValues = this.$wrap.find('.acm-selected');
		},
		templates: {
			list: function(template, arr) {
				var html = '';
				for(var i in arr) {
					html += this.render(template, arr[i]);
				}
				return html;
			},
			render: function(template, data, withAnimation) {
				return this[template](data, withAnimation);
			},
			structure: function(arr) {
				var html = '';
				for(var i in arr) {
					html += this.render(arr[i].type, arr[i]);
				}
				return html;
			},
			values: function(obj, withAnimation) {
				aminationClass = (withAnimation)?' acm-animate acm-animate-add':''; 
				return ' \
					<a href="#" class="acm-item selected'+aminationClass+'" data-action="remove" data-value="'+obj.value+'"> \
						'+obj.name+' \
					</a> \
				';
			},
			selected: function(obj, withAnimation) {
				aminationClass = (withAnimation)?' acm-animate acm-animate-add':''; 
				return ' \
					<li class="acm-item selected'+aminationClass+'" data-action="remove" data-value="'+obj.value+'"> \
						<a href="#"> \
							<svg class="svg-icon"> \
								<use xlink:href="#ico-clear" /> \
							</svg> \
							'+obj.name+' \
						</a> \
					</li> \
				';
			},
			group: function(obj) {
				return ' \
					<li class="acm-group"> \
						<a href="#" data-action="slide"> \
							'+obj.name+' \
							<svg class="svg-icon"> \
								<use xlink:href="#ico-select" /> \
							</svg> \
						</a> \
						<ul>'+this.list('option', obj.childs)+'</ul> \
					</li> \
				';
			},
			selectedGroup: function(obj) {
				disabledClass = (obj.childs.length<5)?' disabled':'';
				return ' \
					<li class="acm-group acm-selected-group'+disabledClass+'"> \
						<a href="#" data-action="slide"> \
							'+obj.name+' \
							<svg class="svg-icon"> \
								<use xlink:href="#ico-select" /> \
							</svg> \
						</a> \
						<ul>'+this.list('selected', obj.childs)+'</ul> \
					</li> \
				';
			},
			option: function(obj) {
				var checked = (obj.selected>-1)?' checked':'';
				return ' \
					<li class="acm-item'+checked+'" data-action="select" data-value="'+obj.value+'"> \
						<a href="#"> \
							<span class="acm-checkbox"> \
								<svg class="svg-icon"> \
									<use xlink:href="#ico-checkbox" /> \
								</svg> \
							</span> \
							'+obj.name+' \
						</a> \
					</li> \
				';
			}
		},
		getPositions: function($el) {
			this.startPositions = {
				el: $el.position().top,
				placeholder: this.$placehoder.outerHeight(false)
			};
		},
		attachEvents: function() {
			var _this = this;
			this.$wrap.on('click', '[data-action]', function(e){
				e.preventDefault();
				var action = $(this).data('action');
				if(_this.events.hasOwnProperty(action)) {
					_this.events[action](_this, $(this));
				} else {
					console.log('acmSelect: Action not registered');
				}
				
			}); 
			this.$wrap.on('acm:close', function(e){
				_this.events.close(_this, $(this));
			});
		},
		events: {
			select: function(_this, $el) {
				var value = $el.data('value');
				_this.getPositions($el);
				if($el.hasClass('checked')) {
					_this.removeValue(value);
					_this.domWorker.moveItem(_this, $el, -1);
				} else {
					_this.addValue(value);
					_this.domWorker.moveItem(_this, $el, 1);
				}
				//_this.domWorker.moveItem(_this, $el);
			},
			remove: function(_this, $this) {
				var value = $this.data('value');
				_this.removeValue(value);
			},
			open: function(_this, $this) {
				var $window = $(window);
				var position = _this.$wrap.position();
				var offset = _this.$wrap.offset();
				var dropdown = {
      				height: _this.$dropdown.outerHeight(false)
    			};
				_this.$wrap.find('.acm-list').slideToggle();
				_this.$wrap.addClass('opened');
				$(document).on('mousedown.acmSelect.'+_this.time+' touchstart.select2.acmSelect.'+_this.time, function(e) {
					var $target = $(e.target);
					var $wrap = $target.closest('.plg-acmSelect');
					var $all = $('.plg-acmSelect');
					$all.each(function () {
						if (this == $wrap[0]) {
							return;	
						}
						$(this).trigger('acm:close');
					});
				});
				/* SELECT2 fix */
				$('.select2-choice').on('mousedown.select2.acmSelect.'+_this.time+' touchstart.select2.acmSelect.'+_this.time, function(e) {
					var $target = $(e.target);
					var $wrap = $target.closest('.plg-acmSelect');
					var $all = $('.plg-acmSelect');
					$all.each(function () {
						if (this == $wrap[0]) {
							return;	
						}
						$(this).trigger('acm:close');
					});
				});
			},
			close: function(_this, $this) {
				_this.$wrap.find('.acm-list').slideUp();
				_this.$wrap.removeClass('opened');
				$(document).off('mousedown.acmSelect.'+_this.time);
				$('.select2-choice').off('mousedown.select2.acmSelect.'+_this.time);
			},
			slide: function(plg, $this) {
				$this.closest('.acm-group').toggleClass('opened').children('ul').slideToggle();
			}
		},
		addValue: function(value) {
			var $option = this.$el.find('option[value="'+value+'"]');
			var optionObj = {
				name: $option.text(),
				value: $option.attr('value')
			};
			this.selected.push(optionObj);
			this.values.push($option.attr('value'));
			this.domWorker.add(this, $option, optionObj);
		},
		removeValue: function(value) {
			var key = $.inArray(value.toString(), this.values);
			if(key>-1) {
				this.values.splice(key, 1);
			}
			for(var key in this.selected) {
				if(this.selected[key].value==value) {
					delete this.selected[key];
				}
			}
			var $option = this.$el.find('option[value="'+value+'"]');
			this.domWorker.remove(this, $option, value);
			this.$el.trigger('ic:onChange');
			this.config.onChange(this.$wrap, this.$el, this.values);
		},
		domWorker: {
			add: function(_this, $option, optionObj) {
				$option.attr('selected', 'selected');
				$option.prop('selected', true);
				_this.$el.trigger('blur');
				_this.$wrap.find('[data-value="'+optionObj.value+'"]').addClass('checked');
				_this.$placehoderValues.append(
					_this.templates.render('values', optionObj, true)
				);
				_this.$selectedList.append(
					_this.templates.render('selected', optionObj, true)
				);
				if(_this.values.length<5) {
					_this.$selectedGroup.addClass('disabled');
				} else {
					_this.$selectedGroup.removeClass('disabled');
				}
				if(_this.values.length>0 && _this.$wrap.hasClass('placeholder')) {
					_this.$wrap.removeClass('placeholder').addClass('values');
				}
			},
			remove: function(_this, $option, value) {
				$option.attr('selected', false);
				$option.prop('selected', false);
				_this.$wrap.find('[data-value="'+value+'"]').each(function() {
					var $el = $(this);
					if($el.hasClass('selected')) {
						$el.addClass('acm-animate acm-animate-remove');
						setTimeout(function(){$el.remove();},400);
					} else {
						$el.removeClass('checked');
					}
				});
				if(_this.values.length<5) {
					_this.$selectedGroup.addClass('disabled');
				} else {
					_this.$selectedGroup.removeClass('disabled');
				}
				if(_this.values.length==0 && _this.$wrap.hasClass('values')) {
					_this.$wrap.removeClass('values').addClass('placeholder');
				}
			},
			moveItem: function(_this, $el, direction) {
				if(direction > 0) {
					var delta_h_placeholder = _this.$placehoder.outerHeight(false) - _this.startPositions.placeholder;
					var scroll_position = _this.$dropdown.scrollTop();
					var delta_h = $el.position().top - _this.startPositions.el;
					_this.$dropdown.scrollTop(scroll_position + delta_h + delta_h_placeholder);
				} else {
					setTimeout(function() {
						var delta_h_placeholder = _this.$placehoder.outerHeight(false) - _this.startPositions.placeholder;
						var scroll_position = _this.$dropdown.scrollTop();
						var delta_h = $el.position().top - _this.startPositions.el;
						_this.$dropdown.scrollTop(scroll_position + delta_h + delta_h_placeholder);
					}, 400);
				}
				
			}
		}
	};
	acmSelect.defaults = acmSelect.prototype.defaults;
	$.fn.acmSelect = function(options) {
		return this.each(function() {
			new acmSelect(this, options)
		});
	};
})( jQuery, window , document );