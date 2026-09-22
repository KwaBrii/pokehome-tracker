const ownedPokemon = getOwnedPokemon();

let pokemonList = [];

document.addEventListener("DOMContentLoaded", () => {
    updateOwnedCounter();
});

function getOwnedPokemon() {
    const savedData = localStorage.getItem("ownedPokemon");

    if (!savedData) {
        return {};
    }

    return JSON.parse(savedData);
}

function saveOwnedPokemon(ownedPokemon) {
    localStorage.setItem(
        "ownedPokemon",
        JSON.stringify(ownedPokemon)
    );
}

async function getPokemon(url) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Failed to fetch Pokemon");
        }

        return await response.json();

    } catch (error) {
        console.error(error);
    }
}

function formatPokemonName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
}

function formatPokemonNumber(id) {
    return `#${String(id).padStart(4, "0")}`;
}

function updateOwnedCounter() {
    const counter = document.getElementById("owned-counter");
    const ownedCount = Object.keys(ownedPokemon).length;
    counter.textContent = `Owned: ${ownedCount} / 1025`;
}

function renderPokemonList(pokemonArray) {
    const container = document.getElementById("pokemon-container");

    container.innerHTML = "";

    pokemonArray.forEach(pokemon => {
        displayPokemon(pokemon);
    });
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
    checkbox.checked = ownedPokemon[data.id] || false;

    const label = document.createElement("label");
    label.textContent = " Owned";

    const statusContainer = document.createElement("div");
    statusContainer.appendChild(checkbox);
    statusContainer.appendChild(label);

    card.appendChild(statusContainer);

    checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
            ownedPokemon[data.id] = true;
        } else {
            delete ownedPokemon[data.id];
        }
        saveOwnedPokemon(ownedPokemon);
        updateOwnedCounter();
    });
}

async function getPokemonList() {
    try {
        const response = await fetch(
            "https://pokeapi.co/api/v2/pokemon?limit=1025"
        );

        if (!response.ok) {
            throw new Error("Failed to fetch Pokemon list");
        }

        const data = await response.json();

        const container = document.getElementById("pokemon-container");
        container.innerHTML = "";

        const firstPokemon = data.results.slice(0, 10);

        const pokemonData = await Promise.all(
            firstPokemon.map(pokemon => getPokemon(pokemon.url))
        );

        pokemonList = pokemonData;

        renderPokemonList(pokemonData);

    } catch (error) {
        console.error(error);
    }
}

function searchPokemon(searchTerm) {

    const filteredPokemon = pokemonList.filter(pokemon =>
        pokemon.name.includes(searchTerm.toLowerCase())
    );

    renderPokemonList(filteredPokemon);

}

const searchInput = document.getElementById("search-input");

searchInput.addEventListener("input", event => {
    searchPokemon(event.target.value);
});

getPokemonList();