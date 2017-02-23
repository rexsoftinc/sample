;(function( $, window, document, undefined ){
	var tableRender = function(el, options) {
		this.el = el;
		this.$el = $(el);
		this.options = options;
		this.metadata = this.$el.data('options');
		this.init();
	};
	tableRender.prototype = {
		structure: [],
		filter: [],
		defaults : {
			env: '',
			alphaKey: 'email',
			baseUrl: '',
			formSelector : false, 
			formSubmitSelector: false,
			jsValidation: false,
			messages: {
        		empty: 'No Entries',
        		button: 'Add' 
       		},
			groupHtml: function(obj) {
				return '\
					<div class="items-group'+((obj.hidden)?' filtered':'')+'" data-key="'+ obj.name +'">\
					 	' + this.list('item', obj.childs) + '\
					 	<div class="items-group-title col-xs-12 col-sm-1">\
						 ' + obj.name + '\
					 	</div>\
					</div>\
				 ';
			},
			itemHtml: function(obj) {
				return '';
			}
		},
		init: function() {
			this.config = $.extend({}, this.defaults, this.options, this.metadata);
			this.templates.group = this.config.groupHtml;
			this.templates.item = this.config.itemHtml;
			this.title = this.$el.data('title');
			var _this = this;
			this.getData(function() {
				_this.renderHtml();
				_this.attachEvents();
			});
			return this;
		},
		update: function() {
			var _this = this;
			this.getData(function() {
				_this.$filter.empty();
				_this.$content.empty();
				_this.renderFilter();
				_this.renderContent();
			});
			return this;
		},
		ajax: function(url, params, callback) {
			params = $.extend(true, {}, {
		        type: 'post',
		        url: this.config.baseUrl + url,
		        dataType: 'json',
		        cache: false,
		        success: function(response) {
                	callback(response);
                }
		    }, params);
		    $.ajax(params);
		},
		getData: function(callback) {
            var _this = this;
            this.ajax('json', {
            	data: {parentId: this.config.parentId} 
            }, function(data) {
            	_this.makeStructure(data);
				callback();
            });
		},
		getForm: function() {
			if(this.config.formSelector) {
				return $(this.config.formSelector);
			}
			if(this.config.formSubmitSelector) {
				return $(this.config.formSubmitSelector).closest('form');
			}
		},
		getFormHtml: function(data, callback) {
			var post = $.extend({}, {
				companyId: this.config.companyId,
				env:  this.config.env,
				html: 1
			}, data);
			this.ajax('edit', {
	            data: post,
			}, function(data) {
	           callback(data);
			});
		},
		makeStructure: function (data) {
			this.structure = {};
			for(var i in data) {
				var key = data[i]['id'];
				if(this.config.alphaKey && data[i][this.config.alphaKey]!='') {
					key = data[i][this.config.alphaKey][0];
					key = key.toUpperCase();
				}
				if(this.structure[key]==undefined) {
					this.structure[key] = {
						name: (this.config.alphaKey)? key : '',
						type: 'group',
						childs: [],
						hidden: (this.filter.length && this.filter.indexOf(key) < 0)? true : false,
						filter: (this.filter.length && this.filter.indexOf(key) > -1)? true : false,
					};
				}
				this.structure[key].childs.push(data[i]);
			}
		},
		renderHtml: function() {
			this.$el.append(' \
				<div class="items-title"> \
					'+this.title+' \
					<div class="filter"> \
					</div> \
				</div> \
			');
			this.$el.append(' \
				<div class="items-content"> \
				</div> \
			');
			this.$el.append(' \
				<div class="add"> \
					<a href="#" data-action="scroll" class="ui-button grey width-auto">'+this.config.messages.button+'</a> \
				</div> \
			');
			this.$filter = this.$el.find('.filter');
			this.$content = this.$el.find('.items-content');
			this.$form = this.getForm();
			this.renderFilter();
			this.renderContent();
		},
		renderFilter: function() {
			this.$filter.empty();
			var length = $.map(this.structure, function(v, i) { return i; }).length;
			if(length && this.config.alphaKey) {
				this.$filter.append(' \
					<span>Filter:</span> \
					'+this.templates.render('filter', this.structure)+' \
				');
			}
		},
		renderContent: function() {
			this.$content.empty();
			var length = $.map(this.structure, function(v, i) { return i; }).length;
			if(length) {
				this.$content.append(this.templates.render('structure', this.structure));
			} else {
				this.$content.append('<span class="items-empty">'+this.config.messages.empty+'</span>');
			}
		},
 		templates: {
			render: function(template, data) {
				return this[template](data);
			},
			filter: function(arr) {
				var html = '';
				for(var i in arr) {
					html += '<a href="#" class="'+((arr[i].filter)?'active':'')+'" data-action="filter" data-key="'+i+'">'+i+'</a>';
				}
				return html;
			},
			structure: function(arr) {
				var html = '';
				for(var i in arr) {
					html += this.render(arr[i].type, arr[i]);
				}
				return html;
			},
			list: function(template, arr) {
				var html = '';
				for(var i in arr) {
					html += this.render(template, arr[i]);
				}
				return html;
			},
			group: function(obj) {return '';},
		},
		attachEvents: function() {
			var _this = this;
			this.$el.on('click', '[data-action]', function(e){
				e.preventDefault();
				var action = $(this).data('action');
				if(_this.events.hasOwnProperty(action)) {
					_this.events[action](_this, $(this));
				} else {
					console.log('tableRender: Action not registered');
				}
			}); 
			this.$el.on('tbl:update', function(e) {
				_this.update();
				$('html, body').animate({
					scrollTop: $(_this.$el).offset().top
				}, 500);
			});
			$(document).on('submit', this.$form, function(e) {
				e.preventDefault();
				if(e.target == _this.$form[0]) {
					_this.events.save(_this, _this.$form);
				}
				return false;
			});
		},
		events: {
			scroll: function(_this, $el) {
				_this.domWorker.scrollTo(_this.$form);
			},
			dropdown: function(_this, $el) {
				var $item = $el.closest('.item');
				if($item.hasClass('opened')) {
					$item.attr('style', false);
				} else {
					$item.css('height', $item.height());
				}
				$el.closest('.item').toggleClass('opened');
				$el.closest('.items-group').next().slideToggle(200);
			},
			filter: function(_this, $el) {
				var key = $el.data('key');
				var index = _this.filter.indexOf(key);
				if (index > -1) {
					_this.filter.splice(index, 1);
				} else {
					_this.filter.push(key);
				}
				_this.domWorker.filter($el, _this.filter);
			},
			edit: function(_this, $el) {
				var itemId = $el.closest('.item').data('id');
				_this.getFormHtml({ id: itemId }, function(data) {
	            	_this.domWorker.fillForm(_this.$form, data.html);
	            	_this.domWorker.scrollTo(_this.$form);
	            });
			},
			save: function(_this, $form) {
				var formData = new FormData($form[0]);
				_this.ajax('save', {
	            	data: formData,
	            	processData: false,
					contentType: false,
	            }, function(data) {
	            	App.update(data);
	            	if(data.status) {
						_this.$el.trigger('tbl:update');
						_this.getFormHtml({ id: false }, function(data) {
			            	_this.domWorker.fillForm(_this.$form, data.html);
			            });
		            }
	            });
			},
			delete: function(_this, $el) {
				var itemId = $el.closest('.item').data('id');
				_this.ajax('delete/'+itemId, {
					companyId: _this.config.companyId,
					id: itemId
				}, function(data) {
					App.update(data);
					_this.$el.trigger('tbl:update');
				});
			},
		},
		domWorker: {
			scrollTo: function($el) {
				$('.js-mobilContent').trigger('mc:close');
				var fixed_offset = parseInt($('.page-body').css('padding-top')) + 20;
				var top = $el.offset().top - fixed_offset;
				$('html,body').animate({scrollTop: top}, 200);
			},
			filter: function($el, keys) {
				$el.toggleClass('active');
				if(keys.length>0) {
					$('.items-group').addClass('filtered');
					for(var i in keys) {
						$('.items-group.filtered[data-key="'+keys[i]+'"]').removeClass('filtered');
					}
				} else {
					$('.items-group').removeClass('filtered');
				}
			},
			fillForm: function($form, html) {
				$form.empty().append(html);
				App.stylize();
			}
		}
	};
	tableRender.defaults = tableRender.prototype.defaults;
	$.fn.tableRender = function(options) {
		return this.each(function() {
			new tableRender(this, options);
		});
	};
})( jQuery, window , document );
