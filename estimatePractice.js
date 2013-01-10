/**
 * This is the constructor for the object that will perform the logic for
 * the step when the students work on it. An instance of this object will
 * be created in the .html for this step (look at estimatePractice.html)
 */
function EstimatePractice(node) {
	this.node = node;
	this.view = node.view;
	this.content = node.getContent().getContentJSON();
	
        this.numEstimates = 0;                                                  // keeps track of the number of user estimates
        this.estimateArray = [];                                                // stores the actual estimates
        this.doReflect = false;                                                 // after three strikes, doReflect becomes true
        
        this.negRect=new Image();                                               // error-bar gradient rectangle points <-- left
        this.posRect=new Image();                                               // error-bar gradient rectangle points --> right
        this.negRect.src = "imgs/blue_orange.jpg";
        this.posRect.src = "imgs/orange_blue.jpg";
        
	if(node.studentWork != null) {
		this.states = node.studentWork; 
	} else {
		this.states = [];  
	};
};

/**
 * This function renders everything the student sees when they visit the step.
 * This includes setting up the html ui elements as well as reloading any
 * previous work the student has submitted when they previously worked on this
 * step, if any.
 */
EstimatePractice.prototype.render = function() {
        var that = this;  // alias the estimatePractice object for reference in callbacks

        // build the error-bar display:
        var canvasContext=$('#estimateCanvasId')[0].getContext('2d');           // context for drawing tolerance box, etc
        canvasContext.strokeStyle = '#f00';                                     // red box around +/-15% 
        canvasContext.lineWidth = 4;
        canvasContext.strokeRect(113,8,36,24);

        canvasContext.strokeStyle = '#000';                                     // black line at exact answer
        canvasContext.lineWidth = 3;
        canvasContext.moveTo(131,3);
        canvasContext.lineTo(131,38);
        canvasContext.stroke();
        

	//display any prompts to the student
	$('#promptDiv').html(this.content.prompt);
	
	//load any previous responses the student submitted for this step
	var latestState = this.getLatestState();
	
        // if there are previous responses, render those:
	if(latestState != null) {
            this.recoverPreviousState(latestState);
	}
        
        /*
         * respond to user's clicks on the numberpad.  This maps
         * to the corresponding numbers and chains off to the appendSymbolFromNumberpad() method
         */
        $('#numberpad').click(function (e) {
            var offset = $(this).offset();
            var xCoord = (e.clientX - offset.left);
            var yCoord = (e.clientY - offset.top);
            that.appendSymbolFromNumberpad(that.getSymbolFromNumberpadCoords(xCoord, yCoord));
            //alert("width: " + ($(this).width()) + "height: " + ($(this).height()) + "\nx: " + (e.clientX - offset.left) + "  y: " + (e.clientY - offset.top));
        });

        /*
         * respond to user's keystrokes in the symbols text area.  This maps
         * to the corresponding numbers and chains off to the respondToSymbolPress() method
         */

        $("#symbolsTextArea").bind('keyup',function(e){ // Listen for a key pressed via text input
            that.respondToSymbolKeyPress($("#symbolsTextArea").val(),e);
        });
        
        /**
         * respond to the user clicking the adjustment checkbox
         */
        $('#adjustmentCheckbox').bind('change',function(e){
            that.toggleAdjustmentBox();
        });
};

/**
 * recovers the saved state from previous visit
 */
