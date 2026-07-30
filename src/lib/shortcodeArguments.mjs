export function splitShortcodeArguments(source) {
  const values = [];
  let current = '';
  let escaped = false;

  const input = source.slice(2);
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (escaped) {
      current += character;
      escaped = false;
    } else if (character === '\\') {
      escaped = true;
    } else if (character === ':' && input[index + 1] === ':') {
      values.push(current);
      current = '';
      index += 1;
    } else {
      current += character;
    }
  }

  if (escaped) current += '\\';
  values.push(current);
  return values.map((value) => value.trim());
}
