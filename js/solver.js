class WordleSolver {
    constructor() {
      this.wordList = [];
      this.loadWordList();
    }
  
    async loadWordList() {
      try {
        const response = await fetch('./data/combined_wordlist.txt');
        const text = await response.text();
        // Split the text file by newlines and filter out any empty strings
        this.wordList = text.split('\n').map(word => word.trim().toLowerCase()).filter(word => word);
        console.log(`Loaded ${this.wordList.length} words`);
      } catch (error) {
        console.error('Error loading word list:', error);
        this.wordList = []; // Set to empty array on error
      }
    }
  
    solve(gridState, keyStates) {
      // Extract constraints from grid state
      const constraints = this.extractConstraints(gridState, keyStates);
      
      // Filter words that match all constraints
      const matchingWords = this.filterWords(constraints);
      
      // Calculate probability scores
      return this.calculateScores(matchingWords);
    }
  
    extractConstraints(gridState, keyStates) {
      const constraints = {
        correctPositions: {}, // E.g. {0: 'a', 3: 't'}
        presentLetters: {}, // E.g. {'a': [1, 2]} (positions where a is NOT)
        absentLetters: new Set(), // Letters confirmed to not be in the word
      };
  
      // Process grid state
      for (let row = 0; row < gridState.letters.length; row++) {
        for (let col = 0; col < gridState.letters[row].length; col++) {
          const letter = gridState.letters[row][col].toLowerCase();
          const state = gridState.states[row][col];
          
          if (!letter) continue; // Skip empty cells
          
          if (state === 'correct') {
            constraints.correctPositions[col] = letter;
          } else if (state === 'present') {
            if (!constraints.presentLetters[letter]) {
              constraints.presentLetters[letter] = [];
            }
            constraints.presentLetters[letter].push(col);
          } else if (state === 'absent') {
            // Only mark as absent if it's not already known to be in the word
            if (!Object.values(constraints.correctPositions).includes(letter) && 
                !Object.keys(constraints.presentLetters).includes(letter)) {
              constraints.absentLetters.add(letter);
            }
          }
        }
      }
  
      // Process keyboard state for any additional absent letters
      Object.keys(keyStates).forEach(letter => {
        if (keyStates[letter] === 'absent') {
          // Only mark as absent if it's not already known to be in the word
          if (!Object.values(constraints.correctPositions).includes(letter) && 
              !Object.keys(constraints.presentLetters).includes(letter)) {
            constraints.absentLetters.add(letter);
          }
        }
      });
  
      return constraints;
    }
  
    filterWords(constraints) {
      // For large wordlists, we'll optimize the filtering
      return this.wordList.filter(word => {
        // Word length check - only keep 5 letter words for Wordle
        if (word.length !== 5) return false;
        
        // Check correct positions
        for (const [pos, letter] of Object.entries(constraints.correctPositions)) {
          if (word[pos] !== letter) {
            return false;
          }
        }
        
        // Check present letters
        for (const [letter, positions] of Object.entries(constraints.presentLetters)) {
          // Letter must be in the word
          if (!word.includes(letter)) {
            return false;
          }
          
          // Letter must not be in these positions
          for (const pos of positions) {
            if (word[pos] === letter) {
              return false;
            }
          }
        }
        
        // Check absent letters
        for (const letter of constraints.absentLetters) {
          // Word should not contain absent letters
          // UNLESS that letter appears elsewhere in a correct position
          // (this handles duplicate letters where one instance is absent)
          if (word.includes(letter)) {
            let isInCorrectPosition = false;
            
            for (const [pos, correctLetter] of Object.entries(constraints.correctPositions)) {
              if (correctLetter === letter && word[pos] === letter) {
                isInCorrectPosition = true;
                break;
              }
            }
            
            if (!isInCorrectPosition) {
              return false;
            }
          }
        }
        
        return true;
      });
    }
  
    calculateScores(matchingWords) {
      // If no words match, return empty array
      if (matchingWords.length === 0) {
        return [];
      }
      
      // Limit to top 1000 words for performance if we have a very large match list
      let wordsToScore = matchingWords;
      if (matchingWords.length > 1000) {
        console.log(`Limiting scoring to first 1000 of ${matchingWords.length} matching words`);
        wordsToScore = matchingWords.slice(0, 1000);
      }
      
      // Calculate letter frequency for all positions
      const totalWords = wordsToScore.length;
      const frequencies = {};
      
      // Initialize frequency counters
      wordsToScore.forEach(word => {
        for (let i = 0; i < word.length; i++) {
          const letter = word[i];
          if (!frequencies[i]) {
            frequencies[i] = {};
          }
          if (!frequencies[i][letter]) {
            frequencies[i][letter] = 0;
          }
          frequencies[i][letter]++;
        }
      });
      
      // Calculate score for each word based on position frequencies
      const scores = wordsToScore.map(word => {
        let score = 0;
        // Add position-based score
        for (let i = 0; i < word.length; i++) {
          const letter = word[i];
          score += frequencies[i][letter] / totalWords;
        }
        
        // Penalize for duplicate letters
        const uniqueLetters = new Set(word.split('')).size;
        const duplicatePenalty = 1 - (uniqueLetters / word.length);
        score = score * (1 - (duplicatePenalty * 0.2)); // 20% weight to duplicate penalty
        
        return {
          word,
          probability: (score / word.length) * 100
        };
      });
      
      // Sort by probability descending
      return scores.sort((a, b) => b.probability - a.probability);
    }
  }