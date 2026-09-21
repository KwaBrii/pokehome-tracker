function getPokemon(id) {
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("pokemon-container");

            const card = document.createElement("div");
            card.classList.add("pokemon-card");
            container.appendChild(card);

            const name = document.createElement("h2");
            name.textContent = data.name;
            card.appendChild(name);

            const number = document.createElement("p");
            number.textContent = `#${data.id}`;
            card.appendChild(number);

            const image = document.createElement("img");
            image.src = data.sprites.front_default;
            image.classList.add("pokemon-image");
            card.appendChild(image);
        });
}
for (let id = 1; id <= 10; id++) {
    getPokemon(id);
}