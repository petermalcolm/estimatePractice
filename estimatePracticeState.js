/**
 * This is the constructor for the state object that will be used to represent the
 * student work. An instance of this object will be created each time the student
 * submits an answer.
 * 
 * note: you can change the variables in this constructor, the response variable
 * is just used as an example. you can add any variables that will help you 
 * represent the student's work for your step type.
 */
function EstimatePracticeState(problemName,
                               estimateArray,
                               doReflect,
                               wordsResponse, 
                               symbolsResponse, 
                               doAdjust, 
                               adjustmentResponse, 
                               estimateResponse) {
        // take problem name -- assigned from project JSON so there is no doubt it exists:
        this.problemName = problemName;

        // the estimates that the user has made so far
        this.estimateArray = [];
        
        // the boolean for whether the reflection screen shows up
        this.doReflect = false;

	//the WORDS response the student wrote
	this.wordsResponse = "";

	//the SYMBOLS response the student wrote
	this.symbolsResponse = "";
        
        // the DO-ADJUST boolean: checked or unchecked:
        this.doAdjust = false;
        
        // the ADJUSTMENT response the student wrote
        this.adjustmentResponse = "";

	//the ESTIMATE response the student wrote
	this.estimateResponse = "";

        //set the member variables (remember, don't need problemName)
        if(estimateArray != null) {
            this.estimateArray = estimateArray;
        }
        if(doReflect) { this.doReflect = true; }
	if(wordsResponse != null) { this.wordsResponse = wordsResponse;	}
	if(symbolsResponse != null) { this.symbolsResponse = symbolsResponse; }
        if(doAdjust) { this.doAdjust = true; }
        if(adjustmentResponse != null) { this.adjustmentResponse = adjustmentResponse; }
	if(estimateResponse != null) { this.estimateResponse = estimateResponse; }
};

/**
 * This function is used to reload previous work the student submitted for the step.
 * The student work is retrieved and then this function is called to parse the student
 * work so that we can display the previous answer the student submitted.
 * 
 * note: you can change the variables in the stateJSONObj, the response 
 * variable is just used as an example. you can add any variables that will  
 * help you represent the student's work for your type of step.
 * 
 * @param stateJSONObj a JSONObject representing the student work
 * @return a EstimatePracticeState object
 */
EstimatePracticeState.prototype.parseDataJSONObj = function(stateJSONObj) {
	//obtain the student work from the JSONObject
	var response = stateJSONObj.response;
	
	//create a state object with the student work
	var estimatePracticeState = new EstimatePracticeState(response);
	
	//return the state object
	return estimatePracticeState;
};

/**
 * Get the student work for display purposes such as in the grading tool.
 * 
 * @return the student work
 */
EstimatePracticeState.prototype.getStudentWork = function() {
	var studentWork = this;
	
	return studentWork;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/estimatePractice/estimatePracticeState.js');
}