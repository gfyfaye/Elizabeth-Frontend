var voice_array;
var waitingDirection;

var json_file = [];
var trading_file;
var curr_command = {};
var curr_command_index=0;
var speaking = false;
var facing ="center"
var lastCount = 0

/* 
var avatarID = location.pathname.split("/").slice(-1)[0].split(".")[0]
 */

var targetName

if (location.pathname.includes("left")){
	targetName="left"
	}
else {
	targetName="right"
	}
	
class release {
  	constructor() {
    	this.trigger = "start"
    	this.value = false
 	}
	triggered(item) {
	if (this.trigger == item) {
		return this.value
		}
		else {return false
	 }}
 	add(item) {
 		this.trigger = item
 		this.value = true
 	}
 	wipe(){
 		this.trigger = "start"
 		this.value = false
 	}
}
 			

/* 
I want to change the json file into a real queue called Commands
 */

class Queue {
  constructor() {
    this.items = {};
    this.headIndex = 0;
    this.tailIndex = 0;
  }
  enqueue(item) {
    this.items[this.tailIndex] = item;
    this.tailIndex++;
  }
  dequeue() {
    const item = this.items[this.headIndex];
    delete this.items[this.headIndex];
    this.headIndex++;
    return item;
  }
  peek() {
    return this.items[this.headIndex];
  }
  remaining() {
 	if (this.tailIndex - this.headIndex == 0){return false}
 	else {return true}
  }
 empty() {
 	if (this.tailIndex - this.headIndex == 0){return true}
 	else {return false}
  }
  purge(item) {
    this.items = {};
    this.headIndex = 0;
    this.tailIndex = 0;
  }
  get length() {
    return this.tailIndex - this.headIndex;
  }
}

var Commands = new Queue
window.Release = new release


console.log("This Avatar is on the " + targetName)

function vh_sceneLoaded(sceneIndex, portal) {
    console.log("Initializing DEV");
    followCursor(0);
    // sleepMode();
    setInterval(function() {
        setTimeout(async () => {
            FetchGeneratedJSON();
                      
            if (Commands.remaining()) {
            	trigger = Commands.peek()["trigger"]
            	if (trigger == "Free Trigger") {window.Release.add("Free Trigger")	}
            	else {checkTrigger(trigger)}            	                  
            if (Commands.remaining() && window.Release.triggered(trigger) && !speaking){
             	window.Release.wipe()
           		speaking = true;
     			window.command = Commands.dequeue()
            	console.log(`Executing command ${window.command}`);
            	execute_command(window.command, portal)}
            }
        }, 500)
    }, 250)
}


async function vh_audioStarted(portal) {
	change_gaze_direction("center")
}

async function vh_audioEnded(portal) {
    console.log(`End of Audio: Finished command`)
    id = window.command?.id
    writeToDone(id)
	speaking = false
	}


function execute_command(command, portal) {
	console.log("Executing: " + command)
    change_image(command?.image);
    if (command["text"]) 
    	{
        sayText(command["text"], ...voice_array, command.voice?.effect, command.voice?.intensity);
    	} 
    else 
    	{
        vh_audioEnded(portal);
    	};    
    change_emotion(command?.expression);
    change_gaze_direction(command?.gaze);
}

function initialize_avatar(id, voice) {
    voice_array = voice
    if (location.pathname.includes("left")) {
        waitingDirection = "left"
    } 
    else {waitingDirection = "right"
    }
}

function FetchGeneratedJSON() {
	fetch('https://api.the-singularity-show.com/api/latest/', { 
		method: 'POST',
		body: JSON.stringify({file: targetName,}),
		headers: {"Content-Type": "application/json"}
	})
	.then(response => {
    	if (response.ok) {
			json = response.json();
        	return json
    		} 
    	else 
    		{
        throw new Error('File not found');
    		}
	})
	.then(json => {
    		if (json["content"][0]?.action == "PURGE"){
    				console.warn("Purging Commands")
    				Commands.purge()
    				window.Release.wipe()
    				return
    			}
    		else{
				for (var command in json["content"]){
					console.warn(json["content"][command])
					Commands.enqueue(json["content"][command])}
					return
				}
	 	})
}



