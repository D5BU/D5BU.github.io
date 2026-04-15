export async function bubbleSort(ctx) {
    let arr = ctx.array;
    let n = arr.length;
    
    ctx.explain("Starting Bubble Sort. The algorithm repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.");
    await ctx.waitStep();

    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        ctx.explain(`Pass ${i+1}: Moving the largest unsorted element to its correct position.`);
        await ctx.waitStep();

        for (let j = 0; j < n - i - 1; j++) {
            ctx.clearMarks([j-1, j, j+1]); // Clear previous immediate neighbors
            
            ctx.markComparing(j, j+1);
            ctx.explain(`Comparing elements at index ${j} [Value: ${arr[j]}] and index ${j+1} [Value: ${arr[j+1]}]`);
            await ctx.waitStep();
            
            if (arr[j] > arr[j+1]) {
                ctx.explain(`Value ${arr[j]} > ${arr[j+1]}. Swapping is required.`);
                ctx.markSwapping(j, j+1);
                await ctx.waitStep();
                
                ctx.swap(j, j+1);
                swapped = true;
                
                ctx.explain(`Swapped!`);
                await ctx.waitStep();
            } else {
                ctx.explain(`Values are in correct relative order. No swap.`);
                await ctx.waitStep();
            }
        }
        // Last element of this loop is now guaranteed sorted
        ctx.clearMarks();
        ctx.markSorted(n - i - 1);
        
        if (!swapped) {
            ctx.explain("No swaps occurred during this pass, meaning the array is completely sorted early!");
            await ctx.waitStep();
            break; // array is sorted
        }
    }
    
    // Mark everything else green
    for(let i=0; i<n; i++) ctx.markSorted(i);
    ctx.explain("Bubble Sort completed! Array is fully ordered.");
}
