describe("Testing form.js, some js to help work with forms.",
function(){
	describe("Testing the text field form object.", function() {
		//we need an argument object to give Field
		var argsObj;
		//also make a var to hold a default Field object
		var textField;
		
		//simpleInput is an object that will init a Field,
		//	with the default validators
		var simpleInput;
		//reset simpleInput before each call
		beforeEach(function() {
			simpleInput =
			{
				"name" : "harold",
				"id" : 27,
				"fetch" : function() { return 7; },
				"failure" : function() { failureData = "failure"; },
				"success" : function() { successData = "success"; },
			};
		});
		
		describe("Checking how Field constructor handles different arguments", function() {
			it("Throws TypeError if no arguments provided.", function() {
				expect(Field).toThrow();
			});
		});
		
		describe("Check how the prebuilt validators bundled w/ Field work", function(){
			describe("Checking required field validator", function(){
				
				afterEach(function(){
					textField = undefined;
				});
				it("Should pass if not required", function(){
					expect(validateRequired("data", false)).toBeFalsy();
				});
				it("Should pass if required and given data", function(){		
					expect(validateRequired("somedata", true)).toBeFalsy();
				});
				it("Should fail if required and given no data", function(){
					expect(validateRequired(undefined, true)).toBeTruthy();
				});
			});
			describe("Checking the minimum input validator", function(){
				afterEach(function(){
					textField = undefined;
				});
				it("Should fail if input is below the minimum", function(){;
					expect(validateMinLength("f", 5)).toBeTruthy();
				});
				
				it("Should pass if input is above the minimum", function(){			
					expect(validateMinLength("fff", 1)).toBeFalsy();
				});
				
				it("Should pass if input is at the minimum", function(){
					expect(validateMinLength("f", 1)).toBeFalsy();
				});
				
				it("Should throw an error if min isn't provided", function(){
					expect(validateMinLength).toThrowError(TypeError, "No minimum value was provided");
				});				
				
			});
			describe("Checking the maximum input validator", function(){
				
				it("Should fail if input is above the maximum", function(){
					expect(validateMaxLength("fff", 1)).toBeTruthy();
				});
				
				it("Should pass if input is below the maximum", function(){
					expect(validateMaxLength("fff", 5)).toBeFalsy();
				});
				
				it("Should pass if input is at the maximum", function(){		
					expect(validateMaxLength("f", 1)).toBeFalsy();
				});
				
				it("Should throw an error if max isn't in args object", function(){						
					expect(validateMaxLength).toThrowError(TypeError, "No maximum value was provided");
				});
				
			});
			describe("Checking the no html validator", function(){
				it("Should catch regular html tags", function() {
					var output =  validateNoHtml("<script>this could be bad</script>");
					expect(output).toEqual("This form doesn't accept html");
					output =  validateNoHtml('<img src="smiley.gif" alt="Smiley face" height="42" width="42">');
					expect(output).toEqual("This form doesn't accept html");
				});
				it("Should catch html tags, even when escape chars are included", function() {
					var output =  validateNoHtml("<\nscr\nipt>this could be bad</script>");
					expect(output).toEqual("This form doesn't accept html");
				});
				it("Should pass plain text", function() {
					var output =  validateNoHtml("hello friend");
					expect(output).toEqual(false);
				});				
			});
			describe("Check the email validator", function(){
				it("Should return an error if the data isn't an email", function(){
					var badVals = ["asdf", "fdas", "qqqq", -1, null, undefined];
					badVals.forEach(function(val){
						expect(validateEmailAddress(val)).toBeTruthy();
					});
				});
				it("Should accept a valid email, within reason", function(){
					var goodVals = ["asdf@mail.com", "fdsa@email.net", "something@localhost", "very.common@example.com"];
					goodVals.forEach(function(val){
						expect(validateEmailAddress(val)).toBeFalsy();
					});
				});
				it("Shouldn't accept invalid emails",function(){
					var badVals = ["A@b@c@example.com",'just"not"right@example.com', 'this is"not\allowed@example.com','john..doe@example.com'];
					badVals.forEach(function(val){
						expect(validateEmailAddress(val)).toBeTruthy();
					});
				});
				it("Should warn users of size limitations", function(){
					expect(validateEmailAddress("")).toEqual("Your E-Mail address appears invalid");
					expect(validateEmailAddress()).toEqual("Your E-Mail address appears invalid");
					
					var longinput = "ggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg";
					expect(validateEmailAddress(longinput)).toEqual("An E-Mail address must be between 1-254 characters");
					
					var longFront = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@email.com";
					var longBack  = "asdf@aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.com";
					var output = validateEmailAddress(longFront);
					expect(output).toEqual("The part before the '@' in your E-Mail is too long");
					output = validateEmailAddress(longBack);
					expect(output).toEqual("The part after the '@' in your E-Mail is too long");
					
				}); 
			});
			
			describe("Check the checkbox validator.", function(){
				//a var to hold an array of valid input
				var goodInput;
				beforeEach(function() {
					goodInput =
					["spam", "coconuts", 27 ];
				});
				it("Should return an error message if data wasn't given as arrays",
				function(){
					expect(validateCheckbox("not an array", goodInput)).toEqual(
						"Something is wrong with the form, please reload the page"
					);
				});
				it("Shouldn't accept data not in the checkboxValues array.",
				function(){
					var badVals = ["asdf", "fdsa", 22, undefined];
					expect(validateCheckbox(badVals, goodInput)).toEqual(
						"Something is wrong with the form, please reload the page"
					);
				});
				it("Should accept data in the valid checkbox values list.",
				function(){
					expect(validateCheckbox(goodInput, goodInput)).toEqual(false);
				});
			});
		});
		
		describe("Check how Field object handles use.", function(){
			afterEach(function() {
				//after each run, empty textField
				textField = undefined;
			});
			
			//for regular use, you need at least these properties set in
			//args obj:
			//	id: some sort of identification for the field
			//	fetch: function, rules for getting the data from this field element
			//	failure: function, rules to decide how to deal with invalid data
			//	success: function, rules to decide how to deal with valid data
			//these are not required, but without custom validators, these will be 
			//needed to run the default validators:
			//	min: int, minimum text input
			//	max: int, maximum text input
			//	required: boolean, if true, this field is required for input
			
			var anId = 7;
			
						
			it("When given a rigged positive validator, it should give some JSON data.",
				function(){
					var simpleInput =
					{
						"name" : "harold",
						"id" : anId,
						"fetch" : function() { return 7; },
						"failure" : function() { failureData = "failure"; },
						"success" : function() { successData = "success"; },
						"validators" : [],
						"required" : false
					};
					simpleInput["validators"] = [{
						"validator" : function(){ return false; },
						"options" : undefined
					},
					{
						"validator" : function(){ return false; },
					}];
					
					textField = new Field(simpleInput);
					
					var data = textField.getData();
					var name = data["name"];
					var value = data["value"];
					expect(name).toEqual("harold");
					expect(value).toEqual(7);
			});
						
			it("Should throw errors when not given enough data for its validators",
			function(){
				simpleInput["required"] = false;
				
				textField = new Field(simpleInput);
				expect(textField.init).toThrow();
			});
			
			it("Should return false if given data which doesn't pass the validators given",
			function() {
				simpleInput["min"] = 0;
				simpleInput["max"] = 10;
				simpleInput["required"] = true;
				simpleInput["fetch"] = function() {
					return "aaaaaaaaaaaaaaaaaaaaatooomuchdata";
				};
				
				textField = new Field(simpleInput);
				var output = textField.getData();
				
				expect(output).toBe(false);
			});
			
			it("Should return the data as a JSON object if it passes through real validators",
			function() {
				simpleInput["min"] = 0;
				simpleInput["max"] = 1000;
				simpleInput["required"] = true;
				simpleInput["fetch"] = function() {
					return "aaaaaaaaaaaaaaaaaaaaatooomuchdata";
				};
				
				textField = new Field(simpleInput);
				
				var data = textField.getData();
				var name = data["name"];
				var value = data["value"];
				expect(data).toBeTruthy();
				expect(name).toEqual("harold");
				expect(value).toEqual("aaaaaaaaaaaaaaaaaaaaatooomuchdata");
			});
			
			it("Should call the failure callback when it gets invalid data",
			function(){
				
				simpleInput["required"] = false;
				simpleInput["min"] = 0;
				simpleInput["max"] = 0;
				
				textField = new Field(simpleInput);
				textField.getData();
				
				expect(failureData).toEqual("failure");
			}); 
			
			it("Should call the success callback when it gets valid data",
			function(){
				
				simpleInput["validators"] =
					[{ "validator" : function(){ return false; }}];
				textField = new Field(simpleInput);
				textField.getData();
				
				expect(successData).toEqual("success");
			}); 
			
			it("Should not share data between two field objects",
			function(){
				simpleInput["success"] = function(data, options) {
					return this;
				}
				simpleInput["min"] = 0;
				simpleInput["max"] = 100;
				simpleInput["required"] = false;
				
				textField = new Field(simpleInput);
				textField.init();
				
				simpleInput["name"] = "reginald";
				
				var otherField = new Field(simpleInput);
				otherField.init();				
				
				expect(textField.name).not.toEqual(otherField.name);
			}); 
						
		});
	});
	describe("Testing E-Mail field object.", function(){
		//also make a var to hold a default Field object
		var emailField;
		
		//simpleInput is an object that will init a Field,
		//	with the default validators
		var simpleInput;
		//reset simpleInput before each call
		beforeEach(function() {
			simpleInput =
			{
				"name" : "harold",
				"id" : "anID",
				"fetch" :  function(){ return "asdf@mail.com" },
				"failure" : function() { failureData = "failure"; },
				"success" : function() { successData = "success"; },
				"required": true
			};
		});
		afterEach(function(){
			emailField = undefined;
		});
		
		//by default, EmailField doesn't accept html,
		//requires a valid email, and may be required
		
		describe("Should fail if given an invalid email.", function() {
			beforeEach(function(){
				simpleInput["fetch"] = function() {return "asdf"; };
			});
			it("Should return false on failure", function(){
				simpleInput["failure"] = function() { /*do nothing*/ };
				
				emailField = new EmailField(simpleInput);
				expect(emailField.getData()).toEqual(false);
			});
			it("Should call the failure callback.", function(){
				emailField = new EmailField(simpleInput);
				emailField.getData();
				
				expect(failureData).toEqual("failure");
			});
		});
		describe("Should succeed when given good data.", function(){
			it("Should return an object w/ an email when given a valid E-Mail",
			function() {			
				emailField = new EmailField(simpleInput);
				var output = emailField.getData();
				
				expect(output["value"]).toEqual("asdf@mail.com");
			});
			it("Should call the success callback when given good data.",
			function(){
				emailField = new EmailField(simpleInput);
				emailField.getData();
				
				expect(successData).toEqual("success");
			});
		});
	});
	describe("Testing CheckboxField object.", function(){
		var checkboxField;
		var simpleInput;
		
		//set CheckboxField's default list of validators
		//by default, CheckboxField doesn't accept html,
		//accepts only a predefined list of input,
		//and may be required
		beforeEach(function(){
			simpleInput = {
				"checkboxValues" : ["asdf", "fdsa", "gggg"],
				"name" : "harold",
				"id" : "anID",
				"fetch" :  function(){ return ["asdf", "fdsa"] },
				"failure" : function() { failureData = "failure"; },
				"success" : function() { successData = "success"; },
				"required" : false
			}
		});
		
		it("Should return it the data it fetches if that data is in checkboxValues",
		function(){
			checkboxField = new CheckboxField(simpleInput);
			var output = checkboxField.getData();
			
			expect(output.value).toEqual(["asdf", "fdsa"]);
		});
		describe("It should pick up on bad input.", function(){
			var badData;
			beforeEach(function(){
				failureData = undefined;
				badData = [['qqqqqqq', 'nope'], ["asdf", "fdsa", "z"], [null], [-1], [undefined]];
			});
			it("Should return false if given bad input", function(){
				badData.forEach(function(val){
					simpleInput["fetch"] = function() {
						return val;
					}
					checkboxField = new CheckboxField(simpleInput);
					expect(checkboxField.getData()).toBe(false);
				});
			});
			it("Should call the failure callback", function(){
				badData.forEach(function(val){
					simpleInput["fetch"] = function() {
						return val;
					}
					checkboxField = new CheckboxField(simpleInput);
					checkboxField.getData();
					expect(failureData).toBe("failure");
					failureData = undefined;
				});
			});
		});
		describe("Testing the FieldHandler Object.", function(){
			var fieldHandler;
			var simpleInput;
			
			beforeEach(function(){
				fieldHandler = undefined;
				simpleInput =
				{
					"id" : "anID",
					"name": "harold",
					"fetch": function() { return "asdf"; },
					"success" : function() { successData = "success"; },
					"failure" : function() { failureData = "failure"; },
					"required": false,
					"min" : 0,
					"max" : 100
				}
				successData = undefined;
				failureData = undefined;
			});
			
			describe("Testing the addField function.", function(){
				it("Trying to add a text field", function(){
					fieldHandler = new FieldHandler();
					fieldHandler.addField("text", simpleInput);
					expect(toString(fieldHandler.fields[0].constructor)).toEqual(toString(Field.constructor));
				});
				it("Trying to add an email field", function(){
					simpleInput.fetch = function() {
						return "asdf@mail.com";
					}
					
					fieldHandler = new FieldHandler();
					fieldHandler.addField("email", simpleInput);
					expect(toString(fieldHandler.fields[0].constructor)).toEqual(toString(EmailField.constructor));
				});
				it("Trying to add a text field", function(){
					simpleInput.fetch = function() {
						return ["asdf"];
					}
					simpleInput.checkboxValues = 
					["fdsa", "asdf"];
					
					fieldHandler = new FieldHandler();
					fieldHandler.addField("checkbox", simpleInput);
					expect(toString(fieldHandler.fields[0].constructor)).toEqual(toString(CheckboxField.constructor));
				});
			});
			describe("Testing the makeFields function", function(){
				it("Should set up each new value in the given array",
				function() {
					var emailInput = checkboxInput = simpleInput;
					emailInput.fetch = function() {
						return "asdf@mail.com";
					};
					checkboxInput.checkboxValues = 
						["fdsa", "asdf"];
					
					fieldHandler = new FieldHandler();
					var fields = [
						["text", simpleInput],
						["email", emailInput],
						["checkbox", checkboxInput]
					];
					
					spyOn(fieldHandler, "addField").and.callThrough();
					fieldHandler.makeFields(fields);
					
					expect(toString(fieldHandler.fields[0].constructor)).toEqual(toString(Field.constructor));
					expect(toString(fieldHandler.fields[1].constructor)).toEqual(toString(EmailField.constructor));
					expect(toString(fieldHandler.fields[2].constructor)).toEqual(toString(CheckboxField.constructor));
					expect(fieldHandler.addField).toHaveBeenCalled();
				});				
			});
			describe("Testing validateFields function", function(){
				it("Should return true only if all values are true",
				function(){
					fieldHandler = new FieldHandler();
					
					fieldHandler.makeFields([
						["text", simpleInput],
						["text", simpleInput]
					]);
					
					expect(fieldHandler.validateFields()).toBe(true);
				});
				
				it("Should return false if any values are false",
				function(){
					fieldHandler = new FieldHandler();
					var badInput = simpleInput;
									
					fieldHandler.makeFields([
						["text", simpleInput],
						["text", simpleInput]
					]);
					
					spyOn(fieldHandler.fields[0], "validate").and.returnValue(false);
					
					expect(fieldHandler.validateFields()).toBe(false);
				});
				
				describe("It should call the respective callbacks for the fields",
				function(){
					beforeEach(function(){
						fieldHandler = new FieldHandler();
					})
					it("Should call the success callback", function(){						
						fieldHandler.makeFields([
							["text", simpleInput],
						]);
						
						fieldHandler.validateFields();
						
						expect(successData).toEqual("success");
					});
					it("Should call the failure callback", function(){
						simpleInput.fetch = function() {
							return;
						}
						simpleInput.failure = function() { 
							failureData = "failure";
						}
						fieldHandler.makeFields([
							["text", simpleInput],
						]);
						
						fieldHandler.validateFields();
						
						expect(failureData).toEqual("failure");
					});
				});
			});
			describe("Testing getData function", function(){
				beforeEach(function(){
					fieldHandler = new FieldHandler();
					
					fieldHandler.makeFields([
						["text", simpleInput],
						["text", simpleInput]
					]);
				});
				
				it("Should return false when any field is invalid", function(){
					spyOn(fieldHandler.fields[0], "validate").and.returnValue(false);
					
					expect(fieldHandler.getData()).toEqual(false);
				});
				
				it("Should return a JSON string if data is valid", function(){
					var output = fieldHandler.getData();
					
					expect(typeof output).toEqual("object");
					expect(output.harold).toEqual("asdf");
				});
			});
		});
	});
});