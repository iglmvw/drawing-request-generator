// =====================================================
// DATA
// =====================================================

const sentence = [];

let nextBlockID = 1;


// =====================================================
// DRAGGING STATE
// =====================================================

let draggedBlockID = null;

let draggedToolType = null;

let dragSource = null;

let dragGhost = null;

let isDragging = false;

let dropIndex = null;

let isOverDeleteZone = false;


// =====================================================
// DICTIONARY
// =====================================================

let dictionary = {};

async function loadDictionary() {

    const response =
        await fetch("words/dictionary.json");

    dictionary =
        await response.json();

}

function createDictionaryTools() {

    const container =
        document.getElementById(
            "dictionaryTools"
        );


    container.innerHTML = "";


    Object.keys(dictionary).forEach(
        function(category) {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "tool";


            button.dataset.type =
                category;


            button.textContent =
                category;


            container.appendChild(
                button
            );


            setupToolButton(button);

        }
    );

}

function loadCustomCategory(file) {

    return new Promise(function(resolve, reject) {

        const reader =
            new FileReader();


        reader.onload =
            function(event) {

                const text =
                    event.target.result;


                const words =
                    text
                        .split(/\r?\n/)
                        .map(function(word) {

                            return word.trim();

                        })
                        .filter(function(word) {

                            return word.length > 0;

                        });


                resolve(words);

            };


        reader.onerror =
            function() {

                reject(
                    new Error(
                        "Could not read file."
                    )
                );

            };


        reader.readAsText(file);

    });

}

function getCategoryName(file) {

    return file.name
        .replace(/\.txt$/i, "")
        .trim();

}

async function addCustomCategory(file) {

    const category =
        getCategoryName(file);


    if (!category) {

        return;

    }


    const words =
        await loadCustomCategory(file);


    if (words.length === 0) {

        alert(
            "This file does not contain any words."
        );

        return;

    }


    dictionary[category] =
        words;


    createDictionaryTools();

}

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

function setupToolButton(tool) {

    // =============================================
    // Click
    // =============================================

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


    // =============================================
    // Drag
    // =============================================

    tool.addEventListener(
        "pointerdown",
        function(event) {

            startToolDragging(
                event,
                tool.dataset.type,
                tool
            );

        }
    );

}

// =====================================================
// DRAWING
// =====================================================

function drawSentence() {

    const area =
        document.getElementById("sentence");

    area.innerHTML = "";


    sentence.forEach(function(block) {

        const div =
            document.createElement("div");

        div.className = "block";


        if (block.type === "text") {

            div.classList.add("textBlock");

            div.textContent = block.value;

        }

        else {

            div.textContent =
                "[" + block.type + "]";

        }


        div.dataset.blockId =
            block.id;


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

    });


    createDropIndicator();

}


function createDropIndicator() {

    const oldIndicator =
        document.querySelector(
            ".dropIndicator"
        );


    if (oldIndicator) {

        oldIndicator.remove();

    }


    const indicator =
        document.createElement("div");

    indicator.className =
        "dropIndicator";

    indicator.style.display =
        "none";


    document
        .getElementById("sentence")
        .appendChild(indicator);

}

function moveDropIndicator(index) {

    const indicator =
        document.querySelector(
            ".dropIndicator"
        );


    if (!indicator) {

        return;

    }


    const area =
        document.getElementById(
            "sentence"
        );


    const blocks =
        area.querySelectorAll(
            ".block"
        );


    indicator.style.display =
        "inline-block";


    if (index >= blocks.length) {

        area.appendChild(indicator);

    }

    else {

        area.insertBefore(
            indicator,
            blocks[index]
        );

    }

}

function hideDropIndicator() {

    const indicator =
        document.querySelector(
            ".dropIndicator"
        );


    if (indicator) {

        indicator.style.display =
            "none";

    }

}

// =====================================================
// DRAGGING
// =====================================================

function startToolDragging(event, type, originalElement) {

    event.preventDefault();

    draggedToolType = type;

    dragSource = "toolbox";

    isDragging = true;

    dropIndex = null;

    isOverDeleteZone = false;


    // Create ghost

    dragGhost =
        originalElement.cloneNode(true);

    dragGhost.classList.add(
        "dragGhost"
    );

    document.body.appendChild(
        dragGhost
    );


    // Move ghost

    moveGhost(event);


    // Prevent selecting text

    document.body.style.userSelect =
        "none";

}


