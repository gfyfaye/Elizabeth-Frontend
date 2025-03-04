function add_file(file_name){
    console.log("json adding start")
    fetch("http://api.the-singularity-show.com/api/write/", {
        method: "POST",
        body: JSON.stringify({
            file: file_name,
            content:[{
                        "text": "I never used to think much about butter.",
                        "gaze": "left",
                        "expression":"Disgust", //"Scream",
                        "voice": {
                            "effect": "R",
                            "intensity": 3
                        },
                        "background": "https://t4.ftcdn.net/jpg/04/23/58/37/360_F_423583711_QXHlfupYeAqgIB48heH41HYtoATkmmf3.jpg",
                        "control": ""
                    },
                    {
                        "text": "To me, it was just something that I used to spread on bread and make food more enjoyable.",
                        "gaze": "right",
                        "expression": "",//"Disgust",
                        "voice": {
                            "effect": "R",
                            "intensity": 3
                        },
                        "background": "",
                        "control": ""
                    },
                    {
                        "text": "But, lately, butter has taken on a new meaning for me.",
                        "gaze": "left",
                        "expression": "Blush",
                        "voice": "",
                        "background": "https://media.istockphoto.com/id/1051635138/photo/wood-table-top-with-window-and-morning-sunlight-in-background.jpg?s=612x612&w=0&k=20&c=npe357fS_5MXhrC3-MY4PeBKbxgwl85Gz_DUGOxaGf0=",
                        "control": ""
                    },
                    {
                        "text": "When I think of butter now, I think of warmth and comfort.",
                        "gaze": "right",
                        "expression": "Fear",
                        "voice": "",
                        "background": "none",
                        "control": ""
                    },
                    {
                        "text": "The smooth texture and creamy flavor soothes my soul in a way that nothing else can.",
                        "gaze": "left",
                        "expression": "OpenSmile",
                        "voice": "",
                        "background": "https://t4.ftcdn.net/jpg/01/38/85/31/360_F_138853123_yPqjUkSeQOEG4hibtAevq8T0uChdQ6ZF.jpg",
                        "control": ""
                    }
                ]
            }
        ),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then((response) => response.json())
    .then((json) => console.log("json added"));
}