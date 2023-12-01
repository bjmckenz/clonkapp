
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number[]}
 */
var topKFrequent = function(nums, k) {
    count_for = {};
    // sorted by (decreasing) count
    tops = []

    const topify = function(num) {

        // console.log("topify           : " + num);
        // console.log("top count for num: " + count_for[num]);
        // console.log("tops      : " + tops.join(", "));
        // console.log("top counts: " + tops.map(x => count_for[x]).join(", "));

        count_for_num = count_for[num];

        // case: list is empty
        if (tops.length == 0) {
            tops.push(num);
            return;
        }

        // case: in list, may need to be promoted
        if (num === tops[0]) {
            return;
        }
        found_it = false;
        for (ix = tops.length-1; ix > 0; ix--) {
            if (tops[ix] === num) {
                found_it = true;
                // console.log("found at " + ix);
                if (ix == 0) {
                    break;
                }
                if (count_for_num < count_for[tops[ix - 1]]) {
                    // console.log("no promotion");
                    break;
                }
                // console.log("promoting above " + tops[ix - 1]);
                tops[ix] = tops[ix - 1];
                tops[ix - 1] = num;
            }
        }
        if (found_it) {
            return;
        }

        // case: not in list, shouldn't be in list
        if (count_for[num] < count_for[tops[tops.length - 1]]) {
            if (tops.length == k) {
                // console.log("too small, and list is full")
                return;
            }
            // console.log("too small, not in list, but list is not full")
            tops.push(num);
            return;
        }

        // case: not in list, should be in list
        if (count_for_num == count_for[tops[tops.length - 1]]) {
            // console.log("just right")
            tops.push(num);
            return;
        }

        // console.log("got through list. error")
    }

    const add = function(num) {
        if (count_for[num] === undefined) {
            count_for[num] = 1;
        } else {
            count_for[num] += 1;
        }
    };


    nums.forEach(function(num) {
        add(num)
        topify(num)
    });
    return tops.slice(0, k)
};

// kofn <k> <max> <array size>

k = process.argv[2];
maxval = process.argv[3];
array_size = process.argv[4];

console.log("k: " + k);
console.log("maxval: " + maxval);
console.log("array_size: " + array_size);

var candidates = [];
for (var i = 0; i < array_size; i++) {
    candidates.push(Math.floor(Math.random() * maxval));
}
console.log("nums: "+candidates.join(", "));
console.log("top k: "+topKFrequent(candidates, k).join(", "));

