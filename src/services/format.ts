export function removeFormat(str: string) {
  return str.replace(/\nbackground-color:: (\w+)/g, "");
}