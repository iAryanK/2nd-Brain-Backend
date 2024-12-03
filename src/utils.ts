export function random(len: number) {
  const options =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let ans = "";
  for (let i = 0; i < len; i++) {
    ans += options[Math.floor(Math.random() * options.length)];
  }
}
