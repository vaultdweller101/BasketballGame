// Score Display
const scoreDisplay = document.createElement('div');
scoreDisplay.style.position = 'absolute';
scoreDisplay.style.top = '20px';
scoreDisplay.style.left = '50%';
scoreDisplay.style.transform = 'translateX(-50%)';
scoreDisplay.style.fontSize = '24px';
scoreDisplay.style.color = 'white';
scoreDisplay.style.fontFamily = 'Arial, sans-serif';
scoreDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
scoreDisplay.style.padding = '10px 20px';
scoreDisplay.style.borderRadius = '10px';
scoreDisplay.innerHTML = 'Score: 0';
document.body.appendChild(scoreDisplay);

let score = 0; // Score counter
let score_percentage = 0; // Percentage counter
let shotGoesIn = 0;
let rating = 'Poor';

export function updateScore(scorePerShot, amountofBalls) {
    score += scorePerShot;
    shotGoesIn += 1;
    score_percentage = shotGoesIn/amountofBalls;
    if (score_percentage > 2/3){
        rating = 'Great!';
    }
    else if (score_percentage > 1/2){
        rating = 'Average';
    }
    else{
        rating = 'Poor';
    }
    scoreDisplay.innerHTML = `Score: ${score} Rating: ${rating}`;
}