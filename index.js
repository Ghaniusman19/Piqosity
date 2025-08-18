// function greet(name) {
//   console.log("Hello", name);
// }
// greet("usman ghani");

// const ali = () => {
//   let name = "ali";
//   console.log(name);
// };

// ali();

// const sentence = "Muhammad Usman Ghani ";
// const words = sentence.split(" ");
// words.map((w) => (console.log(w)))
// console.log(words);

const arr2 = [1, 2, [3, 4, [5, 6]]];
console.log(arr2.flat(3)); // Output: [1, 2, 3, 4, 5, 6]
