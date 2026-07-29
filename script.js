// =====================================================
// DATA
// =====================================================

const sentence = [];

let nextBlockID = 1;


// =====================================================
// DRAGGING STATE
// =====================================================

let draggedBlockID = null;

let dragGhost = null;

let isDragging = false;

let dropIndex = null;

let isOverDeleteZone = false;


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

    return list[
        Math.floor(Math.random() * list.length)
    ];

}


function getBlockIndex(id) {

    return sentence.findIndex(function(block) {

        return block.id === id;

    });

}


// =====================================================
// DRAWING
// =====================================================

function drawSentence() {

    const area =
        document.getElementById("sentence");

    area.innerHTML = "";


    // Draw indicator at the beginning

    if (dropIndex === 0 && isDragging) {

        createDropIndicator(area);

    }


    sentence.forEach(function(block, index) {

        const div =
            document.createElement("div");

        div.className = "block";


        // Text block

        if (block.type === "text") {

            div.classList.add("textBlock");

            div.textContent = block.value;

        }


        // Word block

        else {

            div.textContent =
                "[" + block.type + "]";

        }


        // Don't display the block being dragged

        // in its normal location.

        if (
            isDragging &&
            block.id === draggedBlockID
        ) {

            div.style.visibility = "hidden";

        }


        // Start dragging

        div.addEventListener(
            "pointerdown",
            function(event) {

                startDragging(
                    event,
                    block.id,
                    div
                );

            }
        );


        area.appendChild(div);


        // Draw insertion indicator

        if (
            isDragging &&
            dropIndex === index + 1
        ) {

            createDropIndicator(area);

        }

    });

}


function createDropIndicator(area) {

    const indicator =
        document.createElement("div");

    indicator.className =
        "dropIndicator";

    area.appendChild(indicator);

}


// =====================================================
// DRAGGING
// =====================================================

function startDragging(
    event,
    blockID,
    originalElement
) {

    event.preventDefault();


    draggedBlockID = blockID;

    isDragging = true;

    dropIndex = null;

    isOverDeleteZone = false;


    // Create the floating ghost

    dragGhost =
        originalElement.cloneNode(true);

    dragGhost.classList.add(
        "dragGhost"
    );


    document.body.appendChild(
        dragGhost
    );


    // Hide the original

    originalElement.style.visibility =
        "hidden";


    // Move the ghost immediately

    moveGhost(event);


    // Draw sentence with hidden original

    drawSentence();


    // Prevent browser scrolling while dragging

    document.body.style.userSelect =
        "none";

}


function moveGhost(event) {

    if (
        !isDragging ||
        !dragGhost
    ) {

        return;

    }


    dragGhost.style.left =
        (event.clientX - 40) + "px";

    dragGhost.style.top =
        (event.clientY - 20) + "px";


    updateDropLocation(event);

}


// =====================================================
// FIND DROP LOCATION
// =====================================================

function updateDropLocation(event) {

    if (!isDragging) {

        return;

    }


    const sentenceArea =
        document.getElementById(
            "sentence"
        );

    const deleteZone =
        document.getElementById(
            "deleteZone"
        );


    // ---------------------------------------------
    // Check whether we're over the delete zone
    // ---------------------------------------------

    const deleteRect =
        deleteZone.getBoundingClientRect();


    if (
        event.clientX >= deleteRect.left &&
        event.clientX <= deleteRect.right &&
        event.clientY >= deleteRect.top &&
        event.clientY <= deleteRect.bottom
    ) {

        isOverDeleteZone = true;

        deleteZone.classList.add(
            "deleteHover"
        );

        sentenceArea.classList.remove(
            "sentenceHover"
        );

        dropIndex = null;

        drawSentence();

        return;

    }


    // We're not over delete anymore

    isOverDeleteZone = false;

    deleteZone.classList.remove(
        "deleteHover"
    );


    // ---------------------------------------------
    // Check whether we're over the sentence
    // ---------------------------------------------

    const sentenceRect =
        sentenceArea.getBoundingClientRect();


    const overSentence =
        event.clientX >= sentenceRect.left &&
        event.clientX <= sentenceRect.right &&
        event.clientY >= sentenceRect.top &&
        event.clientY <= sentenceRect.bottom;


    if (!overSentence) {

        sentenceArea.classList.remove(
            "sentenceHover"
        );

        dropIndex = null;

        drawSentence();

        return;

    }


    sentenceArea.classList.add(
        "sentenceHover"
    );


    // ---------------------------------------------
    // Find closest insertion point
    // ---------------------------------------------

    const blocks =
        sentenceArea.querySelectorAll(
            ".block"
        );


    dropIndex = sentence.length;


    blocks.forEach(function(
        element,
        index
    ) {

        const blockID =
            sentence[index].id;


        // Don't consider the block we're dragging

        if (
            blockID === draggedBlockID
        ) {

            return;

        }


        const rect =
            element.getBoundingClientRect();


        const center =
            rect.left +
            rect.width / 2;


        if (
            event.clientX < center &&
            dropIndex === sentence.length
        ) {

            dropIndex = index;

        }

    });


    drawSentence();

}


