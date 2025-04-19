class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData["Title"]); // TODO: replace this text using this.engine.storyData to find the story title
        this.engine.addChoice("Begin the story");
    }

    handleChoice() {
        this.engine.gotoScene(Location, this.engine.storyData["InitialLocation"]); // TODO: replace this text by the initial location of the story
    }
}

class Location extends Scene {
    create(key) {
        let locationData = this.engine.storyData["Locations"]; // TODO: use `key` to get the data object for the current story location
        this.engine.show(locationData[key]["Body"]); // TODO: replace this text by the Body of the location data
        
        if(locationData[key]["Choices"].length > 0) { // TODO: check if the location has any Choices
            for(let choice of locationData[key]["Choices"]) { // TODO: loop over the location's Choices
                this.engine.addChoice(choice["Text"], choice); // TODO: use the Text of the choice
                // TODO: add a useful second argument to addChoice so that the current code of handleChoice below works
            }
        } else {
            this.engine.addChoice("The end.")
        }

        if (key === "bucket") {
            let button = document.createElement("button");
            button.innerText = "Mystery Bucket Button";
            button.onclick = () => {
                const randomString = Array.from({ length: 10 }, () =>
                    String.fromCharCode(97 + Math.floor(Math.random() * 26))
                ).join('');
                this.engine.show(`<i>${randomString}</i>`);
            };
            this.engine.actionsContainer.appendChild(button);
        }
        if (key === "Kitchen") {
            let button = document.createElement("button");
            button.innerText = "secret button";
            button.onclick = () => {
                this.engine.secretDoorOpened = true;
                this.engine.show(`<b>You opened a secret door in the living room!</b>`);
                this.update();
            };
            this.engine.actionsContainer.appendChild(button);
        }
        if (this.engine.secretDoorOpened && key === "Living Room") {
            this.engine.addChoice("Enter the secret passage", { Text: "Enter the secret passage", Target: "SecretRoom" });
        }
        if (key === "duck") {
            let button = document.createElement("button");
            button.innerText = "Teleport to a Random Room";
            button.onclick = () => {
                while (this.engine.actionsContainer.firstChild) {
                    this.engine.actionsContainer.removeChild(this.engine.actionsContainer.firstChild);
                }
                const locationKeys = Object.keys(this.engine.storyData["Locations"])
                    .filter(loc => loc !== "Restroom");
                const randomLocation = locationKeys[Math.floor(Math.random() * locationKeys.length)];
                this.engine.show(`<i>Teleporting to ${randomLocation}...</i>`);
                this.engine.gotoScene(Location, randomLocation);
            };
            this.engine.actionsContainer.appendChild(button);
        }
    }

    handleChoice(choice) {
        if(choice) {
            this.engine.show("&gt; "+choice.Text);
            this.engine.gotoScene(Location, choice.Target);
        } else {
            this.engine.gotoScene(End);
        }
    }
}

class End extends Scene {
    create() {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}

Engine.load(Start, 'myStory.json');

/*

class Button extends Scene {
    create(key) {
        let locationData = this.engine.storyData["Locations"][key];
        this.engine.show(locationData["Body"]);
        this.engine.addChoice("Press the button");
    }
    handleChoice(choice) {
        const target = "Main Room";
        const newDoorChoice = {
            Text: "Go through the newly opened door",
            Target: "SecretRoom"
        };

        const choices = this.engine.storyData["Locations"][target]["Choices"];
        if (!choices.some(c => c.Text === newDoorChoice.Text)) {
            choices.push(newDoorChoice);
        }

        this.engine.show("Something opened in another room.");
        this.engine.addChoice("Return", { Text: "Return", Target: "bucket" });
    }
}

*/