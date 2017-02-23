var Validator = {
	init: function() {
		var _this = this;
		$('form').each(function(index) {
			var name = $(this).attr('name');
			if(ValitatorRules.hasOwnProperty(name)) {
				rules = ValitatorRules[name]();
				$(this).validate({
					errorContainer: '.ui-validation-wrap',
					errorElement: 'label',
					focusInvalid: false,
					focusCleanup: true,
					errorClass: 'ui-validation-error',
					rules: rules,
					errorPlacement: function(error, el) {
						Validator.setError($(el), error);
					},
					highlight: function(el, errorClass, validClass) {
						var $el = Validator.defineElement($(el));
						if($el) {
							if($el.hasClass('ui-checkbox')) {
								$el.addClass('ui-validation-highlight');
								return;
							};
							$el.removeClass(validClass).addClass(errorClass);
						}
					},
					unhighlight: function(el, errorClass, validClass) {
						var $el = Validator.defineElement($(el));
						if($el) {
							$el.removeClass('ui-validation-highlight');
							$el.removeClass(errorClass).addClass(validClass);
						}
					},
					invalidHandler: function(e, validator) {
						var current = $('body').scrollTop();
						var target = $(e.target).offset().top;
						if(current > target) {
							$('html, body').animate({
								scrollTop: $(e.target).offset().top - 75
							}, 500);
						}
					}
				});
			}
		});
	},
	parseJson: function(errors) {
		for (var name in errors) {
			Validator.setError($('[name="' + name + '"]'), '<label id="' + name + '-error" class="ui-validation-error" for="' + name + '">' + errors[name][0] + '</label>');
		}
	},
	reset: function() {
		$('.ui-validation-error .error').remove();
	},
	setError: function($el, message) {
		var $el = this.defineElement($el);
		if($el) {
			this.domWorker.error($el);	
			this.domWorker.message($el, message);
		}
	},
	defineElement: function($el) {
		if($el.prop('tagName') == undefined) return;
		var tagName = $el.prop('tagName').toLowerCase();
		if(tagName=='input') {
			switch($el.attr('type')) {
				case 'checkbox':
					return $el.closest('.ui-checkbox');
					break;
				default: 
					return $el;
					break;
			}
		}
		if(tagName=='select') {
			if($el.closest('.jq-selectbox').length) {
				return $el.closest('.jq-selectbox');
			}
			if($el.closest('.plg-acmSelect').length) {
				return $el.closest('.plg-acmSelect');
			}
			return $el;
		}
		if(tagName=='textarea') {
			if($el.attr('name') == 'g-recaptcha-response') {
				return false;
			}
			return $el;
		}
		return false;
	},
	domWorker: {
		error: function($el) {
			if($el.hasClass('ui-checkbox')) {
				$el.addClass('ui-validation-highlight');
				return;
			};
			$el.addClass('ui-validation-error');
		},
		message: function($el, message) {
			if($el.hasClass('ui-checkbox')) return;
			if($el.prev('.ui-validation-wrap').length) {
				$el.prev('.ui-validation-wrap').empty().append(message);
			} else {
				$('<div class="ui-validation-wrap"></div>').insertBefore($el).append(message);
			}
		}
	}
};
var ValitatorRules = {
	'beta-form': function() {
		return {
			pass: {
				required: true
			},
		};
	},
};

$.validator.addMethod("multiselect", function (value, el) {
    var count = $(el).find('option:selected').length;
    return count > 0;
});

$.validator.addMethod("emailfull", function (value, el) {
    var regexp = /[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/;
    return regexp.test(value);
}, 'Enter a valid email address.');

$.validator.addMethod("phonechars", function (value, el) {
	if(value=='') return true;
    var regexp = /^[\s()+-]*([0-9][\s()+-]*){6,20}$/;
    return regexp.test(value);
}, 'Enter a valid phone number.');

$.validator.addMethod("urllinks", function (value, el) {
	if(value=='') return true;
    //var regexp = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
    var regexp = new RegExp(
		"^" +
		// protocol identifier (optional) + //
		"(?:(?:https?:)?//)?" +
		// user:pass authentication (optional)
		"(?:\\S+(?::\\S*)?@)?" +
		// host (optional) + domain + tld
		"(?:(?!-)[-a-z0-9\\u00a1-\\uffff]*[a-z0-9\\u00a1-\\uffff]+(?!./|\\.$)\\.?){2,}" +
		// server port number (optional)
		"(?::\\d{2,5})?" +
		// resource path (optional)
		"(?:/\\S*)?" +
		"$", "i"
	);
    return regexp.test(value);
}, 'Enter a valid url.');


function ValidstateCountry() {
	var countryId = $('select[name*="countryId"]').val();
    return (countryId==1);
}
