
/*
 * This handles events and calls the appropriate function to handle
 * the event.
 */
View.prototype.estimatePracticeDispatcher = function(type,args,obj){
	/*
	 * check to see if the event name matches 
	 */ 
	if(type == 'estimatePracticeUpdatePrompt') {
		/*
		 * the event name matches so we will call the function that
		 * handles that event
		 */
		obj.EstimatePracticeNode.updatePrompt();
	}
};

/*
 * this is a list of events that can be fired. when the event is fired,
 * the dispatcher function above will be called and then call the
 * appropriate function to handle the event.
 */
var events = [
	'estimatePracticeUpdatePrompt'
];

/*
 * add all the events to the vle so the vle will listen for these events
 * and call the dispatcher function when the event is fired
 */
for(var x=0; x<events.length; x++) {
	componentloader.addEvent(events[x], 'estimatePracticeDispatcher');
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/estimatePractice/estimatePracticeEvents.js');
};