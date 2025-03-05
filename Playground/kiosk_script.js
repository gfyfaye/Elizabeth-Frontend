var json_file = [];
var speaking = false;

function pushTestCommands() {
    if (json_file.length == 0){
        json_file.push(
            { "text": "Hello, this is the first message." },
            { "text": "Here's another thing I have to say!" },
            { "text": "Testing message three, let's see how this works." },
            { "text": "Almost done, this is message four." },
            { "text": "Final message in the queue. Let's go!" }
        );
    }
    console.log("Added test messages to json_file:", json_file);
}

function vh_sceneLoaded() {
    console.log("Initializing DEV");

    pushTestCommands();

    setInterval(() => {
        FetchGeneratedJSON(); 
        processQueue(); 
    }, 2000);
}

function processQueue() {
    if (json_file.length > 0 && !speaking) {
        speaking = true;
        var curr_command = json_file.shift();

        execute_command(curr_command);
    }
}

async function execute_command(command) {
    if (command?.text) {
        console.log("Speaking:", command.text);
        await sayText(command.text, 3, 1, 3);
    }
    speaking = false;
}

function FetchGeneratedJSON() {
    fetch("https://api.the-singularity-show.com/api/latest/", {
        method: "POST",
        body: JSON.stringify({ file: "avatar" }),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.ok ? response.json() : Promise.reject("File not found"))
    .then(response => {
        json_file = json_file.concat(response.content);
        console.log("Updated JSON queue:", json_file);
    })
    .catch(error => console.error("API Error:", error));
}
