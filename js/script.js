const ownedPokemon = getOwnedPokemon();

const PAGE_SIZE = 50;

let pokemonList = [];
let loadedPokemon = {};
let displayedPokemon = 50;
let searchRequestId = 0;
let isLoadingMore = false;

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
    const progressFill = document.getElementById("progress-fill");

    const ownedCount = Object.keys(ownedPokemon).length;
    const percentage = ((ownedCount / 1025) * 100);

    counter.textContent = `Owned: ${ownedCount} / 1025 (${percentage.toFixed(2)}%)`;
    progressFill.style.width = `${percentage}%`;
}

function renderPokemonList(pokemonArray) {
    const container = document.getElementById("pokemon-container");

    container.innerHTML = "";

    pokemonArray.forEach(pokemon => {
        displayPokemon(pokemon);
    });
}

function appendPokemonList(pokemonArray) {
    pokemonArray.forEach(pokemon => {
        displayPokemon(pokemon);
    });
}

function getPokemonId(url) {
    const parts = url.split("/");
    return Number(parts[parts.length - 2]);
}

function displayInitialPokemon() {
    const pokemonToDisplay = pokemonList
        .slice(0, displayedPokemon)
        .map(pokemon => loadedPokemon[getPokemonId(pokemon.url)])
        .filter(pokemon => pokemon);

    renderPokemonList(pokemonToDisplay);
}

async function loadMorePokemon() {
    if (isLoadingMore || displayedPokemon >= pokemonList.length) {
        return;
    }

    isLoadingMore = true;

    const loadingMessage = document.getElementById("loading-message");

    const start = displayedPokemon + 1;
    const end = Math.min(
        displayedPokemon + PAGE_SIZE,
        pokemonList.length
    );

    loadingMessage.textContent =
        `Loading Pokémon... ${start}–${end} / ${pokemonList.length}`;

    loadingMessage.style.display = "block";

    try {
        loadingMessage.textContent = `Loading Pokémon... ${start}–${end} / ${pokemonList.length}`;
        loadingMessage.style.display = "block";

        const nextPokemon = pokemonList.slice(
            displayedPokemon,
            displayedPokemon + PAGE_SIZE
        );

        const pokemonDetails = await Promise.all(
            nextPokemon.map(pokemon => getPokemon(pokemon.url))
        );

        pokemonDetails.forEach(pokemon => {
            loadedPokemon[pokemon.id] = pokemon;
        });

        appendPokemonList(pokemonDetails);
        displayedPokemon += pokemonDetails.length;

    } finally {
    isLoadingMore = false;
    loadingMessage.style.display = "none";
    }
}

function exportCollection() {
    const data = JSON.stringify(ownedPokemon, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "owned_pokemon.json";
    link.click();

    URL.revokeObjectURL(url);
}

function displayPokemon(data) {
    const container = document.getElementById("pokemon-container");

    const card = document.createElement("div");
    card.classList.add("pokemon-card");

    const name = document.createElement("h2");
    name.textContent = formatPokemonName(data.name);

    const number = document.createElement("p");
    number.textContent = formatPokemonNumber(data.id);

    const typesContainer = document.createElement("div");
    typesContainer.classList.add("pokemon-types");
    data.types.forEach(type => {
        const typeBadge = document.createElement("span");
        typeBadge.textContent = formatPokemonName(type.type.name);
        typeBadge.classList.add("pokemon-type", `type-${type.type.name}`);
        typesContainer.appendChild(typeBadge);
    });

    const image = document.createElement("img");
    image.src = data.sprites.front_default;
    image.classList.add("pokemon-image");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = ownedPokemon[data.id] || false;

    const label = document.createElement("label");
    label.textContent = " Owned";
    
    const statusContainer = document.createElement("div");
    statusContainer.appendChild(checkbox);
    statusContainer.appendChild(label);

    card.appendChild(image);
    card.appendChild(name);
    card.appendChild(number);
    card.appendChild(typesContainer);
    card.appendChild(statusContainer);

    container.appendChild(card);

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

        pokemonList = data.results;
        await loadPokemonDetails();
    } catch (error) {
        console.error(error);
    }
}

async function loadPokemonDetails() {
    const pokemonToLoad = pokemonList.slice(0, PAGE_SIZE);

    const pokemonDetails = await Promise.all(
        pokemonToLoad.map(pokemon => getPokemon(pokemon.url))
    );

    pokemonDetails.forEach(pokemon => {
        loadedPokemon[pokemon.id] = pokemon;
    });

    displayInitialPokemon();
}

async function getPokemonById(id) {
    if (loadedPokemon[id]) {
        return loadedPokemon[id];
    }

    const pokemon = pokemonList.find(
        pokemon => getPokemonId(pokemon.url) === id
    );

    if (!pokemon) {
        return null;
    }

    const data = await getPokemon(pokemon.url);

    loadedPokemon[id] = data;

    return data;
}

async function filterPokemon() {
    const requestId = ++searchRequestId;

    const searchInput = document.getElementById("search-input").value.toLowerCase();
    const showOwnedOnly = document.getElementById("owned-filter").checked;

    const loadingMessage = document.getElementById("loading-message");
    if (searchInput !== "" || showOwnedOnly) {
        loadingMessage.textContent = "Loading Pokémon...";
        loadingMessage.style.display = "block";
    }    

    // No filters active
    if (searchInput === "" && !showOwnedOnly) {
        displayedPokemon = 50;

        const pokemonToDisplay = pokemonList
            .slice(0, displayedPokemon)
            .map(pokemon => loadedPokemon[getPokemonId(pokemon.url)])
            .filter(pokemon => pokemon);

        if (requestId !== searchRequestId) {
            return;
        }

        loadingMessage.style.display = "none";
        renderPokemonList(pokemonToDisplay);
        return;
    }

    let matchingPokemon;
    
    // Owned only
    if (showOwnedOnly) {
        const ownedIds = Object.keys(ownedPokemon);
        matchingPokemon = pokemonList.filter(pokemon => {
            const id = getPokemonId(pokemon.url);
            return ownedIds.includes(id.toString());
        });
    } else {
        // Search
        matchingPokemon = pokemonList.filter(pokemon => 
            pokemon.name.includes(searchInput)
        );
    }
    
    const filteredPokemon = [];

    for (const pokemon of matchingPokemon) {
        const id = getPokemonId(pokemon.url);

        const data = await getPokemonById(id);

        if (!data) {
            continue;
        }

        // If both filters are active
        if (
            showOwnedOnly &&
            searchInput !== "" &&
            !data.name.includes(searchInput)
        ) {
            continue;
        }

        filteredPokemon.push(data);
    }

    if (requestId !== searchRequestId) {
    return;
    }

    loadingMessage.style.display = "none";
    renderPokemonList(filteredPokemon);
}

const ownedFilter = document.getElementById("owned-filter");

ownedFilter.addEventListener("change", () => {
    filterPokemon();
});

const searchInput = document.getElementById("search-input");

searchInput.addEventListener("input", () => {
    filterPokemon();
});

const scrollTrigger = document.getElementById("scroll-trigger");

const observer = new IntersectionObserver(entries => {
    const searchInput = document.getElementById("search-input");
    const ownedFilter = document.getElementById("owned-filter");
    
    if (
        entries[0].isIntersecting &&
        searchInput.value === "" &&
        !ownedFilter.checked
    ) {
        loadMorePokemon();
    }
});

const exportButton = document.getElementById("export-button");
exportButton.addEventListener("click", exportCollection);

observer.observe(scrollTrigger);
updateOwnedCounter();
getPokemonList();