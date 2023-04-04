// Credit to https://stackoverflow.com/users/11854986/ken-lee for the below function
export function mixedWordsFunction(str: string): number {
  /// fix problem in special characters such as middle-dot, etc.
  str = str.replace(/[\u007F-\u00FE.,\/#!$%\^&*;:{}=\_`~()>\\]/g, " ");

  /// make a duplicate first...
  let str1 = str;
  let str2 = str;

  /// the following remove all chinese characters and then count the number of english characters in the string
  str1 = str1.replace(/[^!-~\d\s]+/gi, " ");

  /// the following remove all english characters and then count the number of chinese characters in the string
  str2 = str2.replace(/[!-~\d\s]+/gi, "");

  const matches1 = str1.match(/[\u00ff-\uffff]|\S+/g)?.filter((i) => i !== "-");
  const matches2 = str2.match(/[\u00ff-\uffff]|\S+/g);

  const count1 = matches1 ? matches1.length : 0;
  const count2 = matches2 ? matches2.length : 0;

  /// return the total of the mixture
  return count1 + count2;
}

// To force counting of Cyrillic characters as words, e.g. for Russian
export function simpleWordsFunction(str: string) {
  if (str.length > 0) {
    return str.split(" ").filter(function (n) {
      return n != "";
    }).length;
  }
}
