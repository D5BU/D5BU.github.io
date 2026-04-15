export async function mergeSort(ctx) {
    let arr = ctx.array;
    let n = arr.length;

    ctx.explain("Starting Merge Sort. The array will be recursively divided into halves until each subarray has only one element. Then, the subarrays will be merged back together in sorted order.");
    await ctx.waitStep();

    async function merge(left, mid, right) {
        let n1 = mid - left + 1;
        let n2 = right - mid;

        let L = new Array(n1);
        let R = new Array(n2);

        for (let i = 0; i < n1; i++) L[i] = arr[left + i];
        for (let j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];

        ctx.explain(`Merging subarrays from index ${left} to ${mid} and ${mid+1} to ${right}.`);
        await ctx.waitStep();

        let i = 0, j = 0, k = left;

        while (i < n1 && j < n2) {
            ctx.markComparing(left + i, mid + 1 + j);
            ctx.explain(`Comparing ${L[i]} from left subarray with ${R[j]} from right subarray.`);
            await ctx.waitStep();

            if (L[i] <= R[j]) {
                ctx.markSwapping(k);
                arr[k] = L[i];
                ctx.updateHeight(k, arr[k]);
                ctx.explain(`${L[i]} is smaller (or equal). Placing into merged array at index ${k}.`);
                i++;
            } else {
                ctx.markSwapping(k);
                arr[k] = R[j];
                ctx.updateHeight(k, arr[k]);
                ctx.explain(`${R[j]} is smaller. Placing into merged array at index ${k}.`);
                j++;
            }
            await ctx.waitStep();
            ctx.clearMarks([k, left+i, mid+1+j]);
            k++;
        }

        while (i < n1) {
            ctx.markSwapping(k);
            arr[k] = L[i];
            ctx.updateHeight(k, arr[k]);
            ctx.explain(`Copying remaining element ${L[i]} from left subarray to index ${k}.`);
            await ctx.waitStep();
            ctx.clearMarks([k]);
            i++; k++;
        }

        while (j < n2) {
            ctx.markSwapping(k);
            arr[k] = R[j];
            ctx.updateHeight(k, arr[k]);
            ctx.explain(`Copying remaining element ${R[j]} from right subarray to index ${k}.`);
            await ctx.waitStep();
            ctx.clearMarks([k]);
            j++; k++;
        }
        
        ctx.clearMarks();
        for(let z=left; z<=right; z++) {
            ctx.markSorted(z); // mark chunk sorted
        }
        ctx.explain(`Merged subarray [${left} to ${right}] is now sorted locally.`);
        await ctx.waitStep();
        
        // Remove sorted mark so parent merge can accurately color them again
        // unless it's the final merge phase.
        if (left !== 0 || right !== n - 1) {
             for(let z=left; z<=right; z++) ctx.clearMarks([z]);
        }
    }

    async function sort(left, right) {
        if (left >= right) return;

        let mid = left + Math.floor((right - left) / 2);
        
        ctx.explain(`Splitting array into halves: [${left} to ${mid}] and [${mid+1} to ${right}].`);
        await ctx.waitStep();

        await sort(left, mid);
        await sort(mid + 1, right);
        await merge(left, mid, right);
    }

    await sort(0, n - 1);

    for(let i=0; i<n; i++) ctx.markSorted(i);
    ctx.explain("Merge Sort fully completed! The array is sorted.");
}
