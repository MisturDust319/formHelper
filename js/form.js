//this will use the object.create() function, so define it if not given
if (typeof Object.create !== 'function') {
	Object.create = function(o){
		function F() {}
		
		F.prototype = o;
		return new F();
	};
}
//a helper method for dealing with inheritence
function inheritPrototype(childObject, parentObject) {
	// As discussed above, we use the Crockford’s method to copy the properties and methods from the parentObject onto the childObject​
	// So the copyOfParent object now has everything the parentObject has ​
	var copyOfParent = Object.create(parentObject.prototype);

	//Then we set the constructor of this new object to point to the childObject.​
	// Why do we manually set the copyOfParent constructor here, see the explanation immediately following this code block.​
	copyOfParent.constructor = childObject;

	// Then we set the childObject prototype to copyOfParent, so that the childObject can in turn inherit everything from copyOfParent (from parentObject)​
	childObject.prototype = copyOfParent;
}

function Field(argObject) {
	
	//for regular use, you need at least these properties set in
	//args obj:
	//	name: a name to identify the field with
	//	id: some sort of identification for the field
	//	fetch: function, rules for getting the data from this field element
	//	failure: function, rules to decide how to deal with invalid data
	//	success: function, rules to decide how to deal with valid data
	//these are not required, but without custom validators, these will be 
	//needed to run the default validators:
	//	min: int, minimum text input
	//	max: int, maximum text input
	//	required: boolean, if true, this field is required for input
	//lastly, there is the validator array,
	//	an array of objects containing a callback function, called a validator,
	//	and a value that validator might need that is stored in the Field object
	//		stored like so: 
	//			{"validator" : function(),
	//			 "options"	 : *}
	//	Each validator takes up to 2 arguments:
	//		1. "data": the data to be processed
	//		2. "options": string, name of extra data to be retrieved
	//			from the field obj
	//	And each validator returns false if the data passes its test, but
	//		returns an error message if the data doesn't
	//
	
	
	//first, the argObject is required to be provided
	//throw an error if it wasn't
	if(!argObject) {
		throw new TypeError(
			"You failed to provide an arguments object"
		);
	}
	
	this.argObject = argObject;
	
	/*
	//the name is something that will allow you to identify the object
	this.name;
	//the id is the particular html form item this represents
	this.id;
	//fetch is a callback which dictates how the data is retrieved
	//from the form item
	this.fetch;
	//success is a callback that decides what is done when the data
	//	passes through all validation tests
	this.success;
	//failure is a callback that dictates how failing a validation test 
	//	is handled
	this.failure;
	*/
	//a default list of validators to use if none are provided
	this.defaultValidators =
					[ 
						{ "validator" : validateRequired, "options" : "required" },
						{ "validator" : validateMinLength, "options": "min" },
						{ "validator" : validateMaxLength, "options": "max" },
						{ "validator" : validateNoHtml }
					];	
	//get a list of validator functions from the argObject
	//validators are functions that return an error message if
	//	the data doesn't pass their inspection, and false if it does
	this.validators;	
}
//set up Field's prototype
Field.prototype = {
	constructor : Field,
	checkForArg : function(argName, defaultArg) {
		//checkForArg will try to find a value in argObject
		//if it finds it, it returns it
		//if it doesn't, it tries to provide a default argument
		//if none is provided, it throws an error
		
		//if the argName itself is undefined, then we aren't searching
		//for anything, so don't return anything
		if(argName === undefined) {
			return;
		}
		//throw error if no item of that name was found
		//and no default was found
		else if(this.argObject[argName] === undefined) {
			//if a default value was found, give it
			if(defaultArg) {
				return defaultArg;
			}
			throw new TypeError(argName +
				" was not given in the arguments object but is needed"
			);
		}
		else {
			return this.argObject[argName];
		}
	},
	isInit : false, //isInit is false if the Field wasn't initialized
	init : function() {
		//init sets up important values for Field
		this.name = this.checkForArg("name");
		this.id = this.checkForArg("id");
		this.fetch = this.checkForArg("fetch");
		this.success = this.checkForArg("success");
		this.failure = this.checkForArg("failure");
		
		this.validators = this.checkForArg("validators", this.defaultValidators);
		
		this.isInit = true;
	},
	useFieldItem : function(callback, options) {
		//allow the dev to select how the form item is grabbed
		//try to run the callback
		try {
			//if there is some optional part, call callback with it
			if(options) {
				callback.call(this.id, options);
			}
			else {
				callback.call(this.id);
			}
		}
		//if not possible, catch the error and log it
		catch(exception) {
			console.log("Exception running callback: " + exception.message);
		}
	},	
	getFieldData : function() {
		//fetch will decide how data is retrieved from the field
		//call fetch on id
		try {
			return this.fetch.bind(this.id)();
		}
		catch(exception) {
			console.log("Exception fetching field data: " + error.message);
		}
	},	
	validate : function(data) {
		//validate removes invalid data, and warns the users of bad input
		//returns true if successful, false otherwise
		try {
			for(var i in this.validators) {
				//get the validator obj
				var validatorPair = this.validators[i];
				
				//seperate the callback and the options from 
				//the object
				var validateCallback = validatorPair["validator"];
				var validateOptions  = this.checkForArg(validatorPair["options"]);
				
				//call the validateCallback, and if it returns an error message
				//return false, and call failure callback with that message
				var validationStatus = validateCallback(data, validateOptions);
				
				//otherwise, continue testing with the other validators
				if( validationStatus !== false ) {
					//get & run the failed callback
					this.useFieldItem(this.failure, validationStatus);
					
					return false;
				}
			}
						
			//if the data survived that gauntlet, 
			//call success callback and return true
			this.useFieldItem(this.success);
			return true;
		}
		catch(exception) {
			//print error to log
			console.log("Exception when validating data: " + exception);
		}
	},	
	getData : function() {
		//getData grabs the data from the text field, then validates it
		//if it passes the validator, then it returns the data for further
		
		//if obj isn't init'd, do so
		if(!this.isInit){
			this.init();
		}
		
		//get the data from the form 
		var data = this.getFieldData();

		//if validate returns true, return
		//an object with a name and a value
		if(this.validate(data)) {
			return { 
				"name" : this.name,
				"value" : data
			};
		}
		//otherwise return false
		else {
			return false;
		}
	}
}



