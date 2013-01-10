/*
 * the scripts that are always necessary regardless of whether the
 * user is using the vle, authoring tool, or grading tool
 */
var coreScripts = [
	'vle/node/estimatePractice/EstimatePracticeNode.js',
	'vle/node/estimatePractice/estimatePracticeEvents.js'
];

//the scripts used in the vle
var studentVLEScripts = [
	'vle/node/estimatePractice/estimatePractice.js',
	'vle/node/estimatePractice/estimatePracticeState.js',
	'vle/jquery/js/jquery-1.6.1.min.js',
	'vle/jquery/js/jquery-ui-1.8.7.custom.min.js'
];

//the scripts used in the authoring tool
var authorScripts = [
	'vle/node/estimatePractice/authorview_estimatePractice.js'
];

//the scripts used in the grading tool
var gradingScripts = [
	'vle/node/estimatePractice/estimatePracticeState.js'
];

//dependencies when a file requires another file to be loaded before it
var dependencies = [
	{child:"vle/node/estimatePractice/EstimatePracticeNode.js", parent:["vle/node/Node.js"]}
];

var nodeClasses = [
	{nodeClass:'display', nodeClassText:'EstimatePractice'}
];

scriptloader.addScriptToComponent('core', coreScripts);
scriptloader.addScriptToComponent('core_min', coreScripts);
scriptloader.addScriptToComponent('estimatePractice', studentVLEScripts);
scriptloader.addScriptToComponent('author', authorScripts);
scriptloader.addScriptToComponent('studentwork', gradingScripts);
scriptloader.addScriptToComponent('studentwork_min', gradingScripts);
scriptloader.addDependencies(dependencies);

componentloader.addNodeClasses('EstimatePracticeNode', nodeClasses);

var css = [
       	"vle/node/estimatePractice/estimatePractice.css"
];

scriptloader.addCssToComponent('estimatePractice', css);

var nodeTemplateParams = [
	{
		nodeTemplateFilePath:'node/estimatePractice/estimatePracticeTemplate.ep',
		nodeExtension:'ep'
	}
];

componentloader.addNodeTemplateParams('EstimatePracticeNode', nodeTemplateParams);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/estimatePractice/setup.js');
};