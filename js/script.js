function getPokemon(id) {
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch Pokemon #${id}`);
            }
            return response.json();
        })
        .then(data => {
            displayPokemon(data);
        })
        .catch(error => {
            console.error(error);
        });
}

function displayPokemon(data) {
    const container = document.getElementById("pokemon-container");

    const card = document.createElement("div");
    card.classList.add("pokemon-card");

    const name = document.createElement("h2");
    name.textContent = data.name;

    const number = document.createElement("p");
    number.textContent = `#${data.id}`;

    const image = document.createElement("img");
    image.src = data.sprites.front_default;
    image.classList.add("pokemon-image");

    card.appendChild(image);
    card.appendChild(name);
    card.appendChild(number);

    container.appendChild(card);
}

for (let id = 1; id <= 10; id++) {
    getPokemon(id);
}