export default function remove(list: string[], value: string): string[] {
  return list.filter((item) => item !== value); // returns ["apple",
}