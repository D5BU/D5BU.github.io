export async function selectionSort(ctx) {
    let arr = ctx.array;
    let n = arr.length;
    
    ctx.explain("Starting Selection Sort. The algorithm divides the array into a sorted and an unsorted region. It repeatedly selects the smallest element from the unsorted region and swaps it with the first unsorted element.");
    await ctx.waitStep();

    for (let i = 0; i < n; i++) {
        let minIdx = i;
        ctx.explain(`Pass ${i+1}: Finding the minimum element in the remaining unsorted array (indices ${i} to ${n-1}).`);
        await ctx.waitStep();

        for (let j = i + 1; j < n; j++) {
            ctx.clearMarks(); 
            ctx.markComparing(minIdx, j);
            ctx.explain(`Comparing current minimum ${arr[minIdx]} with ${arr[j]}.`);
            await ctx.waitStep();

            if (arr[j] < arr[minIdx]) {
                ctx.explain(`Found a smaller element! Updating minimum to ${arr[j]} at index ${j}.`);
                minIdx = j;
                await ctx.waitStep();
            }
        }
        
        ctx.clearMarks();
        if (minIdx !== i) {
            ctx.markSwapping(i, minIdx);
            ctx.explain(`Minimum element ${arr[minIdx]} found. Swapping it with the first unsorted element ${arr[i]}.`);
            await ctx.waitStep();
            
            ctx.swap(i, minIdx);
            ctx.explain(`Swapped.`);
            await ctx.waitStep();
        } else {
            ctx.explain(`The first unsorted element is already the minimum. No swap needed.`);
            await ctx.waitStep();
        }
        
        ctx.clearMarks();
        ctx.markSorted(i);
        ctx.explain(`Element at index ${i} is now sorted.`);
        await ctx.waitStep();
    }
    
    ctx.explain("Selection Sort completed! Array is fully ordered.");
}
