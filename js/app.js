// Import CSS files so webpack can process them
import '/css/styles.css';
import '/css/grid.css';
import '/css/keyboard.css';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize components
  window.grid = new Grid();
  window.keyboard = new Keyboard();
  const solver = new WordleSolver();
  
  // DOM elements
  const messageDisplay = document.getElementById('message-display');
  const suggestionsList = document.getElementById('suggestions-list');
  const resetBtn = document.getElementById('reset-btn');
  const solveBtn = document.getElementById('solve-btn');
  
  // Event handlers
  resetBtn.addEventListener('click', () => {
    grid.reset();
    keyboard.reset();
    suggestionsList.innerHTML = '';
    messageDisplay.textContent = 'Enter your Wordle clues';
  });
  
  solveBtn.addEventListener('click', async () => {
    // Get current grid and keyboard state
    const gridState = grid.getGridState();
    const keyStates = keyboard.getKeyStates();
    
    // Check if word list is loaded
    if (solver.wordList.length === 0) {
      messageDisplay.textContent = 'Loading word list... Please try again in a moment.';
      return;
    }
    
    // Check if any clues are provided
    let hasClues = false;
    gridState.states.forEach(row => {
      row.forEach(state => {
        if (state !== 'empty') hasClues = true;
      });
    });
    
    if (!hasClues) {
      messageDisplay.textContent = 'Please enter some Wordle clues first!';
      return;
    }
    
    // Solve based on current constraints
    messageDisplay.textContent = 'Analyzing possibilities...';
    
    // Small delay to show loading message
    setTimeout(() => {
      try {
        const suggestions = solver.solve(gridState, keyStates);
        displaySuggestions(suggestions);
      } catch (error) {
        console.error('Error solving:', error);
        messageDisplay.textContent = 'Error analyzing. Please try again.';
      }
    }, 100);
  });
  
  function displaySuggestions(suggestions) {
    suggestionsList.innerHTML = '';
    
    if (suggestions.length === 0) {
      messageDisplay.textContent = 'No matching words found. Try adjusting your clues.';
      return;
    }
    
    messageDisplay.textContent = `Found ${suggestions.length} possible words`;
    
    // Display top 10 suggestions
    const topSuggestions = suggestions.slice(0, 10);
    
    topSuggestions.forEach(suggestion => {
      const li = document.createElement('li');
      
      const wordSpan = document.createElement('span');
      wordSpan.className = 'word';
      wordSpan.textContent = suggestion.word.toUpperCase();
      
      const probabilitySpan = document.createElement('span');
      probabilitySpan.className = 'probability';
      probabilitySpan.textContent = `${suggestion.probability.toFixed(1)}%`;
      
      li.appendChild(wordSpan);
      li.appendChild(probabilitySpan);
      suggestionsList.appendChild(li);
    });
  }
});