// Create a function that wraps the API call in a Promise
function fetchData(trigger) {
  return new Promise((resolve, reject) => {
    fetch('https://api.the-singularity-show.com/api/ready/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({id: trigger}),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

// Call the fetchData function with the API endpoint URL and the data to send

function checkTrigger(trigger){
fetchData(trigger)
  .then(data => {
    // Set the global variable to the fetched data on success
    if (data["content"] == true){
    	window.Release.add(trigger)
    	console.log(trigger + ' Data fetched successfully:', window.Release)};
  })
  .catch(error => {
    // Set the global variable to false on failure
    window.Release.wipe()
    console.error('Failed to fetch data:', error);
  });
}



/* 
async function window.ReleaseQueue() {
	if (Commands.remaining()){
		trigger = Commands.peek()?.trigger
		console.warn("Looking at:" + trigger)
		checkTrigger(trigger)
		}
		else{window.released = false}
	}


function checkTrigger(trigger) {
	console.log("Checking trigger: " + trigger)
		
	fetch('https://api.the-singularity-show.com/api/ready/', { 
		method: 'POST',
		body: JSON.stringify({id: trigger}),
		headers: {"Content-Type": "application/json"}
	})
	.then(response => {
		console.warn(trigger)
		if (response.ok) {return response.json()} 
		else {throw new Error('File not found')}
	})
	.then(response => {
		if (response?.content == true){
				console.log("yes it is true")
			window.released = true
			return true}
		else{
			console.log("no it is false")
			window.released = false
			return false}

			}
		)
	}
 */

async function writeToDone(id) {
	console.log("Marking as done")
	console.log(id)
	body = JSON.stringify({id: id})
    fetch("https://api.the-singularity-show.com/api/done/", {
    	method: "POST",
    	body: body,
    	headers: {"Content-Type": "application/json"}
	})
	body = JSON.stringify({file: id, content: true})
    fetch("https://api.the-singularity-show.com/api/write/", {
    	method: "POST",
    	body: body,
    	headers: {"Content-Type": "application/json"}
    })
}


function change_image(pair) {
    setBackground('')
    if (pair) {
    	url_str = pair[0]
    	div = pair[1]+"_img"
    	container = pair[1]+"_div"
    	console.log(div)   	
    	if (url_str == "")
    		{
             document.getElementById(container).style.visibility="hidden"
    		}
    	else {
        	document.getElementById(div).src = url_str
            document.getElementById(container).style.visibility="visible"
    	}
    }
}

function change_gaze_direction(direction){
    console.log(`Gaze Direction: ${direction}`)
    if (direction == "right"){
        setGaze(90, 120, 100);
    }
    else if (direction == "left"){
        setGaze(270, 120, 100);
    }
    else if (direction == "up") {
        setGaze(0, 120, 100);
    }
    else if (direction == "down"){
        setGaze(180, 120, 100);
    }
    else if (direction == "center"){
        recenter();
    }
}

function change_emotion(emotion) {
    console.log(`Emotion: ${emotion}`)
    if (emotion) {
        setFacialExpression(emotion,1,-1);
    } 
}

const sleep = ms => new Promise(res => setTimeout(res, ms))


function change_scene(avatar) {
	if(avatar){
	 loadSceneByID(avatar)}
}
    	

function sleepMode() {
    change_gaze_direction("down")
    change_emotion("Blink")
}

async function setNews(command) {
	document.getElementById("scroll_text").innerHTML=command?.chyron
	document.getElementById("chyron_div").style.visibility="visible"
	console.warn(command?.newstext)
	await sleep(500)
   		.then(() => {
   			setGaze(180,120,100)
			setFacialExpression("Thinking",1,-1)})
	await sleep(2000)
   		.then(() => {setFacialExpression("Surprise",.5,-1)})
	await sleep(3000)
   		.then(() => {setFacialExpression("Disgust",.5,-1)})
	await sleep(4000)
   		.then(() => {setFacialExpression("Smile",.8,3); setGaze(0,120,100);
   					console.warn(command?.newstext);
   					sayText(command?.newstext, ...voice_array, command.voice?.effect, command.voice?.intensity)})
}


	

	