function startDragging(
    event,
    blockID,
    originalElement
) {

    event.preventDefault();


    draggedBlockID = blockID;

    dragSource = "sentence";
    
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


    // =============================================
    // Check DELETE zone
    // =============================================

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

        hideDropIndicator();

        return;

    }


    // =============================================
    // We're no longer over DELETE
    // =============================================

    isOverDeleteZone = false;

    deleteZone.classList.remove(
        "deleteHover"
    );


    // =============================================
    // Check SENTENCE area
    // =============================================

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

        hideDropIndicator();

        dropIndex = null;

        return;

    }


    sentenceArea.classList.add(
        "sentenceHover"
    );


    // =============================================
    // Find insertion point
    // =============================================

    const blocks =
        sentenceArea.querySelectorAll(
            ".block"
        );


    let newDropIndex =
        blocks.length;


    for (
        let i = 0;
        i < blocks.length;
        i++
    ) {

        const block =
            blocks[i];


        const blockID =
            Number(block.dataset.blockId);


        // Don't use the block being dragged

        if (
            dragSource === "sentence" &&
            blockID === draggedBlockID
        ) {
        
            continue;
        
        }


        const rect =
            block.getBoundingClientRect();


        const center =
            rect.left +
            rect.width / 2;


        if (
            event.clientX < center
        ) {

            newDropIndex = i;

            break;

        }

    }


    dropIndex =
        newDropIndex;


    moveDropIndicator(
        dropIndex
    );

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


    // =============================================
    // DELETE
    // =============================================

    if (
        dragSource === "sentence" &&
        isOverDeleteZone
    ) {

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


    // =============================================
    // DROP TOOLBOX BLOCK
    // =============================================

    else if (
        dragSource === "toolbox" &&
        dropIndex !== null
    ) {

        let newBlock;


        // -----------------------------------------
        // Text block
        // -----------------------------------------

        if (
            draggedToolType === "text"
        ) {

            const value =
                prompt(
                    "Enter your text:"
                );


            if (
                value !== null &&
                value.trim() !== ""
            ) {

                newBlock = {

                    id: nextBlockID++,

                    type: "text",

                    value: value

                };

            }

        }


        // -----------------------------------------
        // Word block
        // -----------------------------------------

        else {

            newBlock = {

                id: nextBlockID++,

                type: draggedToolType

            };

        }


        // -----------------------------------------
        // Insert new block
        // -----------------------------------------

        if (newBlock) {

            sentence.splice(
                dropIndex,
                0,
                newBlock
            );

        }

    }


    // =============================================
    // MOVE EXISTING SENTENCE BLOCK
    // =============================================

    else if (
        dragSource === "sentence" &&
        dropIndex !== null
    ) {

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


    // =============================================
    // CLEAN UP
    // =============================================

    if (dragGhost) {

        dragGhost.remove();

    }


    dragGhost = null;

    draggedBlockID = null;

    draggedToolType = null;

    dragSource = null;

    isDragging = false;

    dropIndex = null;

    isOverDeleteZone = false;


    deleteZone.classList.remove(
        "deleteHover"
    );

    sentenceArea.classList.remove(
        "sentenceHover"
    );


    hideDropIndicator();


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

        // =========================================
        // Normal text
        // =========================================

        if (block.type === "text") {

            result +=
                block.value + " ";

            return;

        }


        // =========================================
        // Dictionary category
        // =========================================

        if (
            dictionary[block.type]
        ) {

            result +=
                randomWord(
                    dictionary[block.type]
                ) + " ";

            return;

        }

    });


    document.getElementById(
        "output"
    ).textContent =
        result.trim();

}

function createSurpriseSentence() {

    const available =
        Object.keys(dictionary);


    if (available.length === 0) {

        return;

    }


    sentence.length = 0;


    const patterns = [

        [
            "Adjective",
            "Noun",
            "Verb"
        ],

        [
            "Pronoun",
            "Verb",
            "Noun"
        ],

        [
            "Adjective",
            "Noun",
            "Verb",
            "Adverb"
        ],

        [
            "Noun",
            "Verb",
            "Preposition",
            "Noun"
        ],

        [
            "Adjective",
            "Noun",
            "Past Tense",
            "Noun"
        ],

        [
            "Pronoun",
            "Verb",
            "Adverb"
        ],

        [
            "Interjection",
            "Adjective",
            "Noun",
            "Verb"
        ]

    ];


    // Pick a random pattern

    let pattern =
        patterns[
            Math.floor(
                Math.random() *
                patterns.length
            )
        ];


    // Only use categories that
    // actually exist in the dictionary.

    pattern =
        pattern.filter(
            function(category) {

                return available.includes(
                    category
                );

            }
        );


    // Convert the pattern
    // into sentence blocks.

    pattern.forEach(
        function(category) {

            sentence.push({

                type: category

            });

        }
    );


    drawSentence();

    generateSentence();

}

function trySurpriseVideo() {

    const chance =
        Math.floor(
            Math.random() * 10
        );


    if (chance !== 0) {

        return;

    }


    const video =
        document.getElementById(
            "surpriseVideo"
        );


    video.hidden = false;

    video.currentTime = 0;

    video.play();

}

// =====================================================
// EVENT LISTENERS
// =====================================================


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

const customCategoryButton =
    document.getElementById(
        "customCategoryButton"
    );


const customCategoryFile =
    document.getElementById(
        "customCategoryFile"
    );


customCategoryButton.addEventListener(
    "click",
    function() {

        customCategoryFile.click();

    }
);


customCategoryFile.addEventListener(
    "change",
    async function() {

        const files =
            Array.from(
                customCategoryFile.files
            );


        for (const file of files) {

            await addCustomCategory(
                file
            );

        }


        // Allow selecting the same
        // file again later.

        customCategoryFile.value = "";

    }
);

const surpriseButton =
    document.getElementById(
        "surpriseButton"
    );


surpriseButton.addEventListener(
    "click",
    function() {

        createSurpriseSentence();

        trySurpriseVideo();

    }
);

// =====================================================
// INITIALIZATION
// =====================================================

async function initialize() {

    await loadDictionary();

    createDictionaryTools();

    setupToolButton(
        document.querySelector(
            '[data-type="text"]'
        )
    );

    drawSentence();

}

initialize();
