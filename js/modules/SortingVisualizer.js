import { DOM } from '../core/dom.js';

// Import algorithms dynamically or statically
import { bubbleSort } from '../algorithms/bubbleSort.js';
import { selectionSort } from '../algorithms/selectionSort.js';
import { insertionSort } from '../algorithms/insertionSort.js';
import { mergeSort } from '../algorithms/mergeSort.js';
import { quickSort } from '../algorithms/quickSort.js';
import { binarySearch } from '../algorithms/binarySearch.js';

export default class SortingVisualizer {
    constructor(algoName) {
        this.algoName = algoName;
        this.array = [];
        this.size = 25;
        this.delay = 100;
        
        this.isRunning = false;
        this.isPaused = false;
        this.isStepRequest = false;
        this.isAborted = false;
        
        this.algorithms = {
            'Bubble Sort': bubbleSort,
            'Selection Sort': selectionSort,
            'Insertion Sort': insertionSort,
            'Merge Sort': mergeSort,
            'Quick Sort': quickSort,
            'Binary Search': binarySearch
        };
    }

    render() {
        return DOM.create(`
            <div class="module-section gap-lg">
                <div class="panel">
                    <div class="panel-header justify-between flex items-center" style="flex-wrap: wrap; gap: 1rem;">
                        <h2 class="panel-title">${this.algoName}</h2>
                        
                        <div class="flex gap-sm">
                            <button id="btn-reset" class="btn btn-secondary">Reset Array</button>
                            <button id="btn-start" class="btn btn-primary">Start Execution</button>
                            <button id="btn-pause" class="btn btn-secondary hidden">Pause</button>
                            <button id="btn-step" class="btn btn-secondary hidden">Next Step</button>
                        </div>
                    </div>
                    
                    <div class="flex gap-lg items-center mt-sm" style="margin-bottom: 2rem; flex-wrap: wrap;">
                        <div class="flex-col gap-sm" style="flex: 1; min-width: 200px;">
                            <label class="text-secondary" style="font-size: 0.85rem; text-transform: uppercase;">Array Size: <span id="size-display" class="text-primary">25</span></label>
                            <input type="range" id="size-slider" class="range-slider" min="5" max="100" value="25">
                        </div>
                        
                        
                        <div class="flex-col gap-sm" style="flex: 1; min-width: 200px;">
                            <label class="text-secondary" style="font-size: 0.85rem; text-transform: uppercase;">Animation Speed: <span id="speed-display" class="text-warning">Fast</span></label>
                            <input type="range" id="speed-slider" class="range-slider" min="10" max="500" value="100" style="transform: scaleX(-1);">
                        </div>

                        ${this.algoName.includes('Search') ? `
                        <div class="flex-col gap-sm" style="flex: 1; min-width: 120px;">
                            <label class="text-secondary" style="font-size: 0.85rem; text-transform: uppercase;">Target Value</label>
                            <input type="number" id="search-target" class="input-field" value="50" style="padding: 0.4rem; border: none; outline: none; border-radius: var(--radius-sm); font-weight: bold; background: rgba(0,0,0,0.5); color: var(--text-primary); max-width: 100px;">
                        </div>
                        ` : ''}
                    </div>

                    <div id="visualizer-container" style="height: 350px; display: flex; align-items: flex-end; gap: 2px; background: rgba(0,0,0,0.5); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); overflow: hidden;">
                        <!-- Bars injected dynamically -->
                    </div>
                </div>

                <div class="panel">
                    <div class="panel-header"><h3 class="panel-title">Algorithm Explanation</h3></div>
                    <p id="explanation-text" class="text-secondary" style="font-size: 1.1rem; line-height: 1.6; min-height: 3rem;">
                        Waiting to start...
                    </p>
                </div>
            </div>
        `);
    }

