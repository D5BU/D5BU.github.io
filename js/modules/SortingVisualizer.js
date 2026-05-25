class SortingVisualizer {
    constructor(algoName) {
        this.algoName = algoName || 'Bubble Sort';
        this.array = [];
        this.size = 25;
        this.delay = 100;
        
        this.isRunning = false;
        this.isPaused = false;
        this.isStepRequest = false;
        this.isAborted = false;
        
        this.algorithms = {
            'Bubble Sort': window.bubbleSort,
            'Selection Sort': window.selectionSort,
            'Insertion Sort': window.insertionSort,
            'Merge Sort': window.mergeSort,
            'Quick Sort': window.quickSort,
            'Binary Search': window.binarySearch
        };
    }

    render() {
        return DOM.create(`
            <div class="module-section gap-lg">
                <div class="panel">
                    <div class="panel-header justify-between flex items-center" style="flex-wrap: wrap; gap: 1rem;">
                        <div class="flex items-center gap-md" style="flex-wrap: wrap;">
                            <h2 class="panel-title" id="visualizer-algo-title" style="margin-right: 12px;">Sorting Visualizer</h2>
                            <select id="select-algo" class="input-text" style="font-weight: bold; background: #0d0d0d; padding: 6px 12px; border: 1px solid var(--border-low-opacity); color: var(--text-primary); cursor: pointer; font-size: 11px; outline: none; border-radius: var(--radius-sm); font-family: 'Satoshi', sans-serif; text-transform: uppercase; letter-spacing: 0.05em;">
                                <option value="Bubble Sort" ${this.algoName === 'Bubble Sort' ? 'selected' : ''}>Bubble Sort</option>
                                <option value="Selection Sort" ${this.algoName === 'Selection Sort' ? 'selected' : ''}>Selection Sort</option>
                                <option value="Insertion Sort" ${this.algoName === 'Insertion Sort' ? 'selected' : ''}>Insertion Sort</option>
                                <option value="Merge Sort" ${this.algoName === 'Merge Sort' ? 'selected' : ''}>Merge Sort</option>
                                <option value="Quick Sort" ${this.algoName === 'Quick Sort' ? 'selected' : ''}>Quick Sort</option>
                                <option value="Binary Search" ${this.algoName === 'Binary Search' ? 'selected' : ''}>Binary Search</option>
                            </select>
                        </div>
                        
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
                            <input type="range" id="size-slider" class="range-slider" min="5" max="80" value="25">
                        </div>
                        
                        <div class="flex-col gap-sm" style="flex: 1; min-width: 200px;">
                            <label class="text-secondary" style="font-size: 0.85rem; text-transform: uppercase;">Animation Speed: <span id="speed-display" class="text-warning">Fast</span></label>
                            <input type="range" id="speed-slider" class="range-slider" min="10" max="500" value="100" style="transform: scaleX(-1);">
                        </div>

                        <div id="search-target-wrapper" class="flex-col gap-sm ${this.algoName.includes('Search') ? '' : 'hidden'}" style="flex: 1; min-width: 120px;">
                            <label class="text-secondary" style="font-size: 0.85rem; text-transform: uppercase;">Target Value</label>
                            <input type="number" id="search-target" class="input-text" value="50" style="padding: 10px; border: 1px solid var(--border-low-opacity); outline: none; border-radius: var(--radius-sm); font-weight: bold; background: #0d0d0d; color: var(--text-primary); max-width: 100px;">
                        </div>
                    </div>

                    <div id="visualizer-container" style="height: 300px; display: flex; align-items: flex-end; gap: 4px; background: #0d0d0d; padding: 1.5rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); overflow: hidden; position: relative;">
                        <!-- Bars injected dynamically -->
                    </div>
                </div>

                <div class="panel" style="background-color: #121212;">
                    <div class="panel-header" style="border-bottom: 1px solid var(--border-low-opacity); padding-bottom: 8px;"><h3 class="panel-title" style="font-size: 14px; letter-spacing: 0.05em; color: var(--accent-taupe);">Algorithm Explanation</h3></div>
                    <p id="explanation-text" class="text-secondary" style="font-size: 0.95rem; line-height: 1.6; min-height: 3rem; font-family: 'Satoshi', sans-serif; padding-top: 12px;">
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
        this.selectAlgo = DOM.get('#select-algo');
        this.searchTargetWrapper = DOM.get('#search-target-wrapper');

        this.generateArray();

        // Algorithm Selector Dropdown
        if (this.selectAlgo) {
            this.selectAlgo.addEventListener('change', (e) => {
                if (this.isRunning) return;
                this.algoName = e.target.value;

                // Show target input only for searches
                if (this.searchTargetWrapper) {
                    if (this.algoName.includes('Search')) {
                        this.searchTargetWrapper.classList.remove('hidden');
                    } else {
                        this.searchTargetWrapper.classList.add('hidden');
                    }
                }

                this.generateArray();
            });
        }

        // Size Slider
        this.sizeSlider.addEventListener('input', (e) => {
            if (this.isRunning) return;
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
            if (this.isRunning) return;
            
            this.isRunning = true;
            this.isAborted = false;
            this.isPaused = false;

            this.btnStart.classList.add('hidden');
            this.sizeSlider.disabled = true;
            if (this.selectAlgo) this.selectAlgo.disabled = true;
            this.btnPause.classList.remove('hidden');
            this.btnPause.textContent = 'Pause';
            this.btnStep.classList.add('hidden');

            try {
                const algoFunc = this.algorithms[this.algoName];
                if (algoFunc) {
                    await algoFunc(this);
                }
            } catch (err) {
                if(err.message !== 'Aborted') {
                    console.error("Algorithm error:", err);
                }
            } finally {
                this.isRunning = false;
                this.btnStart.classList.remove('hidden');
                this.btnPause.classList.add('hidden');
                this.btnStep.classList.add('hidden');
                this.sizeSlider.disabled = false;
                if (this.selectAlgo) this.selectAlgo.disabled = false;
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
                this.isStepRequest = true;
            }
        });

        this.btnReset.addEventListener('click', () => {
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

    generateArray() {
        this.array = Array.from({length: this.size}, () => Math.floor(Math.random() * 85) + 10);
        this.drawArray();
        this.explain("New array generated. Adjust parameters, then press start.");
    }

    drawArray() {
        this.container.innerHTML = '';
        this.array.forEach((val, idx) => {
            const bar = document.createElement('div');
            bar.style.height = `${val}%`;
            bar.style.flex = '1';
            
            // Premium design: translucent base with solid glowing top border
            bar.style.backgroundColor = 'rgba(183, 171, 152, 0.15)'; // Translucent Taupe
            bar.style.borderTop = '2px solid var(--accent-taupe)';
            bar.style.transition = 'height 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease, border-color 0.15s ease';
            bar.style.borderRadius = '2px 2px 0 0';
            bar.id = `sv-bar-${idx}`;
            this.container.appendChild(bar);
        });
    }

    async waitStep() {
        if (this.isAborted) throw new Error('Aborted');
        
        await new Promise(r => setTimeout(r, this.delay));
        
        while (this.isPaused) {
            if (this.isAborted) throw new Error('Aborted');
            if (this.isStepRequest) {
                this.isStepRequest = false;
                break;
            }
            await new Promise(r => requestAnimationFrame(r));
        }
    }

    explain(message) {
        DOM.setText(this.explText, message);
    }

    getBar(index) {
        return DOM.get(`#sv-bar-${index}`);
    }

    markComparing(...indices) {
        indices.forEach(idx => {
            const bar = this.getBar(idx);
            if (bar) {
                bar.style.backgroundColor = 'rgba(235, 89, 57, 0.2)'; // Coral opacity
                bar.style.borderTopColor = 'var(--accent-coral)';
                bar.style.filter = 'drop-shadow(0 0 4px rgba(235, 89, 57, 0.3))';
            }
        });
    }

    markSwapping(...indices) {
        indices.forEach(idx => {
            const bar = this.getBar(idx);
            if (bar) {
                bar.style.backgroundColor = 'rgba(235, 89, 57, 0.4)'; // Deeper Coral opacity
                bar.style.borderTopColor = 'var(--accent-coral)';
                bar.style.filter = 'drop-shadow(0 0 8px rgba(235, 89, 57, 0.6))';
            }
        });
    }

    markSorted(index) {
        const bar = this.getBar(index);
        if (bar) {
            bar.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'; // Translucent White
            bar.style.borderTopColor = '#ffffff'; // White glowing border
            bar.style.filter = 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.4))';
        }
    }

    markPivot(...indices) {
        indices.forEach(idx => {
            const bar = this.getBar(idx);
            if (bar) {
                bar.style.backgroundColor = 'rgba(197, 163, 198, 0.3)';
                bar.style.borderTopColor = 'var(--text-purple)';
                bar.style.filter = 'drop-shadow(0 0 6px rgba(197, 163, 198, 0.4))';
            }
        });
    }

    markSearchActive(...indices) {
        indices.forEach(idx => {
            const bar = this.getBar(idx);
            if (bar) {
                bar.style.backgroundColor = 'rgba(143, 184, 197, 0.3)';
                bar.style.borderTopColor = 'var(--text-info)';
                bar.style.filter = 'drop-shadow(0 0 6px rgba(143, 184, 197, 0.4))';
            }
        });
    }

    clearMarks(indicesToClear = null) {
        if (indicesToClear) {
            indicesToClear.forEach(idx => {
                const bar = this.getBar(idx);
                if (bar && bar.style.borderTopColor !== 'rgb(255, 255, 255)') { // don't clear white (sorted)
                    bar.style.backgroundColor = 'rgba(183, 171, 152, 0.15)';
                    bar.style.borderTopColor = 'var(--accent-taupe)';
                    bar.style.filter = 'none';
                }
            });
        } else {
            for (let i = 0; i < this.size; i++) {
                const bar = this.getBar(i);
                if (bar && bar.style.borderTopColor !== 'rgb(255, 255, 255)') {
                    bar.style.backgroundColor = 'rgba(183, 171, 152, 0.15)';
                    bar.style.borderTopColor = 'var(--accent-taupe)';
                    bar.style.filter = 'none';
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
window.SortingVisualizer = SortingVisualizer;
