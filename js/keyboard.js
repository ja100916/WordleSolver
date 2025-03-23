class Keyboard {
    constructor() {
      this.container = document.getElementById('keyboard-container');
      this.layout = [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace']
      ];
      this.keyStates = {}; // Stores the state of each key
      this.init();
    }
  
    init() {
      // Clear container
      this.container.innerHTML = '';
      
      // Create keyboard rows
      this.layout.forEach((row, rowIndex) => {
        const rowEl = document.createElement('div');
        rowEl.className = 'keyboard-row';
        
        // Create keys in row
        row.forEach(key => {
          const keyEl = document.createElement('div');
          
          if (key === 'backspace') {
            keyEl.className = 'keyboard-key wide';
            keyEl.innerHTML = '⌫';
            keyEl.addEventListener('click', () => this.handleBackspace());
          } else {
            keyEl.className = 'keyboard-key letter';
            keyEl.textContent = key;
            keyEl.addEventListener('click', () => this.handleKeyPress(key));
          }
          
          // Store reference to key element
          this.keyStates[key] = {
            element: keyEl,
            state: 'default' // default, correct, present, absent
          };
          
          rowEl.appendChild(keyEl);
        });
        
        this.container.appendChild(rowEl);
      });
  
      // Add keyboard event listener
      document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        
        if (key === 'backspace') {
          this.handleBackspace();
        } else if (/^[a-z]$/.test(key)) {
          this.handleKeyPress(key);
        }
      });
    }
  
    handleKeyPress(key) {
      const grid = window.grid;
      const { row, col } = grid.activeCell;
      
      if (col < grid.cols) {
        grid.setLetter(row, col, key);
        
        // Move to next cell if not at the end of the row
        if (col < grid.cols - 1) {
          grid.setActiveCell(row, col + 1);
        }
      }
    }
  
    handleBackspace() {
      const grid = window.grid;
      const { row, col } = grid.activeCell;
      
      // If current cell is empty and not the first cell, move back and clear that cell
      if (grid.cells[row][col].letter === '' && col > 0) {
        grid.setActiveCell(row, col - 1);
        grid.clearCell(row, col - 1);
      } else {
        // Clear current cell
        grid.clearCell(row, col);
      }
    }
  
    updateKeyState(letter, state) {
      if (!letter || !this.keyStates[letter]) return;
      
      const keyState = this.keyStates[letter];
      const element = keyState.element;
      
      // Remove existing state classes
      element.classList.remove('correct', 'present', 'absent');
      
      // Apply new state
      if (state === 'correct') {
        element.classList.add('correct');
        keyState.state = 'correct';
      } else if (state === 'present') {
        // Only update if current state is not 'correct'
        if (keyState.state !== 'correct') {
          element.classList.add('present');
          keyState.state = 'present';
        }
      } else if (state === 'absent') {
        // Only update if current state is not 'correct' or 'present'
        if (keyState.state !== 'correct' && keyState.state !== 'present') {
          element.classList.add('absent');
          keyState.state = 'absent';
        }
      }
    }
  
    getKeyStates() {
      const states = {};
      
      Object.keys(this.keyStates).forEach(key => {
        if (key !== 'backspace') {
          states[key] = this.keyStates[key].state;
        }
      });
      
      return states;
    }
  
    reset() {
      Object.keys(this.keyStates).forEach(key => {
        const keyState = this.keyStates[key];
        keyState.element.classList.remove('correct', 'present', 'absent');
        keyState.state = 'default';
      });
    }
  }