// =====================================================
// DATA
// =====================================================

// This array stores the sentence being built.
// It is the "source of truth" for our application.
// Corny-ahh comment

const sentence = [];

let nextBlockID = 1;

// Variables used while dragging blocks.
let draggedBlockID = null;
let dragElement = null;
let isDragging = false;
let dropIndex = null;


// =====================================================
// DICTIONARY
// =====================================================

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


// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function randomWord(list) {

    return list[Math.floor(Math.random() * list.length)];

}

function getBlockIndex(id) {

    return sentence.findIndex(function(block) {

        return block.id === id;

    });

}

// =====================================================
// DRAWING FUNCTIONS
// =====================================================

function drawSentence() {

    const area = document.getElementById("sentence");

    area.innerHTML = "";

    sentence.forEach(function (block, index) {

        const div = document.createElement("div");

        div.className = "block";

        if (block.type === "text") {

            div.classList.add("textBlock");
            div.textContent = block.value + " (" + block.id + ")";

        } else {

            div.textContent = "[" + block.type + " #" + block.id + "]";

        }

        // Drag begins here
        div.addEventListener("pointerdown", function (event) {

            draggedBlockID = block.id;
            dragElement = div;
            isDragging = true;

            div.style.position = "fixed";
            div.style.zIndex = "1000";

            moveBlock(event);

        });

        area.appendChild(div);

    });

}


// =====================================================
// DRAGGING
// =====================================================

function moveBlock(event) {

    if (!isDragging) return;

    dragElement.style.left = (event.clientX - 40) + "px";
    dragElement.style.top = (event.clientY - 20) + "px";

}


// =====================================================
// SENTENCE EDITING
// =====================================================

function addTextBlock() {

    const value = prompt("Enter your text:");

    if (value === null) return;

    if (value.trim() === "") return;

    sentence.push({
    
        id: nextBlockID++,
    
        type: "text",
    
        value: value
    
    });

    drawSentence();

}


function addWordBlock(type) {

    sentence.push({
    
        id: nextBlockID++,
    
        type: type
    
    });

    drawSentence();

}


// =====================================================
// SENTENCE GENERATION
// =====================================================

function generateSentence() {

    let result = "";

    sentence.forEach(function (block) {

        switch (block.type) {

            case "text":
                result += block.value + " ";
                break;

            case "adjective":
                result += randomWord(adjectives) + " ";
                break;

            case "noun":
                result += randomWord(nouns) + " ";
                break;

            case "verb":
                result += randomWord(verbs) + " ";
                break;

        }

    });

    document.getElementById("output").textContent = result.trim();

}


// =====================================================
// EVENT LISTENERS
// =====================================================

const tools = document.querySelectorAll(".tool");

tools.forEach(function (tool) {

    tool.addEventListener("click", function () {

        const type = tool.dataset.type;

        if (type === "text") {

            addTextBlock();

        } else {

            addWordBlock(type);

        }

    });

});


document.getElementById("generateButton").addEventListener("click", function () {

    generateSentence();

});


document.addEventListener("pointermove", moveBlock);


document.addEventListener("pointerup", function () {

    if (!isDragging) return;

    isDragging = false;

    dragElement.style.position = "";
    dragElement.style.left = "";
    dragElement.style.top = "";
    dragElement.style.zIndex = "";

    drawSentence();

});


// =====================================================
// INITIALIZATION
// =====================================================

drawSentence();
