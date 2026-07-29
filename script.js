let draggedIndex = null;

const sentence = [];

const adjectives = [
    "happy",
    "angry",
    "tiny",
    "purple",
    "fluffy"
];

const nouns = [
    "dog",
    "dragon",
    "banana",
    "robot",
    "pirate"
];

const verbs = [
    "eat",
    "throw",
    "hug",
    "kick",
    "admire"
];

const tools = document.querySelectorAll(".tool");

tools.forEach(function(tool){

    tool.addEventListener("click", function(){

        const type = tool.dataset.type;

        if(type == "text"){

            const value = prompt("Enter your text:");

            if(value === null || value.trim() === ""){
                return;
            }

            sentence.push({
                type:"text",
                value:value
            });

        }
        else{

            sentence.push({
                type:type
            });

        }

        drawSentence();

    });

});

function randomWord(list){

    return list[Math.floor(Math.random()*list.length)];

}

function drawSentence(){

    const area = document.getElementById("sentence");

    area.addEventListener("dragover", function(event){

        event.preventDefault();
    
    });

    area.addEventListener("drop", function(){

        if(draggedIndex === null){
            return;
        }
    
        const block = sentence.splice(draggedIndex,1)[0];
    
        sentence.push(block);
    
        draggedIndex = null;
    
        drawSentence();
    
    });

    area.innerHTML = "";

    sentence.forEach(function(block, index){

        const div = document.createElement("div");

        div.draggable = true;

        div.className = "block";

        div.addEventListener("dragstart", function(){

            draggedIndex = index;
        
        });

        if(block.type=="text"){

            div.classList.add("textBlock");
            div.textContent = block.value;

        }
        else{

            div.textContent = "["+block.type+"]";

        }

        area.appendChild(div);

    });

}

document.getElementById("generateButton").addEventListener("click", function(){

    let result = "";

    sentence.forEach(function(block){

        if(block.type=="text"){

            result += block.value + " ";

        }

        if(block.type=="adjective"){

            result += randomWord(adjectives) + " ";

        }

        if(block.type=="noun"){

            result += randomWord(nouns) + " ";

        }

        if(block.type=="verb"){

            result += randomWord(verbs) + " ";

        }

    });

    document.getElementById("output").textContent = result;

});
