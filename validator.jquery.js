(function( $ ) {
 
  $.fn.Validator = function( options ) {
	
	// Setup default option values
	var defaults = {		
		errors : {
		"text": "This field is required",
		"email": "Please provide a valid email address",
		"int": "Please provide a valid number",
		"custom": "This field is required",
		"phone": "Please provide a valid phone number",
		"select": "This field is required",
		"radio": "This field is required",
		"checkbox": "This field is required" },
		errorElement : 'span',
		errorClass : 'error'
	};
	
	
	var settings = $.extend( {}, defaults, options );
	
	$(this).on('submit', function(){
		var errors = GatherRequired($(this));
		
		
		if (settings.submitHandler && errors == 0) {
			settings.submitHandler($(this));
			return false;
		}
		
		return errors == 0;
	});
	
	var GatherRequired = function(form) {
	
		var elems = form.find('.required');
			errors = new Array();
			i = 0;
			
		$.each(elems, function(){		
			var type = getType($(this));
			
			if(ValidateField($(this), type) == false){
					if(settings.errorHandler){
						settings.errorHandler(settings.errors[type]);
					} else {
						reportError($(this), type);
					}
					errors[i] = $(this);
			}		
			i++;
		});	
		return errors;
	}

	var getType = function(field){
		// check to see if it has a custom data type already set
		if(typeof(field.data('expect')) !== 'undefined' && field.data('expect').length > 0){
			return field.data('expect');
		}
		
		if(hasParent(field) === true && typeof(field.data('inherit-type')) !== 'undefined'){
			return inheritType(field);
		}
		
		switch(field.prop('tagName')){
			case 'INPUT':
				return field.attr('type');
				break;
			case 'SELECT':
				return 'select';
				break;
			case 'TEXTAREA':
				return 'text';
				break;
		}	
		
		return 'text';
	}
	
	var inheritType = function(field) {
		var parent = $("#"+field.data('dependant')+"");
		
		if(parent.val().length > 0){
			return parent.val();
		}
		return 'text';
	}

	var ValidateField = function(field, type, report) {
		var value = field.val();
			regex = '';
			
		if(hasParent(field) === true){
			if(checkDependant($("#"+field.data('dependant'))) === false){
				return true;
			}
		}
		
		if(type == 'text' || type == 'email' || type == 'int' || type == 'phone' || type == 'select'){
			if(value.length == 0 || typeof(value) === 'undefined'){								
				return false;
			}			
		}
		
		if(type == 'phone' || type == 'email' || type == 'custom'){			
			if(typeof(field.data('rules')) !== 'undefined'){
				regex = field.data('rules');
			}
			return checkRegex(value, type, regex);
		}
		
		switch(type){			
			case 'int':
				return $.isNumeric(value);
				break;
			case 'checkbox': case 'radio':
				return $("input[name="+ field.attr('name') +"]").is(':checked');
				break;         
		}				
		
		return true;
	}
	
	var hasParent = function(field) {
		if(typeof(field.data('dependant')) !== 'undefined' && field.data('dependant').length > 0){
			return true;
		}
	}
	
	var checkDependant = function(field) {	
		return ValidateField(field, getType(field));
	}
		
	var checkRegex = function(value, type, regex){
		switch(type){
			case 'email':
					var reg = /[^\s@]+@[^\s@]+\.[^\s@]+/;
				break;
			case 'phone':
					var reg = /[0-9]{10}/;
				break;
			case 'custom':
					var reg = new RegExp(regex);
				break;
		}
		return reg.test(value);
	}

	var reportError = function(field, type){
		var error = '';
		
		if(hasParent(field) === true && hasError(field) === true){
			resetError(field);
			placeError(field, settings.errors[type]);
			bindListener(field);
		}
		
		if(hasError(field) === false){			
			placeError(field, settings.errors[type]);
			bindListener(field);
		}
		
		return false;
	}	

	var hasError = function(field) {
		if(field.parent().find('.'+settings.errorClass+'').length > 0){
			return true;
		}
		return false;
	}

	var placeError = function(field, error) {
		if(settings.errorWrapper){
			error = '<'+settings.errorWrapper+'>'+ error +'</'+settings.errorWrapper+'>';
		}
		field.parent().append('<'+settings.errorElement+' class="'+settings.errorClass+'">' + error + '</'+settings.errorElement+'>');
	}

	var resetError = function(field) {
		field.parent().find('.'+ settings.errorClass +'').remove();
	}

	var bindListener = function(field) {
		$(field).on("change", function(){
			if(ValidateField(field, getType(field), true) === true){
				resetError(field);
			}
		});
	}
 
}
 
})( jQuery );
