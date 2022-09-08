

//<![CDATA[

<!--


//MDH_SCORM modification to support SCORM 1.2 functionality on LMS
/* JavaScript to find the SCORM API if it is available */
/* Based on a model at <http://www.claroline.net/doc/en/index.php/How_do_I_create_SCORM_content%3F> */

var API = null; /* SCORM API */

/* look up through the frameset hierarchy for the SCORM API */
function findAPI(win)
{
	while ((win.API == null) && (win.parent != null) && (win.parent != win))
	{
		win = win.parent;
	}
	API = win.API;
}

/* initialize the SCORM API */
function initAPI(win)
{
	/* look for the SCORM API up in the frameset */
	findAPI(win);

	/* if we still have not found the API, look at the opener and its frameset */
	if ((API == null) && (win.opener != null))
	{
		findAPI(win.opener);
	}
}

var ScormSubmitted = false; //use this to check whether LMSFinish has been called later.

function ScormStartUp(){
	initAPI(window);
	if (API != null){
		API.LMSInitialize(''); 
		API.LMSSetValue('cmi.core.lesson_status', 'browsed');
		API.LMSSetValue('cmi.core.score.min', 0);
		API.LMSSetValue('cmi.core.score.max', 100);
		API.LMSCommit('');
	}
}

function CheckLMSFinish(){
	if (API != null){
		if (ScormSubmitted == false){
			API.LMSCommit('');
			API.LMSFinish('');
			ScormSubmitted = true;
		}
	}
}

function SetScormIncomplete(){
	if (ScormSubmitted == true){
		return;
	}
	SetScormScore();
	if (API != null){
		API.LMSSetValue('cmi.core.lesson_status', 'incomplete');
		API.LMSSetValue('cmi.core.session_time', MillisecondsToTime((new Date()).getTime() - ScormStartTime));
		API.LMSCommit('');
	}
}

function SetScormComplete(){
	if (API != null){
		API.LMSSetValue('cmi.core.session_time', MillisecondsToTime((new Date()).getTime() - ScormStartTime));
		API.LMSSetValue('cmi.core.lesson_status', 'completed');
		SetScormScore();
		API.LMSCommit('');
		API.LMSFinish('');
		ScormSubmitted = true;
	}
}

var ScormStartTime = (new Date()).getTime();

var SuspendData = '';

function SetScormTimedOut(){
	if (API != null){
		if (ScormSubmitted == false){
			SetScormScore();
			API.LMSSetValue('cmi.core.exit', 'time-out'); 
			API.LMSCommit('');
			CheckLMSFinish();
		}
	}
}

//TIME RENDERING FUNCTION
function MillisecondsToTime(Seconds){
	Seconds = Math.round(Seconds/1000);
	var S = Seconds % 60;
	Seconds -= S;
	if (S < 10){S = '0' + S;}
	var M = (Seconds / 60) % 60;
	if (M < 10){M = '0' + M;}
	var H = Math.floor(Seconds / 3600);
	if (H < 10){H = '0' + H;}
	return H + ':' + M + ':' + S;
}




//CODE FOR HANDLING NAV BUTTONS AND FUNCTION BUTTONS

function FocusAButton(){
	if (document.getElementById('CheckButton1') != null){
		document.getElementById('CheckButton1').focus();
	}
	else{
		if (document.getElementById('CheckButton2') != null){
			document.getElementById('CheckButton2').focus();
		}
		else{
			document.getElementsByTagName('button')[0].focus();
		}
	}
}




//CODE FOR HANDLING DISPLAY OF POPUP FEEDBACK BOX

var topZ = 1000;

function ShowMessage(Feedback){
	var Output = Feedback + '<br /><br />';
	document.getElementById('FeedbackContent').innerHTML = Output;
	var FDiv = document.getElementById('FeedbackDiv');
	topZ++;
	FDiv.style.zIndex = topZ;
	FDiv.style.top = TopSettingWithScrollOffset(30) + 'px';

	FDiv.style.display = 'block';

	ShowElements(false, 'input');
	ShowElements(false, 'select');
	ShowElements(false, 'object');
	ShowElements(true, 'object', 'FeedbackContent');

//Focus the OK button
	setTimeout("document.getElementById('FeedbackOKButton').focus()", 50);
	
//
}

