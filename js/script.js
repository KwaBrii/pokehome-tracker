async function getPokemon(url) {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error("Failed to fetch Pokemon");
        }

        const data = await response.json();
            
        displayPokemon(data);
    } catch (error) {
        console.error(error);
    };
}

function formatPokemonName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
}

function formatPokemonNumber(id) {
    return `#${String(id).padStart(4, "0")}`;
}

function displayPokemon(data) {
    const container = document.getElementById("pokemon-container");

    const card = document.createElement("div");
    card.classList.add("pokemon-card");

    const name = document.createElement("h2");
    name.textContent = formatPokemonName(data.name);

    const number = document.createElement("p");
    number.textContent = formatPokemonNumber(data.id);

    const image = document.createElement("img");
    image.src = data.sprites.front_default;
    image.classList.add("pokemon-image");

    card.appendChild(image);
    card.appendChild(name);
    card.appendChild(number);

    container.appendChild(card);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    const label = document.createElement("label");
    label.textContent = " Owned";

    const statusContainer = document.createElement("div");
    statusContainer.appendChild(checkbox);
    statusContainer.appendChild(label);

    card.appendChild(statusContainer);

    checkbox.addEventListener("change", () => {
        console.log(data.name, checkbox.checked);
    });
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