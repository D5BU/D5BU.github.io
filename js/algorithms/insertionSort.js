export async function insertionSort(ctx) {
    let arr = ctx.array;
    let n = arr.length;

    ctx.explain("Starting Insertion Sort. The array is virtually split into a sorted and an unsorted part. Values from the unsorted part are picked and placed at the correct position in the sorted part.");
    await ctx.waitStep();

    ctx.markSorted(0);
    ctx.explain("The first element is trivially sorted within itself.");
    await ctx.waitStep();

    for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i - 1;

        ctx.markComparing(i);
        ctx.explain(`Picking element ${key} at index ${i} to insert into the sorted portion.`);
        await ctx.waitStep();

        ctx.clearMarks();

        while (j >= 0 && arr[j] > key) {
            ctx.markSwapping(j, j+1);
            ctx.explain(`${arr[j]} is strictly greater than our key ${key}. Shifting it one position to the right.`);
            await ctx.waitStep();

            // Perform shift functionally on the DOM
            ctx.updateHeight(j+1, arr[j]);
            ctx.explain(`Shifted.`);
            await ctx.waitStep();
            
            ctx.clearMarks(); 
            j = j - 1;
        }

        ctx.markSwapping(j+1);
        ctx.explain(`Found the correct spot. Inserting key ${key} at index ${j+1}.`);
        await ctx.waitStep();

        ctx.updateHeight(j+1, key);
        
        ctx.clearMarks();
        for(let k=0; k<=i; k++) {
            ctx.markSorted(k);
        }
        ctx.explain(`Element inserted. Subarray from 0 to ${i} is now sorted.`);
        await ctx.waitStep();
    }
    
    ctx.explain("Insertion Sort completed! Array is fully ordered.");
}
