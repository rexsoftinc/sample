;(function( $, window, document, undefined ){
	var fileControls = function(el, options) {
		this.el = el;
		this.$el = $(el);
		this.options = options;
		this.metadata = this.$el.data('options');
	};
	fileControls.prototype = {
		defaults : {
			canUpload: true, 
			moduleConfig: false,
			uploaded: false, 
			canDownload: false,
			url: '',
			type: false,
			changePlaceholder: 'Change',
			deletePlaceholder: 'Delete',
			downloadPlaceholder: 'Download',
			fileInfo: '',
		},
		init: function() {
			if(this.$el.data('init') || this.$el.hasClass('html')) return;
			this.config = $.extend({}, this.defaults, this.options, this.metadata);
			this.getConfigFromModule();
			this.$input = this.$el.find('input');
			this.placeholder = this.$input.attr('placeholder');
			if(this.$el.hasClass('image')) {
				this.config.type = 'image';
			}
			if(this.$el.hasClass('file')) {
				this.config.type = 'file';
			}
			if(this.$el.hasClass('photo')) {
				this.config.type = 'photo';
			}
			if(this.$el.hasClass('anchored')) {
				this.renderAnchor();
			}
			this.renderHtml();
			this.attachEvents();
			this.$el.data('init', true);
			return this;
		},
		getConfigFromModule: function() {
			if (this.config.moduleConfig.indexOf('::')) {
				var tmp = this.config.moduleConfig.split('::');
				var module = Modules.get(tmp[0]);
				var moduleConfig = module[tmp[1]];
				this.config = $.extend(this.config, moduleConfig);
			}
		},
		renderHtml: function () {
			this.placeholder = '<svg class="svg-icon add"><use xlink:href="#ico-add" /></svg>' + this.placeholder;
			switch(this.config.type) {
				case 'image':
					this.$input.wrap('<div class="file-input"></div>').before('<div class="file-input-placeholder">'+this.placeholder+'</div>');
					this.$el.wrapInner('<div class="file-wrap"></div>');
					this.renderImage();
					break;
				case 'file':
					this.$input.wrap('<div class="file-input"></div>').before('<div class="file-input-placeholder">'+this.placeholder+'</div>');
					this.$el.wrapInner('<div class="file-wrap"></div>');
					this.renderFile();
					break;
				case 'photo':
					this.$input.wrap('<div class="file-input"></div>');
					this.$el.wrapInner('<div class="file-wrap"></div>');
					this.renderPhoto();
					break;
			}
			this.$el.wrapInner('<div class="file-cell"></div>');
		},
		renderImage: function() {
			if(this.$el.find('img').length) {
				this.setUpdloaded(true);
			}
			this.$el.append(' \
				<div class="file-aside"> \
					<a href="#" class="file-change" data-action="change"> \
						'+this.config.changePlaceholder+' \
					</a> \
					<div class="file-info"> \
						'+this.config.fileInfo+' \
					</div> \
				</div> \
			');
		},
		renderFile: function() {
			if(this.$el.find('a').length) {
				this.setUpdloaded(true);
			}
			button = (this.config.canDownload) ? 'download' : 'change';
			if(button == 'change') {
				this.$el.append(' \
					<div class="file-aside '+button+'"> \
						<a href="#" class="file-'+button+'" data-action="'+button+'"> \
							<svg class="svg-icon"> \
								<use xlink:href="#ico-download" /> \
							</svg> \
							'+this.config.changePlaceholder+' \
						</a> \
						<div class="file-info"> \
							'+this.config.fileInfo+' \
						</div> \
					</div> \
				');
			}
			if(button == 'download') {
				var url = this.$el.find('a').attr('href');
				this.$el.append(' \
					<div class="file-aside '+button+'"> \
						<a href="'+url+'" class="file-'+button+'" target="_blank"> \
							<svg class="svg-icon"> \
								<use xlink:href="#ico-download" /> \
							</svg> \
							'+this.config.downloadPlaceholder+' \
						</a> \
						<div class="file-info"> \
							'+this.config.fileInfo+' \
						</div> \
					</div> \
				');
			}
			this.$el.append(' \
				<div class="file-aside"> \
					<a href="#" class="file-remove" data-action="remove"> \
						<svg class="svg-icon"> \
							<use xlink:href="#ico-clear" /> \
						</svg> \
						'+this.config.deletePlaceholder+' \
					</a> \
				</div> \
			');
		},
		renderPhoto: function() {
			if(this.$el.find('img').length) {
				this.setUpdloaded(true);
			}
			this.$el.append(' \
				<div class="file-aside add"> \
					<a href="#" class="file-add" data-action="change"> \
						'+this.placeholder+' \
					</a> \
				</div> \
			');
			this.$el.append(' \
				<div class="file-aside"> \
					<a href="#" class="file-change" data-action="change"> \
						'+this.config.changePlaceholder+' \
					</a> \
					<div class="file-info"> \
						'+this.config.fileInfo+' \
					</div> \
				</div> \
			');
			this.$el.append(' \
				<div class="file-aside"> \
					<a href="#" class="file-remove" data-action="remove"> \
						<svg class="svg-icon"> \
							<use xlink:href="#ico-clear" /> \
						</svg> \
						'+this.config.deletePlaceholder+' \
					</a> \
				</div> \
			');
		},
		renderAnchor: function() {
			this.$el.append(' \
				<div class="file-anchor"> \
					<svg class="svg-icon"> \
						<use xlink:href="#ico-upload-arrow" /> \
					</svg> \
				</div> \
			');
		},
		setUpdloaded: function(state) {
			this.config.uploaded = state;
			if(state) {
				this.$el.addClass('uploaded');
			} else {
				this.$el.removeClass('uploaded');
			}
		},
		setFile: function(url, info) {
			this.setUpdloaded(true);
			this.$input.val(''); 
			switch(this.config.type) {
				case 'image':
					if(this.$el.find('img').length) {
						this.$el.find('img').attr('src', url);
					} else {
						this.$el.find('.file-wrap').prepend('<img src="'+url+'" alt="" />');
					}
					this.$el.find('.file-info').text(info);
					break;
				case 'file':
					this.$el.find('.file-info').text(info);
					break;
				case 'photo':
					if(this.$el.find('img').length) {
						this.$el.find('img').attr('src', url);
					} else {
						this.$el.find('.file-wrap').prepend('<img src="'+url+'" alt="" />');
					}
					this.$el.find('.file-info').text(info);
					break;
			}
			
		},
		resetInput: function() {
			this.$input.wrap('<form>').closest('form').get(0).reset();
			this.$input.unwrap();
		},
		attachEvents: function() {
			var _this = this;
			this.$el.on('click', '[data-action]', function(e){
				e.preventDefault();
				var action = $(this).data('action');
				if(_this.events.hasOwnProperty(action)) {
					_this.events[action](_this, $(this));
				} 
			}); 
			if(this.config.canUpload) {
				this.$el.on('change', 'input', function(e){
					e.preventDefault();
					_this.events.upload(_this, $(this));
				});
			} else {
				this.$el.on('change', 'input', function(e){
					e.preventDefault();
					_this.events.choose(_this, $(this));
				});
			}
		},
		events: {
			change: function(_this, $el) {
				_this.$input.trigger('click');
			},
			choose: function(_this, $el) {
				_this.setUpdloaded(false);
				var fileName = $el.val().split('\\').pop();
				if(fileName!='') {
					_this.$el.find('.file-input-placeholder').html(fileName);
					_this.$el.addClass('choosen');
				} else {
					_this.$el.find('.file-input-placeholder').html(_this.placeholder);
					_this.$el.removeClass('choosen');
				}
			},
			upload: function(_this, $el) {
				if(!_this.config.url) return;
				var formData = new FormData();
				formData.append($el.attr('name'), $el.prop('files')[0]);
				formData.append('task', 'upload');
				Ajax.json({
					url: _this.config.url,
					data: formData,
					success: function(response) {
						_this.$input.val(''); 
						if(response.status) {
							_this.setFile(response.url, response.fileInfo);
						}
					}
				});
			},
			remove: function(_this, $el) {
				if(!_this.config.url) return;
				var formData = new FormData();
				formData.append('file', _this.$input.attr('name'));
				formData.append('task', 'remove');
				if(_this.config.itemId) {
					formData.append('itemId', _this.config.itemId);
				}
				Ajax.json({
					url: _this.config.url,
					data: formData,
					success: function(response) {
						if(response.status) {
							_this.setUpdloaded(false);
						}
					}
				});
			},
		},
	};
	fileControls.defaults = fileControls.prototype.defaults;
	$.fn.fileControls = function(options) {
		return this.each(function() {
			new fileControls(this, options).init();
		});
	};
})( jQuery, window , document );
