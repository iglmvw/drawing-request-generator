console.log("Website Loaded");
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

const button = document.getElementById("generateButton");

button.addEventListener("click", function () {

    const adjective =
        adjectives[Math.floor(Math.random() * adjectives.length)];

    const noun =
        nouns[Math.floor(Math.random() * nouns.length)];

    const verb =
        verbs[Math.floor(Math.random() * verbs.length)];

    document.getElementById("output").textContent =
        `The ${adjective} ${noun} likes to ${verb}.`;

});