function ShowElements(Show, TagName, ContainerToReverse){
// added third argument to allow objects in the feedback box to appear
//IE bug -- hide all the form elements that will show through the popup
//FF on Mac bug : doesn't redisplay objects whose visibility is set to visible
//unless the object's display property is changed

	//get container object (by Id passed in, or use document otherwise)
	TopNode = document.getElementById(ContainerToReverse);
	var Els;
	if (TopNode != null) {
		Els = TopNode.getElementsByTagName(TagName);
	} else {
		Els = document.getElementsByTagName(TagName);
	}

	for (var i=0; i<Els.length; i++){
		if (TagName == "object") {
			//manipulate object elements in all browsers
			if (Show == true){
				Els[i].style.visibility = 'visible';
			}
			else{
				Els[i].style.visibility = 'hidden';
			}
		} 
	}
}



function HideFeedback(){
	document.getElementById('FeedbackDiv').style.display = 'none';
	ShowElements(true, 'input');
	ShowElements(true, 'select');
	ShowElements(true, 'object');
}


//GENERAL UTILITY FUNCTIONS AND VARIABLES

//PAGE DIMENSION FUNCTIONS
function PageDim(){
//Get the page width and height
	this.W = 600;
	this.H = 400;
	this.W = document.getElementsByTagName('body')[0].offsetWidth;
	this.H = document.getElementsByTagName('body')[0].offsetHeight;
}

var pg = null;

function GetPageXY(El) {
	var XY = {x: 0, y: 0};
	while(El){
		XY.x += El.offsetLeft;
		XY.y += El.offsetTop;
		El = El.offsetParent;
	}
	return XY;
}

function GetScrollTop(){
	if (typeof(window.pageYOffset) == 'number'){
		return window.pageYOffset;
	}
	else{
		if ((document.body)&&(document.body.scrollTop)){
			return document.body.scrollTop;
		}
		else{
			if ((document.documentElement)&&(document.documentElement.scrollTop)){
				return document.documentElement.scrollTop;
			}
			else{
				return 0;
			}
		}
	}
}

function GetViewportHeight(){
	if (typeof window.innerHeight != 'undefined'){
		return window.innerHeight;
	}
	else{
		if (((typeof document.documentElement != 'undefined')&&(typeof document.documentElement.clientHeight !=
     'undefined'))&&(document.documentElement.clientHeight != 0)){
			return document.documentElement.clientHeight;
		}
		else{
			return document.getElementsByTagName('body')[0].clientHeight;
		}
	}
}

function TopSettingWithScrollOffset(TopPercent){
	var T = Math.floor(GetViewportHeight() * (TopPercent/100));
	return GetScrollTop() + T; 
}

//CODE FOR AVOIDING LOSS OF DATA WHEN BACKSPACE KEY INVOKES history.back()
var InTextBox = false;

function SuppressBackspace(e){ 
	if (InTextBox == true){return;}
	thisKey = e.keyCode;

	var Suppress = false;

	if (thisKey == 8) {
		Suppress = true;
		e.preventDefault();
	}
}

window.addEventListener('keypress',SuppressBackspace,false);

function ReduceItems(InArray, ReduceToSize){
	var ItemToDump=0;
	var j=0;
	while (InArray.length > ReduceToSize){
		ItemToDump = Math.floor(InArray.length*Math.random());
		InArray.splice(ItemToDump, 1);
	}
}

function Shuffle(InArray){
	var Num;
	var Temp = new Array();
	var Len = InArray.length;

	var j = Len;

	for (var i=0; i<Len; i++){
		Temp[i] = InArray[i];
	}

	for (i=0; i<Len; i++){
		Num = Math.floor(j  *  Math.random());
		InArray[i] = Temp[Num];

		for (var k=Num; k < (j-1); k++) {
			Temp[k] = Temp[k+1];
		}
		j--;
	}
	return InArray;
}

function WriteToInstructions(Feedback) {
	document.getElementById('InstructionsDiv').innerHTML = Feedback;

}




