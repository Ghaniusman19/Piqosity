//Simple conditional Loop
const array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
for (let i = 0; i < array.length; i++) {
  console.log(array[i]);
}
//For in Loop
const array1 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
for (const key in array1) {
  console.log(array[key] + " " + "rendered by for in loop");
}
//For Of Loop
const array2 = [1, 2, 3, 4, 5, 6, 7, 8, 9];

for (const element of array2) {
  console.log(element + " " + "rendered by for of loop");
}

const char = "helo";
for (const element of char) {
  console.log(element);
}
