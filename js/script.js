function getPokemon(id) {
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("pokemon-container");

            container.textContent = data.name;

            const number = document.createElement("p");
            number.textContent = `#${data.id}`;
            container.appendChild(number);

            const image = document.createElement("img");
            image.src = data.sprites.front_default;
            container.appendChild(image);
        });
}
for (let id = 1; id <= 10; id++) {
    getPokemon(id);
}