function EscapeDoubleQuotes(InString){
	return InString.replace(/"/g, '&quot;')
}

function TrimString(InString){
        var x = 0;

        if (InString.length != 0) {
                while ((InString.charAt(InString.length - 1) == '\u0020') || (InString.charAt(InString.length - 1) == '\u000A') || (InString.charAt(InString.length - 1) == '\u000D')){
                        InString = InString.substring(0, InString.length - 1)
                }

                while ((InString.charAt(0) == '\u0020') || (InString.charAt(0) == '\u000A') || (InString.charAt(0) == '\u000D')){
                        InString = InString.substring(1, InString.length)
                }

                while (InString.indexOf('  ') != -1) {
                        x = InString.indexOf('  ')
                        InString = InString.substring(0, x) + InString.substring(x+1, InString.length)
                 }

                return InString;
        }

        else {
                return '';
        }
}

function FindLongest(InArray){
	if (InArray.length < 1){return -1;}

	var Longest = 0;
	for (var i=1; i<InArray.length; i++){
		if (InArray[i].length > InArray[Longest].length){
			Longest = i;
		}
	}
	return Longest;
}

//SELECTION OBJECT FOR TYPING WITH KEYPAD
var selObj = null;
            
SelObj = function(box){
	this.box = box;
	this.selStart = this.box.selectionStart;
	this.selEnd = this.box.selectionEnd;
	this.selText = this.box.value.substring(this.selStart, this.selEnd);
	return this;
}

function setSelText(newText){
	var caretPos = this.selStart + newText.length;
	var newValue = this.box.value.substring(0, this.selStart);
	newValue += newText;
	newValue += this.box.value.substring(this.selEnd, this.box.value.length);
	this.box.value = newValue;
	this.box.setSelectionRange(caretPos, caretPos);
	this.box.focus();
}
SelObj.prototype.setSelText = setSelText;

function setSelSelectionRange(start, end){
	this.box.setSelectionRange(start, end);
}
SelObj.prototype.setSelSelectionRange = setSelSelectionRange;

//UNICODE CHARACTER FUNCTIONS
function IsCombiningDiacritic(CharNum){
	var Result = (((CharNum >= 0x0300)&&(CharNum <= 0x370))||((CharNum >= 0x20d0)&&(CharNum <= 0x20ff)));
	Result = Result || (((CharNum >= 0x3099)&&(CharNum <= 0x309a))||((CharNum >= 0xfe20)&&(CharNum <= 0xfe23)));
	return Result;
}

function IsCJK(CharNum){
	return ((CharNum >= 0x3000)&&(CharNum < 0xd800));
}

//SETUP FUNCTIONS
//BROWSER WILL REFILL TEXT BOXES FROM CACHE IF NOT PREVENTED
function ClearTextBoxes(){
	var NList = document.getElementsByTagName('input');
	for (var i=0; i<NList.length; i++){
		if ((NList[i].id.indexOf('Guess') > -1)||(NList[i].id.indexOf('Gap') > -1)){
			NList[i].value = '';
		}
		if (NList[i].id.indexOf('Chk') > -1){
			NList[i].checked = '';
		}
	}
}






//JMATCH-SPECIFIC SCORM-RELATED JAVASCRIPT CODE

//Polyfill for old Safari versions.
if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
}

function SetScormScore(){
//Reports the current score and any other information back to the LMS
	if (API != null){
		API.LMSSetValue('cmi.core.score.raw', Score);
		
//Now send a detailed reports on the item
		var ItemLabel = 'Matching';
		API.LMSSetValue('cmi.objectives.0.id', 'obj'+ItemLabel);
		API.LMSSetValue('cmi.interactions.0.id', 'int'+ItemLabel);	
		API.LMSSetValue('cmi.objectives.0.status', API.LMSGetValue('cmi.core.lesson_status'));	
		API.LMSSetValue('cmi.objectives.0.score.min', '0');
		API.LMSSetValue('cmi.objectives.0.score.max', '100');
		API.LMSSetValue('cmi.objectives.0.score.raw', Score);
//We can only use the performance type, because we're storing multiple responses of various types.
		API.LMSSetValue('cmi.interactions.0.type', 'performance');
		
		var AnswersTried = '';
		for (var i=0; i<Status[0][3].length; i++){
			if (i>0){AnswersTried += ' | ';}
			for (var j=0; j<Status.length; j++){
				if (j>0){AnswersTried += ',';}
				AnswersTried += j + '.' + Status[j][3][i];
			}
		}
		API.LMSSetValue('cmi.interactions.0.student_response', AnswersTried);
		API.LMSCommit('');
	}
}


//JMATCH CORE JAVASCRIPT CODE

