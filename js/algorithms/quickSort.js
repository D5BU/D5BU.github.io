export async function quickSort(ctx) {
    let arr = ctx.array;
    let n = arr.length;

    ctx.explain("Starting Quick Sort. Quick Sort uses a divide-and-conquer strategy by picking a 'pivot' and partitioning the array so that smaller elements fall to the left, and larger elements fall to the right.");
    await ctx.waitStep();

    async function partition(low, high) {
        let pivotIndex = high;
        let pivotValue = arr[pivotIndex];
        let i = low - 1; // Index of smaller element

        ctx.markPivot(pivotIndex);
        ctx.explain(`Choosing pivot element ${pivotValue} at index ${pivotIndex}.`);
        await ctx.waitStep();

        ctx.explain(`Partitioning around pivot ${pivotValue} across indices ${low} to ${high-1}.`);
        await ctx.waitStep();

        for (let j = low; j < high; j++) {
            ctx.clearMarks([pivotIndex]); // don't clear pivot color
            for(let k=0; k<arr.length; k++) {
                // Ensure Sorted marks are retained
                if (k<low || k>high) {
                   // Keep out-of-bounds clear unless sorted
                }
            }

            ctx.markComparing(j);
            ctx.explain(`Comparing element ${arr[j]} against pivot ${pivotValue}.`);
            await ctx.waitStep();

            if (arr[j] < pivotValue) {
                i++;
                ctx.explain(`${arr[j]} is strictly less than pivot. Shifting boundary and swapping with element at index ${i}.`);
                
                if (i !== j) {
                    ctx.markSwapping(i, j);
                    await ctx.waitStep();
                    ctx.swap(i, j);
                    ctx.explain(`Swapped element ${arr[i]} and ${arr[j]}.`);
                    await ctx.waitStep();
                } else {
                    ctx.explain(`Element is already in its correct partition. Moving on.`);
                    await ctx.waitStep();
                }
            } else {
                ctx.explain(`${arr[j]} is strictly greater than pivot. It belongs on the correct side, moving on.`);
                await ctx.waitStep();
            }
        }

        ctx.clearMarks();
        ctx.markPivot(pivotIndex);
        ctx.explain(`Partitioning loop complete. Placing pivot ${pivotValue} in its absolutely correct sorted position at index ${i + 1}.`);
        await ctx.waitStep();

        ctx.markSwapping(i + 1, pivotIndex);
        await ctx.waitStep();
        ctx.swap(i + 1, pivotIndex);
        ctx.explain(`Pivot swapped.`);
        await ctx.waitStep();

        return i + 1;
    }

    async function sort(low, high) {
        if (low < high) {
            let pi = await partition(low, high);
            
            ctx.clearMarks();
            ctx.markSorted(pi);
            ctx.explain(`Pivot ${arr[pi]} is completely sorted. Now recursively branching out to sort left and right partitions.`);
            await ctx.waitStep();

            await sort(low, pi - 1);
            await sort(pi + 1, high);
        } else if (low === high) {
            ctx.markSorted(low);
        }
    }

    await sort(0, n - 1);
    
    // Safety check coloring
    for(let i=0; i<n; i++) ctx.markSorted(i);
    ctx.explain("Quick Sort fully completed! The entire array is sorted.");
}