EstimatePractice.prototype.recoverPreviousState = function(latestState) {
        /*
         * get the response from the latest state. the response variable is
         * just provided as an example. you may use whatever variables you
         * would like from the state object (look at compuEstimateAssessmentState.js)
         */
        this.doReflect = latestState.doReflect;                         // determine whether the reflection pop-up is showing
        this.estimateArray = latestState.estimateArray.slice(0);        // *clone* rather than just moving the pointer
        this.numEstimates = latestState.estimateArray.length;           // how many estimates so far
        var latestWordsResponse = latestState.wordsResponse;            // text: WORDS
        var latestSymbolsResponse = latestState.symbolsResponse;        // text: SYMBOLS
        var latestDoAdjust = latestState.doAdjust;                      // boolean: ADJUST?
        var latestAdjustmentResponse = latestState.adjustmentResponse;  // text: ADJUSTMENT
        var latestEstimateResponse = latestState.estimateResponse;      // text: ESTIMATE

        //set the previous student work into the text areas
        $('#wordsTextArea').val(latestWordsResponse); 
        $('#symbolsTextArea').val(latestSymbolsResponse); 
        $('#adjustmentTextArea').val(latestAdjustmentResponse);
        $('#estimateTextArea').val(latestEstimateResponse);

    // show or hide the reflection div based on this.doReflect
    if(this.doReflect) {
        $('#stopReflectDiv').css('display','block');
    }

    // show the error bar for the last estimate made
    // ... but only if the estimate text box is not empty
    if($('#estimateTextArea').val() != '') {            
        var error = this.calculateError();                              // find the relative error
        this.displayErrorFeedback(error);
    }

    // set the checkmark and visibility of the adjustment response area accordingly:
    if(latestDoAdjust) {
        $("form input:checkbox").prop('checked',true);
        $('#adjustmentDescriptionDiv').css('display','block');
    }    
}

/**
 * This function retrieves the latest student work
 *
 * @return the latest state object or null if the student has never submitted
 * work for this step
 */
EstimatePractice.prototype.getLatestState = function() {
	var latestState = null;
	
	//check if the states array has any elements
	if(this.states != null && this.states.length > 0) {
		//get the last state
		latestState = this.states[this.states.length - 1];
	}
	
	return latestState;
};

/** checkEstimate()
 * Fired when a user clicks the "Check Estimate" button
 * This function records the estimate, checks for third strike (3rd bad attempt)
 * Then it calls display errorBar()
 */
EstimatePractice.prototype.checkEstimate = function() {
    if($('#estimateTextArea').val() == '') { return; }                          // skip it if the box is empty
    var error = this.calculateError();
    this.recordEstimate(error);                                                 // method call to add to state for saving
    this.checkForThirdStrike(error);                                            // third unreasonable estimate?
    this.displayErrorFeedback(error);
}

EstimatePractice.prototype.calculateError = function() {
    if($('#estimateTextArea').val() == '') { return -1.0; }                     // -100% if the box is empty
    var estimateAttempt = parseFloat($('#estimateTextArea').val());             // estimateAttempt: what was typed in
    var correctAnswer = this.content.answer;                                    // correct answer from JSON config file (.ep)
    var error = (estimateAttempt - correctAnswer)/correctAnswer;                // (E-S)/S
    return error;
}

EstimatePractice.prototype.displayErrorFeedback = function(error) {
    var canvasHandle = $('#estimateCanvasId');                                  // grab the canvas
    var contextHandle = canvasHandle[0].getContext('2d');                       // get its context
    var s = (1 == this.numEstimates)? '' : 's' ;                                // pluralize number of estimates?

    if(error == 0) {                                                            // code to say they got it
        $('#estimateFeedbackText').html('Yes.  The exact value is ' + this.content.answer);
        contextHandle.fillStyle = "rgb(255,255,255)";                           // white-over some
        contextHandle.fillRect(132,10,125,20);                                  // entire positive region hidden
        contextHandle.fillRect(5,10,125,20);                                    // entire negative region hidden
    }else if(error > -0.15 && error < 0.15) {                                   // code to output the actual value if they're close:
        $('#estimateFeedbackText').html('Close enough!  The exact value is ' + this.content.answer);
    } else {
        $('#estimateFeedbackText').html('Make a different estimate.&nbsp; You have made '+this.numEstimates+' estimate'+s+' so far.');
    }
                                                                                // code to show the bar:
    if(error < -1.0) { error = -1.0; }                                          // sanity check bound to +/-100%
    if(error > 1.0) { error = 1.0; }                                            // sanity check bound to +/-100%
    
    if(error < 0.0) {                                                           // negative error
        contextHandle.drawImage(this.negRect,5,10,125,20);
        contextHandle.fillStyle = "rgb(255,255,255)";                           // white-over some
        contextHandle.fillRect(132,10,125,20);                                  // entire positive region hidden
        contextHandle.fillRect(5, 10, (1.0+error)*125.0, 20);
    } else if (error > 0.0) {                                                   // positive error
        contextHandle.drawImage(this.posRect,132,10,125,20);
        contextHandle.fillStyle = "rgb(255,255,255)";                           // white-over some
        contextHandle.fillRect(5,10,125,20);                                    // entire negative region hidden
        contextHandle.fillRect(132+error*125.0, 10, (1.0-error)*125.0, 20);
    }
    contextHandle.strokeStyle = '#f00';                                         // redraw red box around +/-15% 
    contextHandle.lineWidth = 4;
    contextHandle.strokeRect(113,8,36,24);

    contextHandle.strokeStyle = '#000';                                         // redraw black line at exact answer
    contextHandle.lineWidth = 3;
    contextHandle.moveTo(131,3);
    contextHandle.lineTo(131,38);
    contextHandle.stroke();
    
}

