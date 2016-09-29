function TextField(argObject) {
	
	//first, the argObject is required to be provided
	//throw an error if it wasn't
	if(!argObject) {
		throw new TypeError(
			"You failed to provide an arguments object"
		);
	}
	
	//check for arg will try to find a value in argObject
	//if it finds it, it returns it
	//if it doesn't, it tries to provide a default argument
	//if none is provided, it throws an error
	function checkForArg(argName, defaultArg) {
		//throw error if no item of that name was found
		//and no default was found
		if(argObject[argName] === undefined) {
			//if a default value was found, give it
			if(defaultArg) {
				return defaultArg;
			}
			throw new TypeError(argName +
				"was not given in the arguments object but is needed"
			);
		}
		//if item of that name was found, return it
		else {
			return argObject[argName];
		}		
	}
	
	//the id is the particular form item this represents
	var id = checkForArg("id");
	
	//a default list of validators to use if none are provided
	this.defaultFilters = [ this.validateRequired,
					 this.validateMinLength,
					 this.validateMaxLength];
	//get a list of validator functions from the argObject
	var validators = checkForArg("validators", this.defaultFilters);
	
	//a premade validation callback used to validate required fields
	this.validateRequired = function(data) {
		//if the data is required, return true only if
		//	there is data
		var required = checkForArg("required");
		
		//return false if the data isn't provided but is required,
		//	but return true otherwise
		if( required === true) {
			//if data is defined, return true
			if(data) {
				return true;
			}
			//otherwise, call the error callback and return false
			else {
				var message = "This is a required field";
				useFieldItem(failureCallback, message);				
				
				return false;
			}
		}
		//if the data isn't required, then just return true
		else {
			return true;
		}
	}
	
	//a premade validation callback used to check if the minimum
	//	length input is provided
	this.validateMinLength = function(data) {
		//return true only if the data is at or above the minimum input
		var minimum = checkForArg("min");
		
		//return true if data is at or above minimum, false otherwise
		if(data.length >= minimum) {
				true;
		}
		//if false, call the failureCallback
		else {
			var message = "You need a minimum of "
						+ min + " characters in this field";
			useFieldItem(failureCallback, message);
			
			return false;
		}		
	}
	
	//a premade validation callback used to check that input
	//	doesn't exceed maximum data 
	this.validateMaxLength = function(data) {
		//return true only if the data is at or above the maximum input
		var maximum = checkForArg("maximum");
		
		
		
		//return true if data is at or below maximum, false otherwise
		if(data.length <= maximum) {
			true;
		}
		//if false, call the failureCallback
		else {
			var message = "You can have a maximum of "
						+ max + " characters in this field";
			useFieldItem(failureCallback, message);
			
			return false;
		}
	}
	
	//allow the dev to select how the form item is grabbed
	function useFieldItem(callback, options) {
		//try to run the callback
		try {
			//if there is some optional part, call callback with it
			if(options) {
				callback.call(id, options);
			}
			else {
				callback.call(id);
			}
		}
		//if not possible, catch the error and log it
		catch(error) {
			console.log("Error running callback: " + error.message);
		}
	}
	
	function getFieldData() {
		//fetch will decide how data is retrieved from the field
		var fetchCallback = checkForArg('fetch');
		//call fetchCallback on id
		try {
			return fetchCallback.bind(id)();
		}
		catch(error) {
			console.log("Error running callback: " + error.message);
		}
	}	
	//validate removes invalid data, and warns the users of bad input
	//returns true if successful, false otherwise
	function validate(data) {
				
		try {
			for(var i in validators) {
				var validateCallback = validators[i];
				
				//call the validateCallback, and if it returns false,
				//	return false
				//otherwise, continue testing with the other validators
				if(!validateCallback(data)) {
					return false;
				}				
			}
						
			//if the data survived that gauntlet, return true
			else {
				return data;
			}
		}
		catch(error) {
			//set a custom error message
			var message = checkForArg('error');
			//print error to log
			console.log(message);
		}
	}
	
	//getData grabs the data from the text field, then validates it
	//if it passes the validator, then it returns the data for further
	this.getData = function() {
		//get the data from the form 
		data = getFieldData();
		//if validate returns true, return data
		return validate(data);
	}
}

/*
function InputEmail() {
	
}
*/