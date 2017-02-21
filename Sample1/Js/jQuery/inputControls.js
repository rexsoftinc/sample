;(function( $, window, document, undefined ){
	var inputControls = function(el, options) {
		this.el = el;
		this.$el = $(el);
		this.options = options;
		this.metadata = this.$el.data('options');
	};
	inputControls.prototype = {
		defaults : {
			animationSpeed: 400,
			buttons: 'edit,clear,save',
			actions: {
				edit: {
					visible: true,
					call: 'onEdit',
					classStr: 'ic-hover'
				},
				clear: {
					visible: true,
					call: 'onClear',
					classStr: 'ic-hover'
				},
				add: {
					visible: true,
					call: 'onAdd',
					classStr: ''
				},
				save: {
					visible: true,
					call: 'onSave',
					classStr: ''
				},
				blur: {
					visible: false,
					call: 'onBlur',
					classStr: ''
				}
			},
			onEdit: function($wrap, $input) {
				$wrap.addClass('preEdit').changeClassDelay('preEdit', 'onEdit');
				$input.attr('disabled', false).focus();
				pos = $input.val().length * 2;
				$input[0].setSelectionRange(pos,pos);
			},
			onClear: function($wrap, $input) {
				$input.val('').trigger('ic:save');
				$wrap.reset();
				if($input.data('add') && $('.js-inputControls[name="'+ $input.attr('name') +'"]').length > 1) {
					$wrap.remove();
				}
			},
			onAdd: function($wrap, $input) {
				var $clone = $input.clone();
				$clone.val('');
				$wrap.after($clone);
				$clone.inputControls();
			},
			onSave: function($wrap, $input) {
				$wrap.addClass('onSave'); //.removeClass('onEdit');
			},
			onBlur: function($wrap, $input) {
				var value = $input.val();
				if(value==$input.data('sourceVal')) {
					$input.attr('disabled', true);
					$wrap.reset();
				}
			},
		},
		init: function() {
			if(this.$el.data('inputControls')) return;
			this.config = $.extend({}, this.defaults, this.options, this.metadata);
			this.parseDataAttr();
			this.$el.data('sourceVal', this.$el.val());
			this.$el.data('inputControls', 1);
			this.renderHtml();
			this.setStyles();
			this.setButtons();
			this.attachEvents();
			return this;
		},
		parseDataAttr: function() {
			if(this.$el.data('add')) {
				this.config.buttons += ',add';
			}
		},
		renderHtml: function () {
			this.$wrap = this.$el.wrap('<div class="plg-inputControls" />').closest('.plg-inputControls');
			this.$wrap.reset = function() {
				$(this).attr('class', 'plg-inputControls');
				var $input = $(this).find('input');
				$input.attr('disabled', 'disabled');
				$input.data('sourceVal', $input.val());
			};
			var delay = this.config.animationSpeed;
			this.$wrap.changeClassDelay = function($oldClass, $newClass) {
				var $el = $(this);
				setTimeout(function() {
					$el.removeClass($oldClass).addClass($newClass);
				}, delay);
				return this;
			};
		},
		setStyles: function() {
			var style = '';
			var animationDurationVendors = [
				'-webkit-animation-duration',
				'-moz-animation-duration',
				'-ms-animation-duration',
				'-o-animation-duration',
				'animation-duration'
			];
			var animStyle = this.config.animationSpeed/1000;
			for (var i=0; i < animationDurationVendors.length; i++) {
				style += animationDurationVendors[i]+':'+animStyle+'s;';
			};
			this.$wrap.attr('style', style);
			this.$el.attr('disabled', 'disabled');
		},
		setButtons: function() {
			var buttons = this.config.buttons.split(',');
			var actions = $.extend( {}, this.config.actions );
			for (var i=0; i < buttons.length; i++) {
				if(actions[buttons[i]] && actions[buttons[i]].visible) {
					actions[buttons[i]] = this.getButtonHtml(buttons[i], actions[buttons[i]].classStr);
				}
			};
			actions = $.map(actions, function(val, i) {
				if(typeof(val)=='string') return val;
			});
			this.$wrap.append(' \
				<div class="ic-actionsPanel"> \
					'+actions.join('')+' \
				</div> \
			');
		},
		getButtonHtml: function(action, classStr) {
			return ' \
				<a href="#" data-action="'+action+'" class="ic-actionButton '+classStr+'"> \
					<svg class="svg-icon"> \
						<use xlink:href="#ico-'+action+'" /> \
					</svg> \
				</a> \
			';
		},
		attachEvents: function() {
			var _this = this;
			var actions = $.extend( {}, this.config.actions );
			for(var i in actions) {
				this[actions[i].call](_this);
			}
			this.$wrap.find('[data-action]').click(function(e){
				e.preventDefault();
				_this.$el.trigger('ic:'+$(this).data('action'));
			});
			this.$el.on('ic:reset', function(e){
				e.preventDefault();
				_this.$wrap.reset();
			});
		},
		onEdit: function(_this) {
			this.$el.on('ic:edit',function(e) {
				$(this).trigger('ic:onEdit');
				_this.config.onEdit(_this.$wrap, $(this));
			});
		},
		onClear: function(_this) {
			this.$el.on('ic:clear',function(e) {
				$(this).trigger('ic:onClear');
				_this.config.onClear(_this.$wrap, $(this));
			});
		},
		onAdd: function(_this) {
			this.$el.on('ic:add',function(e) {
				$(this).trigger('ic:onAdd');
				_this.config.onAdd(_this.$wrap, $(this));
			});
		},
		onSave: function(_this) {
			this.$el.on('ic:save',function(e) {
				$(this).trigger('ic:onSave');
				_this.config.onSave(_this.$wrap, $(this));
			});
		},
		onBlur: function(_this) {
			this.$el.on('blur',function(e) {
				$(this).trigger('ic:onBlur');
				_this.config.onBlur(_this.$wrap, $(this));
			});
		},
	};
	inputControls.defaults = inputControls.prototype.defaults;
	$.fn.inputControls = function(options) {
		return this.each(function() {
			new inputControls(this, options).init();
		});
	};
})( jQuery, window , document );