// =====================================================
// FINISH DRAGGING
// =====================================================

function finishDragging() {

    if (!isDragging) {

        return;

    }


    const deleteZone =
        document.getElementById(
            "deleteZone"
        );


    const sentenceArea =
        document.getElementById(
            "sentence"
        );


    // ---------------------------------------------
    // DELETE
    // ---------------------------------------------

    if (isOverDeleteZone) {

        const index =
            getBlockIndex(
                draggedBlockID
            );


        if (index !== -1) {

            sentence.splice(
                index,
                1
            );

        }

    }


    // ---------------------------------------------
    // MOVE
    // ---------------------------------------------

    else if (dropIndex !== null) {

        const from =
            getBlockIndex(
                draggedBlockID
            );


        if (from !== -1) {

            const block =
                sentence.splice(
                    from,
                    1
                )[0];


            let to = dropIndex;


            // Removing the block changes
            // the indexes after it.

            if (from < to) {

                to--;

            }


            sentence.splice(
                to,
                0,
                block
            );

        }

    }


    // ---------------------------------------------
    // Clean up
    // ---------------------------------------------

    if (dragGhost) {

        dragGhost.remove();

    }


    dragGhost = null;

    draggedBlockID = null;

    isDragging = false;

    dropIndex = null;

    isOverDeleteZone = false;


    deleteZone.classList.remove(
        "deleteHover"
    );

    sentenceArea.classList.remove(
        "sentenceHover"
    );


    document.body.style.userSelect =
        "";


    drawSentence();

}


// =====================================================
// SENTENCE EDITING
// =====================================================

function addTextBlock() {

    const value =
        prompt("Enter your text:");


    if (value === null) {

        return;

    }


    if (value.trim() === "") {

        return;

    }


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
// CLEAR SENTENCE
// =====================================================

function clearSentence() {

    if (sentence.length === 0) {

        return;

    }


    const confirmed =
        confirm(
            "Are you sure you want to remove all blocks?"
        );


    if (!confirmed) {

        return;

    }


    sentence.length = 0;


    drawSentence();


    document.getElementById(
        "output"
    ).textContent = "";

}


// =====================================================
// SENTENCE GENERATION
// =====================================================

function generateSentence() {

    let result = "";


    sentence.forEach(function(block) {

        switch (block.type) {

            case "text":

                result +=
                    block.value + " ";

                break;


            case "adjective":

                result +=
                    randomWord(adjectives) +
                    " ";

                break;


            case "noun":

                result +=
                    randomWord(nouns) +
                    " ";

                break;


            case "verb":

                result +=
                    randomWord(verbs) +
                    " ";

                break;

        }

    });


    document.getElementById(
        "output"
    ).textContent =
        result.trim();

}


// =====================================================
// EVENT LISTENERS
// =====================================================

const tools =
    document.querySelectorAll(
        ".tool"
    );


tools.forEach(function(tool) {

    tool.addEventListener(
        "click",
        function() {

            const type =
                tool.dataset.type;


            if (type === "text") {

                addTextBlock();

            }

            else {

                addWordBlock(type);

            }

        }
    );

});


// Generate button

document
    .getElementById(
        "generateButton"
    )
    .addEventListener(
        "click",
        generateSentence
    );


// Clear button

document
    .getElementById(
        "clearButton"
    )
    .addEventListener(
        "click",
        clearSentence
    );


// Mouse / touch movement

document.addEventListener(
    "pointermove",
    function(event) {

        moveGhost(event);

    }
);


// Mouse / touch release

document.addEventListener(
    "pointerup",
    function() {

        finishDragging();

    }
);


// =====================================================
// INITIALIZATION
// =====================================================

drawSentence();