var CorrectIndicator = '&#x2714; Richtig';
var IncorrectIndicator = '&#x2718; Falsch';
var YourScoreIs = 'Dein Ergebnis ist... <br> <em>Your result is... </em>';
var CorrectResponse = 'Alles richtig! Sehr gut! <br> <em>All correct! Very good!</em>';
var IncorrectResponse = 'Tut mir Leid. Versuch es nochmal! <br> <em> Sorry. Try again! </em>';
var TotalUnfixedLeftItems = 0;
var TotCorrectChoices = 0;
var Penalties = 0;
var Finished = false;
var TimeOver = false;

var Score = 0;
var Locked = false;
var ShuffleQs = true;
var QsToShow = 7;

function TimerStartUp(){
	setTimeout('JsonEx.Setup()', 300);
}

/*
  The new V7 JSON object replaces the arrays of old.
*/
var V7JsonEx = '{  "ShuffleLeftItems": true,  "IsSimple": true,  "ItemsToShow": 7,  "LeftItems": [{"OrigPos": 0,     "Group": 0}, {"OrigPos": 1,     "Group": 1}, {"OrigPos": 2,     "Group": 2}, {"OrigPos": 3,     "Group": 3}, {"OrigPos": 4,     "Group": 4}, {"OrigPos": 5,     "Group": 5}, {"OrigPos": 6,     "Group": 6}, {"OrigPos": 7,     "Group": 7}, {"OrigPos": 8,     "Group": 8}, {"OrigPos": 9,     "Group": 9}, {"OrigPos": 10,     "Group": 10}, {"OrigPos": 11,     "Group": 11}, {"OrigPos": 12,     "Group": 12}, {"OrigPos": 13,     "Group": 13}, {"OrigPos": 14,     "Group": 14}],  "RightItems": [{"OrigPos": 0,     "Groups": [0], "MatchedWith": -1}, {"OrigPos": 1,     "Groups": [1], "MatchedWith": -1}, {"OrigPos": 2,     "Groups": [2], "MatchedWith": -1}, {"OrigPos": 3,     "Groups": [3], "MatchedWith": -1}, {"OrigPos": 4,     "Groups": [4], "MatchedWith": -1}, {"OrigPos": 5,     "Groups": [5], "MatchedWith": -1}, {"OrigPos": 6,     "Groups": [6], "MatchedWith": -1}, {"OrigPos": 7,     "Groups": [7], "MatchedWith": -1}, {"OrigPos": 8,     "Groups": [8], "MatchedWith": -1}, {"OrigPos": 9,     "Groups": [9], "MatchedWith": -1}, {"OrigPos": 10,     "Groups": [10], "MatchedWith": -1}, {"OrigPos": 11,     "Groups": [11], "MatchedWith": -1}, {"OrigPos": 12,     "Groups": [12], "MatchedWith": -1}, {"OrigPos": 13,     "Groups": [13], "MatchedWith": -1}, {"OrigPos": 14,     "Groups": [14], "MatchedWith": -1}]}';

var JsonEx = JSON.parse(V7JsonEx);

JsonEx.GetLeftItemByOrigPos = function(Pos){
	for (var i=0; i<this.LeftItems.length; i++){
		if (this.LeftItems[i].OrigPos == Pos){
			return this.LeftItems[i];
		}
	}
	return null;
};

JsonEx.GetRightItemByOrigPos = function(Pos){
	for (var i=0; i<this.RightItems.length; i++){
		if (this.RightItems[i].OrigPos == Pos){
			return this.RightItems[i];
		}
	}
	return null;
};

