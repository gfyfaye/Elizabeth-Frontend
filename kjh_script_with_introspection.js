var avatarID;
var voice_array;
var waitingDirection;

var json_file = [];
var trading_file;
var curr_command = {};
var curr_command_index=0;
var speaking = false;
var myTurn = false;
var facing ="center"

var avatarID = location.pathname.split("/").slice(-1)[0].split(".")[0]

if (avatarID.includes("left")){
	side="left"
	pass="right"
	}
else {
	side="right"
	pass="left"
	}

console.log(avatarID +" is on the " + side)

function vh_sceneLoaded(sceneIndex, portal) {
    console.log("Initializing DEV");
    followCursor(0);
    // sleepMode();
    setInterval(function() {
        setTimeout(async () => {
            FetchGeneratedJSON();
            if (json_file.length > 0 && !speaking) {
                speaking = true;
                curr_command = json_file[curr_command_index];
				
				console.warn(json_file);
                console.log(`Executing command ${curr_command_index}`);
                console.log("In mode " + curr_command?.mode);
                console.warn(curr_command);

                console.log("I will wait to speak");
                await waitToSpeak();

                if (curr_command?.mode == "news") {
                    console.log("Going into News Mode");
					await setNews(curr_command);
                }                
                execute_command(curr_command, portal);
            }
        }, 5000)
    }, 2000)
}

async function vh_audioStarted(portal) {
    change_gaze_direction("center");
    await WriteToIntrospectionFile("", avatarID);
}


async function vh_audioEnded(portal) {
    console.log(`Finished command ${curr_command_index}`)
    if (curr_command?.mode == "end") {
        console.warn("End of Command")
        await WriteStatus("out");
    }

    if (!curr_command?.continue) {
        await WriteToIntrospectionFile(avatarID, "");
        myTurn = false;  
        console.log("I will wait to speak")
        await waitToSpeak();
    }

    curr_command_index += 1;
    curr_command = json_file[curr_command_index];
    console.log(`Executing command ${curr_command_index}`)

    if (!curr_command) {
        speaking=false;
        curr_command_index=0;
        json_file = [];
        await WriteToIntrospectionFile("", "");
        myTurn = false;
        if (curr_command?.mode == "end") {
             console.warn("shutting down")
        	await WriteStatus("out");
        }
        return;
    }

    execute_command(curr_command, portal); 

}

function execute_command(command, portal) {
    console.log("I can speak now")
    change_image(command?.image);
    if (command["text"]) {
    	console.warn(command["text"])
        sayText(command["text"], ...voice_array, command.voice?.effect, command.voice?.intensity);
    } else {
        vh_audioEnded(portal);
    };    
    change_emotion(command?.expression);
    change_gaze_direction(command?.gaze);
}

function initialize_avatar(id, voice) {
    voice_array = voice
    if (avatarID.includes("left")) {
        waitingDirection = "left"
    } else if (avatarID.includes("right")) {
        waitingDirection = "right"
    }
}


function FetchGeneratedJSON() {
	console.log("Fetching my file:" + avatarID)
    fetch('https://api.the-singularity-show.com/api/latest/', { 
    method: 'POST',
    body: JSON.stringify({
        file: avatarID,
    }),
    headers: {
        "Content-Type": "application/json"
    }
})
.then(response => {
    if (response.ok) {
		json = response.json();
        return json
    } else {
        throw new Error('File not found');
    }
})
.then(response => {
    if (!speaking) {
        json_file = response["content"];
        if (json_file.length==0) {
            speaking=false;
            console.log(`Nothing in this file: ${!speaking}`);
        }
    } else {
    	json_file = json_file.concat(response["content"]);
    	}
})
}

/* 
async function WriteToTradingFile(done_str, started_str) {
	fetch("https://api.the-singularity-show.com/api/write/", {
    method: "POST",
    body: JSON.stringify({
        file: "trading",
        content: {
            done: done_str,
            started: started_str
        }
    }),
    headers: {
        "Content-Type": "application/json"
    }
})
.then((response) => response.json())
.then((json) => {console.log(json); console.log(done_str, started_str);})

}
 */

async function WriteStatus(status) {
	fetch("https://api.the-singularity-show.com/api/write/", {
    method: "POST",
    body: JSON.stringify({file: "status", content: {"speaker": avatarID, "status": status}}),
    headers: {"Content-Type": "application/json"}
})
.then((response) => response.json())
.then((json) => {console.log(json); console.warn("Holding Processes");})
}

async function WriteToIntrospectionFile(done_str, started_str) {
    fetch("https://api.the-singularity-show.com/api/write/", {
    method: "POST",
    body: JSON.stringify({
        file: "introspection",
        content: {
            done: done_str,
            started: started_str
        }
    }),
    headers: {
        "Content-Type": "application/json"
    }
})
.then((response) => response.json())
.then((json) => {console.log(json); console.log(done_str, started_str);})
}


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


async function waitToSpeak() {
    while (!myTurn) {
        await sleep(200);
        await updateMyTurn();
    }
}


async function updateMyTurn() {
    fetch('https://api.the-singularity-show.com/api/read/', { 
        method: 'POST',
        body: JSON.stringify({
            file: "introspection", // I changed this from trading to introspection.
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('File not found');
        }
    })
    .then(response => {
        // It is my turn if:
        //  a) I have started speaking (first to go will be labeled as started)
        //       OR
        //  b) Some other avatar has finished speaking
        //       OR 
        //  c) No one is speaking
        var obj = response?.content[0]
        myTurn = (obj.started == avatarID) ||
                (!!obj?.done && obj?.done != avatarID) ||
                (!obj?.done && !obj?.started);
        console.warn(obj);
        console.log(myTurn);
        console.log(!obj?.done && !obj?.started);
        })
}

function change_scene(avatar) {
	if(avatar){
	 loadSceneByID(avatar)}}
    	

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


	

	