export async function binarySearch(ctx) {
    let arr = ctx.array;
    let n = arr.length;
    
    // Sort silently
    arr.sort((a, b) => a - b);
    for(let i=0; i<n; i++) ctx.updateHeight(i, arr[i]);
    
    let targetInput = document.getElementById('search-target');
    let target = targetInput ? parseInt(targetInput.value) : 50;
    if (isNaN(target)) target = 50;

    ctx.explain(`Binary Search requires a strictly sorted array. Sorting complete. Searching for user target: ${target}.`);
    await ctx.waitStep();

    let low = 0;
    let high = n - 1;

    while (low <= high) {
        // Highlight active entire search bounds
        ctx.clearMarks();
        for(let i=low; i<=high; i++) {
            ctx.markSearchActive(i);
        }
        
        ctx.explain(`Current active search bounds are from index ${low} [Value: ${arr[low]}] to ${high} [Value: ${arr[high]}].`);
        await ctx.waitStep();

        let mid = Math.floor(low + (high - low) / 2);
        
        ctx.markPivot(mid);
        ctx.explain(`Checking middle element at index ${mid}. Value is ${arr[mid]}.`);
        await ctx.waitStep();

        if (arr[mid] === target) {
            ctx.clearMarks();
            ctx.markSorted(mid);
            ctx.explain(`Target ${target} found successfully at precise index ${mid}. Elements searched via binary splitting: ` + Math.ceil(Math.log2(n)) + ` max.`);
            await ctx.waitStep();
            return;
        }

        if (arr[mid] < target) {
            ctx.explain(`Target ${target} is strictly greater than middle element ${arr[mid]}. Discarding the left half and adjusting lower bound to ${mid + 1}.`);
            low = mid + 1;
            await ctx.waitStep();
        } else {
            ctx.explain(`Target ${target} is strictly smaller than middle element ${arr[mid]}. Discarding the right half and adjusting upper bound to ${mid - 1}.`);
            high = mid - 1;
            await ctx.waitStep();
        }
    }

    ctx.explain("Target not found exactly. Search completed.");
}
