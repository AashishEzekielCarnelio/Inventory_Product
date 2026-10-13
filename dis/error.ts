function greet(name: string, age: number): string {
  return `Hello, ${name}! You are ${age} years old.`;
}

// ERROR 1: Assigning a string to a variable explicitly typed as number
const userAge: number = "twenty five";

// ERROR 2: Calling a function with the wrong number of arguments (1 instead of 2)
const message = greet("Ashish");
console.log(message);