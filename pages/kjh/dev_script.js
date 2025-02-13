var avatarID;
var voice_array;
var waitingDirection;

var json_file = [];
var introspection_file;
var curr_command = {};
var curr_command_index=0;
var speaking = false;
var myTurn = false;
   
var avatarID = location.pathname.split("/").slice(-1)[0].split(".")[0]

   
function vh_sceneLoaded(sceneIndex, portal) {
    console.log("Initializing DEV");
    followCursor(0);
    // sleepMode();
    setInterval(function() {
        setTimeout(async () => {
            FetchGeneratedJSON();
            if (json_file.length>0 && !speaking) {
                speaking = true;
                curr_command = json_file[curr_command_index];
                console.error(avatarID)
                console.log("Executing command" + curr_command);
                console.log("I will wait to speak")
                await waitToSpeak();
                execute_command(curr_command, portal);
            }
        }, 5000
        )
   }, 2000)
}

async function vh_audioStarted(portal) {
    await WriteToIntrospectionFile("", avatarID);
}

async function vh_audioEnded(portal) {
    console.log(`Finished command ${curr_command_index}`)
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
        await WriteToIntrospectionFile("", avatarID);
        myTurn = false;
        return;
    }

    execute_command(curr_command, portal);

}

function execute_command(command, portal) {
    change_background_image(command?.background);
    if (command["text"]) {
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
        waitingDirection = "right"
    } else if (avatarID.includes("right")) {
        waitingDirection = "left"
    }
}

function FetchGeneratedJSON() {
    fetch('https://api.the-singularity-show.com/api/latest/', { 
    method: 'POST',
    body: JSON.stringify({
        file: String(avatarID),
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
    json_file = json_file.concat(response.content)
    if (json_file.length==0) {
        speaking=false;
//        console.log(`I am ready to speak: ${!speaking}`);
    }
    console.log("JSON :", json_file)
})
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


function change_background_image(url_str) {
    setBackground('')
    if (url_str) {
        url = `url(${url_str})`
        if (url_str=="none") {
            url = ""
        }
        document.getElementById("sitepal_window").style.backgroundImage = url
        document.getElementById("sitepal_window").style.backgroundRepeat = "no-repeat"
        document.getElementById("sitepal_window").style.backgroundSize = "cover"  
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
    } else {
        setFacialExpression("None",1,-1);
    }
}

const sleep = ms => new Promise(res => setTimeout(res, ms))

async function waitToSpeak() {
    while (!myTurn) {
        change_gaze_direction(waitingDirection);
        await sleep(200);
        await updateMyTurn();
    }
}

async function updateMyTurn() {
    fetch('https://api.the-singularity-show.com/api/read/', { 
        method: 'POST',
        body: JSON.stringify({
            file: "introspection",
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
        console.log(obj);
        console.log(myTurn);
        console.log(!obj?.done && !obj?.started)
        })
}

function changeScene(avatar) {
    if (avatar=="human") {
        loadSceneByID(2756583)
    } else {
        loadSceneByID(2756584)
    } 
}

function sleepMode() {
    change_gaze_direction("down")
    change_emotion("Blink")
}