//Methods for the object.
JsonEx.Setup = function(){
	var i, j, nList, LI, RI;
	

	ScormStartUp();






//Get a reference to the table's tbody.
	this.tbody = document.querySelector('tbody#MatchItems');
	
//Connect each of the items to its cell or select element.
	for (var i=0; i<this.LeftItems.length; i++){
		LI = this.LeftItems[i];
		LI.Cell = document.getElementById('L_' + LI.OrigPos);
		LI.Select = LI.Cell.nextElementSibling.getElementsByTagName('select')[0];
		LI.MarkingCell = LI.Cell.nextElementSibling.nextElementSibling;
//Now check whether this item is a distractor that shouldn't have a matching
//right item.
		LI.IsDistractor = (this.GetRightItemByOrigPos(LI.OrigPos) === null);
	}

	this.RightItems.forEach(function(RI){
//Note: this doesn't really matter; the only thing that matters is 
//the selected option and its match to the left item in the preceding
//cell.
		RI.Select = document.getElementById('R_' + RI.OrigPos);
	});
	
//Reduce the items as required. Sanity check: don't allow less than 2.
	if (this.ItemsToShow > 2){
		while (this.LeftItems.length > this.ItemsToShow){
			RemItem = Math.floor(this.LeftItems.length*Math.random());
			OP = this.LeftItems[RemItem].OrigPos;
//Remove the whole table row which is the parent of this left item.
			var row = this.LeftItems[RemItem].Cell.parentNode;
			row.parentNode.removeChild(row);
			this.LeftItems.splice(RemItem, 1);

//Having removed an item from the left, we must remove the corresponding 
//one from the right if it exists. (There may not be a matching item if 
//the one removed was a distractor.)
			for (i = 0; i < this.RightItems.length; i++){
				if (this.RightItems[i].OrigPos == OP){
//Before removing the item itself, we need to remove its option
//from all the select elements.
					nList = document.querySelectorAll('option[data-origPos="R_' + OP + '"]');
					for (var j=0; j<nList.length; j++){
						nList[j].parentNode.removeChild(nList[j]);
					}
					this.RightItems.splice(i, 1);
				}
			}
		}
	}
//Now do any shuffling that's required.
	if (this.ShuffleLeftItems == true){
		var arrRows = new Array();
		var rows = this.tbody.getElementsByTagName('tr');
		for (i=rows.length-1; i>=0; i--){
			arrRows.push(this.tbody.removeChild(rows[i]));
		}
		arrRows = Shuffle(arrRows);
		for (i=0; i<arrRows.length; i++){
			this.tbody.appendChild(arrRows[i]);
		}
	}
	
//Now get a reference to all selectors, since distractors may not be associated
//with a right item.
	this.AllSelects = document.querySelectorAll('select[id^="R_"]');
	
//Now we check for any select that should be pre-selected (fixed item).
	for (i = 0; i<this.AllSelects.length; i++){
		var Sel = this.AllSelects[i];
		var Pos = parseInt(Sel.id.substring(2));
		var RI = this.GetRightItemByOrigPos(Pos);
		if ((RI)&&(RI.MatchedWith > -1)){
			for (var j=0; j<Sel.options.length; j++){
				if (Sel.options[j].value == Pos){
					Sel.options.selectedIndex = j;
					Sel.dispatchEvent(new Event("change", {"bubbles": true}));
					break;
				}
			}
		}
	}


	StartTimer();
	

};

JsonEx.AlignSelects = function(OrigPos){
	var Select = document.getElementById('R_' + OrigPos);
	var CurrMatch = Select.options[Select.selectedIndex].value;
	var RI = this.GetRightItemByOrigPos(OrigPos);
	var i;
	
	//First we make sure that if this is unselecting
	//a previous selection, we re-show all the corresponding
	//items.
	if ((!RI)||(RI.MatchedWith != CurrMatch)){
		var lastMatch = RI? RI.MatchedWith : Select.getAttribute('data-LastMatch') ? Select.getAttribute('data-LastMatch') : -1;
		for (i=0; i<this.AllSelects.length; i++){
			if (Select !== this.AllSelects[i]){
				var opt = this.AllSelects[i].querySelector('option[value="' + lastMatch + '"]');
				opt.removeAttribute('disabled');
			}
		}
	}
	
	//Store the current match either in the object or on the select if it's a distractor.
	if (RI){
		RI.MatchedWith = CurrMatch;
	}
	else{
		Select.setAttribute('data-lastMatch', CurrMatch);
	}
	
	//Now we hide any other instances of the selected option.
	if (CurrMatch > -1){
		for (i=0; i<this.AllSelects.length; i++){
			if (Select !== this.AllSelects[i]){
				this.AllSelects[i].querySelector('option[value="' + CurrMatch + '"]').disabled = 'disabled';
			}
		}
	}
};