/** recordEstimate()
 * updates the member variable that counts estimates.
 * then writes the latest estimate to the end of an array for the database
 */
EstimatePractice.prototype.recordEstimate = function(error) {
    this.numEstimates++;
    
    // append to estimateArray for saving in database
    this.estimateArray.push($('#estimateTextArea').val());
}

/** checkForThirdStrike()
 * stops the user and requires some reflective responding if
 *    it's the third estimate (or more -- not sure why a student would keep guessing...)
 *    and
 *    it's unreasonable
 */
EstimatePractice.prototype.checkForThirdStrike = function(error) {
    if(this.numEstimates >= 3 && Math.abs(error) > 0.15) {                      // third+ try, unreasonable estimate
        // show the divs
        $('#stopReflectDiv').css('display','block');
        // set global doReflect boolean to true
        this.doReflect = true;
    } else {
        return;
    }
}

EstimatePractice.prototype.appendSymbolFromNumberpad = function(newSymbol) {
    
    var textArea = $('#symbolsTextArea');
    if('d' == newSymbol){                   // division
        textArea.val(function(i, val) {
            return val + "\u00f7";
        });
    } else if('t' == newSymbol){            // times
        textArea.val(function(i, val) {
            return val + "\u00d7";
        });
    } else if('a' == newSymbol){            // almost equals
        textArea.val(function(i, val) {     
            if(textArea.val().length == 0) {    // no newline if it's blank
                return "\u2248";
            } else {                            // yes newline if there's stuff there already
                return val + "\n\u2248";
            }
        });
    } else if('=' == newSymbol){            // equals
        textArea.val(function(i, val) {     
            if(textArea.val().length == 0) {    // no newline if it's blank
                return "=";
            } else {                            // yes newline if there's stuff there already
                return val + "\n=";
            }
        });
    } else if ('b' == newSymbol) {          // backspace
        if(textArea.val().length == 0) {    // skip it if it's blank
            return;
        }        
        textArea.val(textArea.val().substring(0,textArea.val().length - 1));
    } else if ('c' == newSymbol) {          // clear
        textArea.val("");
    } else {
        textArea.val(textArea.val() + newSymbol);
    }
    
    // check to see if the expression makes sense so far
    this.showValidationNote();
}

EstimatePractice.prototype.getSymbolFromNumberpadCoords = function(xCoord, yCoord) {
    var WIDTH = 191;
    var HEIGHT = 197;
    var symbolSet = ['7','8','9','d',
                     '4','5','6','t',
                     '1','2','3','-',
                     '0','.','p','+',
                     'a','=','b','c'];
    var xIndex = Math.abs(((xCoord / WIDTH) * 4 - 0.5).toFixed(0));                         // integer division on X
    var yIndex = Math.abs(((yCoord / HEIGHT) * 5 - 0.5).toFixed(0));                        // integer division on Y
    var index = (xIndex + yIndex * 4);
    // alert("clicked xIndex: " + xIndex + "  yIndex: " + yIndex + "\n index: " + index);
    // alert("clicked: " + symbolSet[index] + "  xCoord: " + xCoord);

    newSymbol = symbolSet[index];
    
    // special case for parentheses:
    if('p' == newSymbol) {
        if(xCoord < 117){
            newSymbol = '(';
        } else {
            newSymbol = ')';
        }
    }

    return newSymbol;
}