//create an email field that inherits from Field
function EmailField(argObject) {
	//set EmailField's default list of validators
	//by default, EmailField doesn't accept html,
	//requires a valid email, and may be required
	this.defaultValidators = 
	[
		{"validator" : validateNoHtml},
		{"validator" : validateEmailAddress},
		{"validator" : validateRequired,
		"options" 	 : "required"}
	];
	
	this.argObject = argObject;
}
inheritPrototype(EmailField, Field);

//create a checkbox field that inherits from Field
function CheckboxField(argObject) {
	//set CheckboxField's default list of validators
	//by default, CheckboxField doesn't accept html,
	//accepts only a predefined list of input,
	//and may be required
	this.defaultValidators = 
	[
		{"validator" : validateNoHtml},
		{"validator" : validateCheckbox,
		"options"	:	"checkboxValues"},
		{"validator" : validateRequired,
		"options" 	 : "required"}
	];
	
	this.argObject = argObject;
}
inheritPrototype(CheckboxField, Field);

//FieldHandler holds a list of Fields, and simplfies working
//	with a group of fields.
function FieldHandler() {
	//init this.fields to an empty array
	this.fields = [];
}
//now setup FieldHandler's prototype
FieldHandler.prototype = {
	constructor : FieldHandler,
	addField : function(type, argObject) { //adds a field object 
		//some input validation: argObject has to be an object
		//	if it isn't, throw an error
		if(typeof argObject !== "object") {
			throw new TypeError("The second argument for FieldHandler.addField must be an object");
		}
		if(type === "text") { //if it is a text field, add one
			this.fields.push(new Field(argObject));
		}
		else if(type === "email") { //add an email field
			this.fields.push(new EmailField(argObject));
		}
		else if(type === "checkbox") { //add a checkbox
			this.fields.push(new CheckboxField(argObject));
		}
	},
	makeFields : function(fieldArray) { 
		//makeFields uses addField for each item in an array
		if(!Array.isArray(fieldArray)) {
			throw new TypeError("makeFields accepts an array of fields and their setup data.");
		}
		else {
			//call addField for each item supplied
			
			for(var i = 0; i < fieldArray.length; i++) {
				type = fieldArray[i][0];
				argObject = fieldArray[i][1];
				this.addField(type, argObject);
			}
		}
	},
	//validateFields will run through each field,
	//	and return true if they ALL return valid data, false
	//	otherwise
	validateFields : function() {
		var results = this.fields.reduce(function(prev, field){
			return field.getData() && prev;
		}, true);
		
		return results;
	},
	//getData will return a JSON string of data if all data in fields is valid
	//	OR false otherwise
	getData : function() {
		//if all data in fields is valid, return it as a JSON string
		if(this.validateFields()) {
			//an empty object to hold all the output data
			var formData = {};
			this.fields.forEach(function(field){
				var fieldData = field.getData();
				var name = fieldData.name;
				var value = fieldData.value;
				
				//set the data at name to value
				formData[name] = value;
			});
			
			return formData;
		}
		//otherwise return false
		else {
			return false;
		}
	}
}

//a prebuilt validator that will disallow html
function validateNoHtml(data) {
	//return false if data is null/undefined
	if(data === null || data === undefined) {
		return false;
	}
	//force data to be a string
	data = data.toString();
	
	//define an regex to catch markup tags
	var htmlRE = /<.*?>/g;
	//if no match is found, return false
	if(data.search(htmlRE) === -1) {
		return false;
	}
	//otherwise, send a message about not accepting html
	else {
		return "This form doesn't accept html";
	}
}

