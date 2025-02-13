var avatarID;
var avatarName;
var voice_array;
var portal;
var timer_on = false;
var side;
var pass;
var speaking = false;
var pageName = location.pathname.split("/").slice(-1)[0].split(".")[0]

if (pageName.includes("left")) {
	side="left"
	pass="right"
	}
else {
	side="right"
	pass="left"
	}
	
console.log(pageName + " is on the " + side)

class release {
  	constructor() {
    	this.trigger = "start"
    	this.value = false
 	}
	triggered(item) {
		if (this.trigger == item) {
			return this.value
		}
		else {
			return false
		}
	}
 	add(item) {
 		this.trigger = item
 		this.value = true
 	}
 	wipe() {
 		this.trigger = "start"
 		this.value = false
 	}
}
 		
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

/*
async function vh_audioStarted(portal) {
	change_gaze_direction("center")
}
*/

async function vh_audioEnded(portal) {
    console.log(`End of Audio: Finished command`)
    id = window.command?.id
    if (typeof value != 'undefined')
    {
    writeToDone(id)
	speaking = false
	}
    
}

function execute_command(command) {
	console.log(command)
	change_avatar(command?.avatar?.id, command?.avatar?.makeVisible)
// 	blip(command?.blip, command?.avatar)
	selectPortal(avatar_window)
    change_image(command?.image);
    if (command["text"]) {
		console.log(voice_array)
        sayText(command["text"], ...voice_array) //, command.voice?.effect, command.voice?.intensity);
    } else {
        vh_audioEnded(0);
    };    
    change_emotion(command?.expression);
    change_gaze_direction(command?.gaze);
}

async function initialize_avatar(id, name, voice, portal) {
    avatarID = id;
	avatarName = name;
	voice_array = voice.split(",",3);
	voice_array=voice_array.map(Number);
	speaking = false;
	avatar_window = Number(portal);
	if (!timer_on) {
		// start timer for checking the queue and executing commands
		console.log("Start Timer")
		timer_on = true;
		setInterval(function() {
			setTimeout(async () => {
				FetchGeneratedJSON();
				if (Commands.remaining()) {
					trigger = Commands.peek()["trigger"]
					if (trigger == "Free Trigger") {window.Release.add("Free Trigger")	}
					else {checkTrigger(trigger)}                             
				if (Commands.remaining() && window.Release.triggered(trigger) && !speaking) {
					window.Release.wipe()
					speaking = true;
					window.command = Commands.dequeue()
					console.log(`Executing command ${window.command}`);
					execute_command(window.command)}
				}
			}, 500)
		}, 250)
	}
}

function FetchGeneratedJSON() {
	fetch('https://api.the-singularity-show.com/api/latest/', { 
		method: 'POST',
		body: JSON.stringify({file: pageName,}),
		headers: {"Content-Type": "application/json"}
	})
	.then(response => {
    	if (response.ok) {
			json = response.json();
        	return json
    	} else {
        	throw new Error('File not found from Fetch of Command');
    	}
	})
	.then(json => {
		if (json["content"][0]?.action == "PURGE"){
				console.warn("Purging Commands")
				Commands.purge()
				window.Release.wipe()
				return
		} else {
			for (var command in json["content"]) {
				console.warn(json["content"][command])
				Commands.enqueue(json["content"][command])
			}
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
console.log(trigger)
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

function change_avatar(newID, makeVisible) {
	if (!!newID &&  newID != avatarID) {
		console.log("changing to avatar "+newID)
		const new_div = document.getElementById(newID);
		if (makeVisible) {
			const curr_div = document.getElementById(avatarID);
			initialize_avatar(new_div.getAttribute('id'), new_div.getAttribute('name'), new_div.getAttribute('voice'), new_div.getAttribute('portal'));
			curr_div.style.visibility='hidden';
			new_div.style.visibility='visible';
			if (newID == 2756475){
				document.getElementById("background_img").src = "https://c1.wallpaperflare.com/preview/451/797/210/industrial-machinery-dark-forgotten.jpg"
				}
			else if (newID == 2756584 && side == "left"){
				document.getElementById("background_img").src = "https://professionals.engineering.osu.edu/sites/default/files/styles/coe_medium_small/public/2021-02/NeuralNetworks.png"
					}
			else if (newID == 2756584 && side == "right"){
				document.getElementById("background_img").src = "https://www.science.org/do/10.1126/science.abc2274/abs/AIevolution_1280p.jpg"
					}
			else if (newID == 2760344){
				document.getElementById("background_img").src = "https://i2-prod.walesonline.co.uk/incoming/article15749655.ece/ALTERNATES/s615/0_Urban-explorer-Andy-Kay.jpg"
					}
			else {
				document.getElementById("background_img").src = "https://www.science.org/do/10.1126/science.abc2274/abs/AIevolution_1280p.jpg"
				}

		}
	}
}

function blip(visible, avatar) {
	console.log("Trying to blip " + visible)
	if (visible == "on") {
		document.getElementById(avatar).style.visibility='visible';
		}
	else if (visible == "off"){
		document.getElementById(avatar).style.visibility='hidden';
		}}


function change_image(pair) {
    setBackground('')
    if (pair) {
    	url_str = pair[0]
    	target = pair[1]+"_img"
    	container = pair[1]+"_div"
    	console.log(target)   	
    	if (url_str == "")
    		{
             document.getElementById(container).style.visibility="hidden"
    		}
    	else {
        	document.getElementById(target).src = url_str
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