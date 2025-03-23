class Grid {
    constructor() {
      this.container = document.getElementById('grid-container');
      this.rows = 6;
      this.cols = 5;
      this.cells = [];
      this.activeCell = { row: 0, col: 0 };
      this.init();
    }
  
    init() {
      // Clear container
      this.container.innerHTML = '';
      this.cells = [];
  
      // Create grid cells
      for (let row = 0; row < this.rows; row++) {
        const rowEl = document.createElement('div');
        rowEl.className = 'grid-row';
        this.cells[row] = [];
  
        for (let col = 0; col < this.cols; col++) {
          const cell = document.createElement('div');
          cell.className = 'grid-cell';
          cell.dataset.row = row;
          cell.dataset.col = col;
          
          // Add click handler to toggle state
          cell.addEventListener('click', () => this.toggleCellState(row, col));
          
          rowEl.appendChild(cell);
          this.cells[row][col] = {
            element: cell,
            letter: '',
            state: 'empty' // empty, filled, correct, present, absent
          };
        }
  
        this.container.appendChild(rowEl);
      }
  
      // Set first cell as active
      this.setActiveCell(0, 0);
    }
  
    setActiveCell(row, col) {
      // Remove active class from current active cell
      if (this.activeCell) {
        const current = this.cells[this.activeCell.row][this.activeCell.col].element;
        current.classList.remove('active');
      }
  
      // Set new active cell
      this.activeCell = { row, col };
      this.cells[row][col].element.classList.add('active');
    }
  
    toggleCellState(row, col) {
      const cell = this.cells[row][col];
      
      // Cycle through states: empty -> filled -> correct -> present -> absent -> empty
      switch (cell.state) {
        case 'empty':
          cell.state = 'filled';
          cell.element.classList.add('filled');
          break;
        case 'filled':
          cell.state = 'correct';
          cell.element.classList.remove('filled');
          cell.element.classList.add('correct');
          break;
        case 'correct':
          cell.state = 'present';
          cell.element.classList.remove('correct');
          cell.element.classList.add('present');
          break;
        case 'present':
          cell.state = 'absent';
          cell.element.classList.remove('present');
          cell.element.classList.add('absent');
          break;
        case 'absent':
          cell.state = 'empty';
          cell.element.classList.remove('absent');
          break;
      }
  
      // Update keyboard state
      window.keyboard.updateKeyState(cell.letter, cell.state);
    }
  
    setLetter(row, col, letter) {
      const cell = this.cells[row][col];
      cell.letter = letter;
      cell.element.textContent = letter;
      
      if (cell.state === 'empty') {
        cell.state = 'filled';
        cell.element.classList.add('filled');
      }
    }
  
    clearCell(row, col) {
      const cell = this.cells[row][col];
      cell.letter = '';
      cell.state = 'empty';
      cell.element.textContent = '';
      cell.element.className = 'grid-cell';
    }
  
    getGridState() {
      const state = {
        letters: Array(this.rows).fill().map(() => Array(this.cols).fill('')),
        states: Array(this.rows).fill().map(() => Array(this.cols).fill('empty'))
      };
  
      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.cols; col++) {
          state.letters[row][col] = this.cells[row][col].letter;
          state.states[row][col] = this.cells[row][col].state;
        }
      }
  
      return state;
    }
  
    reset() {
      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.cols; col++) {
          this.clearCell(row, col);
        }
      }
      this.setActiveCell(0, 0);
    }
  }