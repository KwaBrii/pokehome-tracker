const ownedPokemon = getOwnedPokemon();
const BATCH_SIZE = 20;

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
        filterPokemon();
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

        pokemonList = [];

        const loadingMessage = document.getElementById("loading-message");

        for (let i = 0; i < data.results.length; i += BATCH_SIZE) {
            const batch = data.results.slice(i, i + BATCH_SIZE);
            const batchData = await Promise.all(
                batch.map(pokemon => getPokemon(pokemon.url))
            );

            pokemonList.push(...batchData);

            const loadedCount = pokemonList.length;
            loadingMessage.textContent = `Loading Pokémon... ${loadedCount} / ${data.results.length}`;
        }

        renderPokemonList(pokemonList);

    } catch (error) {
        console.error(error);
    }
}

function filterPokemon() {
    const searchInput = document.getElementById("search-input").value.toLowerCase();
    const showOwnedOnly = document.getElementById("owned-filter").checked;

    const filteredPokemon = pokemonList.filter(pokemon => {
        const matchesSearch = pokemon.name.includes(searchInput);
        const isOwned = ownedPokemon[pokemon.id] === true;

        if (showOwnedOnly) {
            return matchesSearch && isOwned;
        }

        return matchesSearch;
    });

    renderPokemonList(filteredPokemon);
}

const ownedFilter = document.getElementById("owned-filter");

ownedFilter.addEventListener("change", () => {
    filterPokemon();
});

const searchInput = document.getElementById("search-input");

searchInput.addEventListener("input", event => {
    filterPokemon();
});

getPokemonList();