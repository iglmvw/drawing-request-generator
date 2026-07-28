const sentence = [];
function drawSentence(){

    const area = document.getElementById("sentence");

    area.innerHTML = "";

    sentence.forEach(function(block){

        const div = document.createElement("div");

        div.className = "block";

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
sentence.push({
    type:"text",
    value:"The"
});

sentence.push({
    type:"adjective"
});

sentence.push({
    type:"noun"
});

sentence.push({
    type:"text",
    value:"likes to"
});

sentence.push({
    type:"verb"
});

drawSentence();