EstimatePractice.prototype.isMathParsable = function(inputString) {
        // replace all instances of the division sign with /
        inputString = inputString.replace("\u00f7","/");
        
        // replace all instances of the times sign with *
        inputString = inputString.replace("\u00d7","*");
    
        // separate the inputString into separate subExpressions:
        var subExpressions = inputString.split(/[=\u2248]/);
        
        // boolean to see if all of them are ok so far
        var okSoFar = true;
        
        // loop thru each, check for syntax errors
        subExpressions.forEach(function(thisExpression){
            try {
                eval(thisExpression); 
            } catch (e) {
                if (e instanceof SyntaxError) {
                    okSoFar = false;
                }
            }
        });
    return okSoFar;
}

EstimatePractice.prototype.respondToSymbolKeyPress = function(newContent,event) {
    // skip this if backspace was pressed
    if(8 == event.keyCode) return;
    
    // skip this if there is no data (e.g., deleted all characters)
    if(newContent.length == 0) return;
    
    // extract the last character:
    var lastChar = newContent.charAt(newContent.length-1);

    if( '=' == lastChar){ // insert a newline before an equals sign for clarity
        var whatToAdd = (newContent.length == 1)?'=':'\n='
        $('#symbolsTextArea').val(newContent.substring(0,newContent.length-1) + whatToAdd);
    }
    
    // regular expression of all acceptable characters
    var acceptableRegex = /[\d\.\(\)\+\-\*\/=\s]/;  // digits, dots, parens, plus, minus, asterisk, fwd-slash, equals, whitespace

    if(acceptableRegex.test(lastChar)) {
        // if this is acceptable, check to see if the entire text is a parsable expression yet
        this.showValidationNote();
    
        // $('#symbolResponseParagraph').html(lastChar + ': ok');
    } else {
        // eliminate the character
        $('#symbolsTextArea').val(newContent.substring(0,newContent.length-1));
        
        // $('#symbolResponseParagraph').html(lastChar + ': not ok');
    }
}

/**
 * Shows the user whether what they are doing valid so far
 */

EstimatePractice.prototype.showValidationNote = function() {
    if(this.isMathParsable($('#symbolsTextArea').val())) {
        $('#symbolResponseParagraph').css('color', 'darkslategray');
        $('#symbolResponseParagraph').html('OK');
    } else {
        $('#symbolResponseParagraph').css('color', 'red');
        $('#symbolResponseParagraph').html('incomplete answer');
    }
}

/**
 * toggle the box to let students make a final adjustment to their estimates
 */

EstimatePractice.prototype.toggleAdjustmentBox = function() {
    if(false == $("form input:checkbox").prop('checked')) {
        $('#adjustmentDescriptionDiv').css('display','none');
    } else {
        $('#adjustmentDescriptionDiv').css('display','block');
    }
}

/**
 * This function retrieves the student work from the html ui, creates a state
 * object to represent the student work, and then saves the student work.
 * 
 * note: you do not have to use 'studentResponseTextArea', they are just 
 * provided as examples. you may create your own html ui elements in
 * the .html file for this step (look at estimatePractice.html).
 */
EstimatePractice.prototype.save = function() {
	//get the answers the student wrote
	// var response = $('#studentResponseTextArea').val();
        var problemName = this.content.problemName;                             // for book-keeping. makes analysis easier
	var wordsResponse = $('#wordsTextArea').val();                          // the WORDS response the student wrote
	var symbolsResponse = $('#symbolsTextArea').val();                      // the SYMBOLS response the student wrote
        var doAdjust = $("form input:checkbox").prop('checked');                // current T/F status of the adjustment checkbox
        var adjustmentResponse = $('#adjustmentTextArea').val();                // the ADJUSTMENT response
	var estimateResponse = $('#estimateTextArea').val();                    // the ESTIMATE response
	
	/*
	 * create the student state that will store the new work the student
	 * just submitted
	 */
	var estimatePracticeState = new EstimatePracticeState(problemName,
                                                              this.estimateArray,
                                                              this.doReflect,
                                                              wordsResponse, 
                                                              symbolsResponse, 
                                                              doAdjust,
                                                              adjustmentResponse,
                                                              estimateResponse);
	
	/*
	 * fire the event to push this state to the global view.states object.
	 * the student work is saved to the server once they move on to the
	 * next step.
	 */
	eventManager.fire('pushStudentWork', estimatePracticeState);

	//push the state object into this or object's own copy of states
	this.states.push(estimatePracticeState);
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/estimatePractice/estimatePractice.js');
}