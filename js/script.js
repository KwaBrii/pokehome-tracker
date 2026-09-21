fetch("https://pokeapi.co/api/v2/pokemon/1")
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