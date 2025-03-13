const rimHitSound = new Audio('sounds/BasketballHitRim.mp3'); // Make sure the file exists in the correct path
rimHitSound.loop = true;
rimHitSound.volume = 0.7; // Adjust volume (0.0 to 1.0)

const ambientSound = new Audio('sounds/ambientNoise.mp3'); // Replace with your actual sound file
ambientSound.loop = true; // Make it loop continuously
ambientSound.volume = 0.5; // Adjust volume (0.0 to 1.0)

const scoreSound = new Audio('sounds/goodresult.mp3'); // Replace with your actual sound file
scoreSound.volume = 0.7; // Adjust volume (0.0 to 1.0)

export function playRimHitSound() {
    console.log("Rim hit sound played");
    rimHitSound.currentTime = 0;
    rimHitSound.play().catch(error => console.log("Audio play failed:", error));
}

export function playAmbientSound() {
    console.log("Ambient sound played");
    ambientSound.play().catch(error => console.log("Audio play failed:", error));
}

export function playCongratulationSound() {
    console.log("Congratulation sound played");
    scoreSound.currentTime = 0;
    scoreSound.play().catch(error => console.log("Audio play failed:", error));
}