;(function( $, window, document, undefined ){
	var mobilContent = function(el, options) {
		this.el = el;
		this.$el = $(el);
		this.options = options;
		this.metadata = this.$el.data('options');
	};
	mobilContent.prototype = {
		opened: false,
		defaults : {
			container: false,
			bordered: false
		},
		init: function() {
			if(this.$el.data('init')) return;
			this.config = $.extend({}, this.defaults, this.options, this.metadata);
			this.title = this.$el.data('title');
			this.renderHtml();
			this.attachEvents();
			this.$el.data('init', true);
			return this;
		},
		renderHtml: function () {
			var wrap_classes = '';
			if(this.config.bordered || this.$el.hasClass('bordered')) wrap_classes += ' bordered';
			this.$wrap = this.$el.wrap('<div class="plg-mobilContent-wrap'+wrap_classes+'" />').closest('.plg-mobilContent-wrap');
			this.$el.addClass('plg-mobilContent');
			this.$el.before(' \
				<a href="#" class="plg-mobilContent-button open" data-mc-action="open"> \
					<svg class="svg-icon"> \
						<use xlink:href="#ico-menu" /> \
					</svg> \
					'+this.title+' \
				</a> \
				<a href="#" class="plg-mobilContent-button close" data-mc-action="close"> \
					<svg class="svg-icon"> \
						<use xlink:href="#ico-menu-close" /> \
					</svg> \
					Hide '+this.title.toLowerCase()+' \
				</a> \
			');
			this.$open_button = this.$wrap.find('.plg-mobilContent-button.open');
			this.$close_button = this.$wrap.find('.plg-mobilContent-button.close');
			$('.page-body').addClass('mobilContent');
		},
		attachEvents: function() {
			var _this = this;
			this.$wrap.find('[data-mc-action]').click(function(e){
				e.preventDefault();
				_this.$el.trigger('mc:'+$(this).data('mc-action'));
			});
			this.onOpen(_this);
			this.onClose(_this);
		},
		onOpen: function(_this) {
			this.$el.on('mc:open',function(e) {
				if(_this.opened == true) return;
				_this.opened = true;
				$(this).trigger('mc:onOpen');
				if(_this.$wrap.hasClass('opened')) {
					return;
				}
				$('body').addClass('plg-mobilContent-body');
				_this.$wrap.addClass('opened');
				_this.$el.slideDown().animate({opacity: 1},{queue: false});
				_this.$open_button.animate({height:0}, 200, function() {
					_this.$close_button.animate({height:48},200);
				});
			});
		},
		onClose: function(_this) {
			this.$el.on('mc:close',function(e) {
				if(_this.opened == false) return;
				_this.opened = false;
				$(this).trigger('mc:onClose');
				if(!_this.$wrap.hasClass('opened')) {
					return;
				}
				_this.$el.slideUp().animate({opacity: 0},{queue: false});
				_this.$close_button.animate({height:0}, 200, function() {
					_this.$open_button.animate({height:48},200);
					$('body').removeClass('plg-mobilContent-body');
					_this.$wrap.removeClass('opened');
				});
			});
		}
	};
	mobilContent.defaults = mobilContent.prototype.defaults;
	$.fn.mobilContent = function(options) {
		return this.each(function() {
			new mobilContent(this, options).init();
		});
	};
})( jQuery, window , document );