    init() {
        this.container = DOM.get('#visualizer-container');
        this.btnStart = DOM.get('#btn-start');
        this.btnPause = DOM.get('#btn-pause');
        this.btnStep = DOM.get('#btn-step');
        this.btnReset = DOM.get('#btn-reset');
        
        this.sizeSlider = DOM.get('#size-slider');
        this.sizeDisplay = DOM.get('#size-display');
        this.speedSlider = DOM.get('#speed-slider');
        this.speedDisplay = DOM.get('#speed-display');
        
        this.explText = DOM.get('#explanation-text');

        this.generateArray();

        // Size Slider
        this.sizeSlider.addEventListener('input', (e) => {
            if (this.isRunning) return; // Prevent resizing while running
            this.size = parseInt(e.target.value);
            this.sizeDisplay.textContent = this.size;
            this.generateArray();
        });

        // Speed Slider
        this.speedSlider.addEventListener('input', (e) => {
            this.delay = parseInt(e.target.value);
            if(this.delay < 50) this.speedDisplay.textContent = 'Turbo';
            else if(this.delay < 200) this.speedDisplay.textContent = 'Fast';
            else this.speedDisplay.textContent = 'Slow / Educational';
        });

        // Playback Buttons
        this.btnStart.addEventListener('click', async () => {
            if (this.isRunning) return; // Already running
            
            // UI Toggle
            this.isRunning = true;
            this.isAborted = false;
            this.isPaused = false;

            this.btnStart.classList.add('hidden');
            this.sizeSlider.disabled = true;
            this.btnPause.classList.remove('hidden');
            this.btnPause.textContent = 'Pause';
            this.btnStep.classList.add('hidden');

            try {
                // Execute active algorithm
                const algoFunc = this.algorithms[this.algoName];
                if (algoFunc) {
                    await algoFunc(this);
                }
            } catch (err) {
                if(err.message !== 'Aborted') {
                    console.error("Algorithm error:", err);
                }
            } finally {
                // UI Cleanup
                this.isRunning = false;
                this.btnStart.classList.remove('hidden');
                this.btnPause.classList.add('hidden');
                this.btnStep.classList.add('hidden');
                this.sizeSlider.disabled = false;
            }
        });

        this.btnPause.addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            if (this.isPaused) {
                this.btnPause.textContent = 'Resume';
                this.btnPause.classList.replace('btn-secondary', 'btn-primary');
                this.btnStep.classList.remove('hidden');
            } else {
                this.btnPause.textContent = 'Pause';
                this.btnPause.classList.replace('btn-primary', 'btn-secondary');
                this.btnStep.classList.add('hidden');
            }
        });

        this.btnStep.addEventListener('click', () => {
            if (this.isPaused) {
                this.isStepRequest = true; // allow 1 frame tick
            }
        });

        this.btnReset.addEventListener('click', () => {
            // Abort running routines
            if (this.isRunning) {
                this.isAborted = true;
            }
            this.isPaused = false;
            this.generateArray();
            this.btnPause.textContent = 'Pause';
            this.btnPause.classList.replace('btn-primary', 'btn-secondary');
            this.explain("Array reset manually. Ready to start.");
        });
    }

    // Generator Methods for Visuals
    generateArray() {
        this.array = Array.from({length: this.size}, () => Math.floor(Math.random() * 95) + 5);
        this.drawArray();
        this.explain("New array generated. Adjust speed and size above, then press start.");
    }

    drawArray() {
        this.container.innerHTML = '';
        this.array.forEach((val, idx) => {
            const bar = document.createElement('div');
            bar.style.height = `${val}%`;
            bar.style.flex = '1';
            bar.style.backgroundColor = 'var(--text-primary)';
            bar.style.transition = 'height 0.15s ease, background-color 0.1s ease';
            bar.style.borderRadius = '3px 3px 0 0';
            bar.id = `sv-bar-${idx}`;
            this.container.appendChild(bar);
        });
    }

    // Engine Core Utilities passed to Algorithms
    async waitStep() {
        if (this.isAborted) throw new Error('Aborted');
        
        await new Promise(r => setTimeout(r, this.delay));
        
        // Handle Pausing & Manual Stepping
        while (this.isPaused) {
            if (this.isAborted) throw new Error('Aborted');
            if (this.isStepRequest) {
                this.isStepRequest = false;
                break;
            }
            // non thread-blocking wait
            await new Promise(r => requestAnimationFrame(r));
        }
    }

    explain(message) {
        DOM.setText(this.explText, message);
    }

    // Visual State Management
    getBar(index) {
        return DOM.get(`#sv-bar-${index}`);
    }

    markComparing(...indices) {
        indices.forEach(idx => {
            const bar = this.getBar(idx);
            if (bar) {
                bar.style.backgroundColor = 'var(--text-warning)'; // Yellow
                bar.style.boxShadow = '0 0 10px var(--text-warning)';
            }
        });
    }

    markSwapping(...indices) {
        indices.forEach(idx => {
            const bar = this.getBar(idx);
            if (bar) {
                bar.style.backgroundColor = 'var(--text-danger)'; // Red
                bar.style.boxShadow = '0 0 10px var(--text-danger)';
            }
        });
    }

    markSorted(index) {
        const bar = this.getBar(index);
        if (bar) {
            bar.style.backgroundColor = 'var(--text-success)'; // Green
            bar.style.boxShadow = 'none';
        }
    }

    markPivot(...indices) {
        indices.forEach(idx => {
            const bar = this.getBar(idx);
            if (bar) {
                bar.style.backgroundColor = 'var(--text-purple)';
                bar.style.boxShadow = '0 0 10px var(--text-purple)';
            }
        });
    }

    markSearchActive(...indices) {
        indices.forEach(idx => {
            const bar = this.getBar(idx);
            if (bar) {
                bar.style.backgroundColor = 'var(--text-info)';
                bar.style.boxShadow = '0 0 10px var(--text-info)';
            }
        });
    }

    clearMarks(indicesToClear = null) {
        if (indicesToClear) {
            indicesToClear.forEach(idx => {
                const bar = this.getBar(idx);
                // Don't overwrite green (success)
                if (bar && bar.style.backgroundColor !== 'var(--text-success)') {
                    bar.style.backgroundColor = 'var(--text-primary)';
                    bar.style.boxShadow = 'none';
                }
            });
        } else {
            // Clear all non-sorted
            for (let i = 0; i < this.size; i++) {
                const bar = this.getBar(i);
                if (bar && bar.style.backgroundColor !== 'var(--text-success)') {
                    bar.style.backgroundColor = 'var(--text-primary)';
                    bar.style.boxShadow = 'none';
                }
            }
        }
    }

    swap(i, j) {
        let temp = this.array[i];
        this.array[i] = this.array[j];
        this.array[j] = temp;
        
        const bar1 = this.getBar(i);
        const bar2 = this.getBar(j);
        if (bar1 && bar2) {
            bar1.style.height = `${this.array[i]}%`;
            bar2.style.height = `${this.array[j]}%`;
        }
    }
    
    updateHeight(index, val) {
        this.array[index] = val;
        const bar = this.getBar(index);
        if (bar) {
            bar.style.height = `${val}%`;
        }
    }
}
