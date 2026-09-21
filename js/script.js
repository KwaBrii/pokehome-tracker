function getPokemon(url) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch Pokemon");
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

function getPokemonList() {
    fetch("https://pokeapi.co/api/v2/pokemon?limit=1025")
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch Pokemon list");
            }

            return response.json();
        })
        .then(data => {
            const firstPokemon = data.results.slice(0, 10);

            firstPokemon.forEach(pokemon => {
                getPokemon(pokemon.url);
            });
        })
        .catch(error => {
            console.error(error);
        });
}

getPokemonList();