//a premade validation callback used to validate required fields
function validateRequired(data, required) {
	//if the data is required, return an error message if it
	//isn't provided, false otherwise	
	if( required === true ) {
		//if data is defined, return false
		if(data) {
			return false;
		}
		//otherwise, return an error message
		else {
			var message = "This field is required";
			
			return message;
		}
	}
	//if the data isn't required, then just return false
	else {
		return false;
	}
}

//a premade validation callback used to check if the minimum
//	length input is provided
function validateMinLength(data, min) {
	//return false only if the data is at or above the minimum input
	//return an error message if it is not
	//throw an exception if min is undefined
	if(min === undefined) {
		throw new TypeError("No minimum value was provided");
	}
	//return an error message if data is null or undefined
	if(data === null || data === undefined) {
		var message = "You need a minimum of "
					+ min + " characters in this field";
		return message;
	}
	//force data to be an int
	min = parseInt(min);
	
	if(data.length >= min) {
			return false;
	}
	//if false, return an error message
	else {
		var message = "You need a minimum of "
					+ min + " characters in this field";

		return message;
	}
}

//a premade validation callback used to check that input
//	doesn't exceed maximum data 
function validateMaxLength(data, max) {
	//return an error message if data's length exceeds the max length		
	//return false if data is at or below maximum, false otherwise
	//throw an exception if max is undefined
	if(max === undefined) {
		throw new TypeError("No maximum value was provided");
	}
	
	//force data to be an int
	max = parseInt(max);
	
	if(data.length <= max) {
		return false;
	}
	//if false, return an error message
	else {
		var message = "You can have a maximum of "
					+ max + " characters in this field";

		return message;
	}
}

//Premade validator that checks if an E-Mail addresss is valid
function validateEmailAddress(email) {
	//return an error message if email is null or undefined
	if(email === null || email === undefined) {
		var message = "Your E-Mail address appears invalid";
		return message;
	}
	
	//force data to be string
	email = email.toString();
	//trim white space from email
	email = email.trim();
	//an regex to find find an email
	var emailRE = /(^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*)@((?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.?)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$)/;
	
	//if the total length is not between 1-254 chars,
	//return an error message
	if(email.length < 0 || email.length > 254) {
		var message = "An E-Mail address must be between 1-254 characters";
		return message;
	}
	var emailStatus = email.match(emailRE);
	if(emailStatus) {
		//if the first part of the address isn't within max bounds
		if(emailStatus[1].length > 64) {
			var message = "The part before the '@' in your E-Mail is too long";
			return message;
		}
		//if the 2nd part of the address isn't within max bounds
		else if (emailStatus[2].length > 189) {
			var message = "The part after the '@' in your E-Mail is too long";
			return message;
		}
		//i
		else if (emailStatus[1].length < 1 || emailStatus[2].length < 1) {
			var message = "Your E-Mail address appears invalid";
			return message;
		}
		else {
			return false;
		}
	}
	else {
		var message = "Your E-Mail address appears invalid";
		return message;
	}
}

//premade validator that checks if data array is in the array of
//	predefined acceptable checkbox values
//	returns false if the value is in the acceptable values
function validateCheckbox(data, checkboxValues) {
	//if the data is in checkboxValues, return false
	
	if(Array.isArray(data)) {
		//this reduce compares whether the current val is in the array
		//and whether the previous values were all true.

		//go through all values in data, and if all values in data are 
		//	in the checkboxValues array, then return false
		//	otherwise, return an error message
		var results = true;
		//no checked values is still a legitimate value,
		//	return false if data is empty
		if(data.length === 0) {
			return false;
		}
		for(i in data) {
			if(checkboxValues.indexOf(data[i]) === -1) {
				results = false;
			}
		}		
		
		//note that only programmer error or deliberate user data
		//manipulation should trigger this failure.
		var message = "Something is wrong with the form, please reload the page";
		
		return (results) ? false : message;
	}
	//note that only programmer error or deliberate user data
	//manipulation should trigger this failure.
	else {
		var message = "Something is wrong with the form, please reload the page";
		return message;
	}
}

//validatePhoneNumber is a validator to check if a legitimate
//phone number is given
function validatePhoneNumber(number) {
	//return an error message if number is null or undefined
	if(number === null || number === undefined) {
		var message = "Your Phone Number appears invalid";
		return message;
	}
	
	//force data to be string
	number = number.toString();
	//trim white space from number
	number = number.trim();
	
	//split number by non-numbers then rejoin it,
	//giving only numbers
	number = number.split(/[^0-9]/).join("");

	//the most basic phone number should be 7 digits
	if(number.length < 7) {
		return "Your Phone Number should be at least 7 digits";
	}
	//and it should not have more than 15 digits
	else if(number.length > 15) {
		return "Your Phone Number shouldn't have more than 15 digits";
	}
	else {
		return false;
	}
}