JsonEx.CheckAnswers = function(){
/*
	Check each right item to see whether a) it had an 
	original match on the left, and b) it is matched
	to a left item whose group is one of its groups.
*/

	if (!this.hasOwnProperty('Penalties')){
		this.Penalties = 0;
	}
	var ItemsToCount = this.AllSelects.length;
	var CorrectItems = 0;
	var Done = true; //Assume till proven otherwise.
	var i, selectedOrigPos, LI, RI;
	
//Tot up the scores.

//Go through all the left items.
	for (i=0; i<this.LeftItems.length; i++){
		LI = this.LeftItems[i];
//Get the selection made.

			selectedOrigPos = LI.Select.options[LI.Select.options.selectedIndex].value;
//First check whether the left item is a distractor, so nothing should
//match with it.
		if (LI.IsDistractor){
			if (selectedOrigPos == -1){
				LI.MarkingCell.innerHTML = CorrectIndicator;
				if ((this.IsSimple)&&(LI.Select.style.display !== 'none')){
					LI.Select.parentNode.appendChild(document.createTextNode(LI.Select.options[LI.Select.options.selectedIndex].innerText));
					LI.Select.style.display = 'none';
				}
				CorrectItems++;
			}
			else{
				LI.MarkingCell.innerHTML = IncorrectIndicator;
				Done = false;
			}
		}
		else{
//If the LI is not a distractor, then no selection (-1) must be wrong.
			if (selectedOrigPos == -1){
				LI.MarkingCell.innerHTML = IncorrectIndicator;
				Done = false;
			}
			else{
//Otherwise a selection is expected, and its groups must match.	
//Find the corresponding right item.
				RI = this.GetRightItemByOrigPos(selectedOrigPos);	
				if (RI.Groups.indexOf(LI.Group) > -1){
				//Mark this right
					LI.MarkingCell.innerHTML = CorrectIndicator;
					if ((this.IsSimple)&&(LI.Select.style.display !== 'none')){
						//LI.Select.parentNode.innerHTML = LI.Select.options[LI.Select.options.selectedIndex].innerText;
						LI.Select.parentNode.appendChild(document.createTextNode(LI.Select.options[LI.Select.options.selectedIndex].innerText));
						LI.Select.style.display = 'none';
					}
					CorrectItems++;
				}
				else{
					LI.MarkingCell.innerHTML = IncorrectIndicator;
					Done = false;
				}
			}
		}
	}

	if (!this.hasOwnProperty('Score')){
		this.Score = 0;
	}
	this.Score = Math.round((100*(CorrectItems - this.Penalties))/ItemsToCount);
	if (Done === false){
		this.Penalties++;
	}
	return Done;
};

function CheckAnswers(){
	if (Locked == true){return;}
	
	var Feedback = '';

	var AllDone = JsonEx.CheckAnswers();
	Score = JsonEx.Score;
	if (Score < 0){Score = 0;}

	if (AllDone == true){
		Feedback = YourScoreIs + ' ' + Score + '%.<br/>' + CorrectResponse;
	}
	else {
		if (TimeOver == true){
			Feedback = YourScoreIs + ' ' + Score + '%.'
		}
		else{
			Feedback = YourScoreIs + ' ' + Score + '%.' + '<br />' + IncorrectResponse;
		}
	}
	ShowMessage(Feedback);
	
//If the exercise is over, deal with that
	if ((AllDone == true)||(TimeOver == true)){


		window.clearInterval(Interval);

		TimeOver = true;
		Locked = true;
		Finished = true;
		WriteToInstructions(Feedback);
	}

	if (AllDone == true){
		SetScormComplete();
	}
	else{
		SetScormIncomplete();
	}

	
}


function TimesUp() {
	document.getElementById('Timer').innerHTML = 'Die Zeit ist um! <em> Time is up! <em>';

	TimeOver = true;
	CheckAnswers();
	Locked = true;

	SetScormTimedOut();

}






//CODE FOR HANDLING TIMER
//Timer code
var Seconds = 240;
var Interval = null;

function StartTimer(){
	Interval = window.setInterval('DownTime()',1000);
	document.getElementById('TimerText').style.display = 'inline';
}

function DownTime(){
	var ss = Seconds % 60;
	if (ss<10){
		ss='0' + ss + '';
	}

	var mm = Math.floor(Seconds / 60);

	if (document.getElementById('Timer') == null){
		return;
	}

	document.getElementById('TimerText').innerHTML = mm + ':' + ss;
	if (Seconds < 1){
		window.clearInterval(Interval);
		TimeOver = true;
		TimesUp();
	}
	Seconds--;
}






//-->

//]]>


