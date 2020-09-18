function createHeart(message) {
    const heart = document.createElement("div");
    heart.classList.add("heart");

    heart.style.left = Math.random() * 80 + "vw";
    heart.style.animationDuration = Math.random() * 2 + 3 + "s";

    heart.innerHTML = "💙";
    
    heart.innerHTML += `<p>${message.author.displayName}</p> <br><em>Amén!<em>`
    document.body.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 5000);
}

setInterval(createHeart, 300);