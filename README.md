![GitHub all releases](https://img.shields.io/github/downloads/hkgnp/logseq-wordcount-plugin/total)

> v1.4 now allows the counting to be done on the homepage too!

## Demo

<img width="80%" src="screenshots/wordcount.gif" />

## Usage

| command | autocompletes to | what it does |
| :- | :- | :- |
| `/wordcount` | `{{renderer :wordcount_RANDOM-ID}}` | count the number of **words** below this parent block |
| `/wordcount char` | `{{renderer :wordcountchar_RANDOM-ID}}` | count the number of **characters** below this parent block |

- It supports an unlimited number of nested blocks.
- You can use more than 1 word counter in a single page. Just prefix the blocks you'd like to count with another `/wordcount`.
- It also supports counting sentences that have both English and Chinese/ Japanese words. E.g. `敏捷的棕色狐狸跳过了懒狗 is a funny phrase` returns 16 words.

Happy counting!

## Styling the Wordcount button

You can style the wordcount button using the class `.wordcount-btn`. Simply add it into your `custom.css`.

Example:

```css
.wordcount-btn {
    border-color: red;
    font-size: 2em;
}
```

## Installation

**Option 1:** Install from the Logseq marketplace.

**Option 2:** Clone the repository, then run `npm i && npm run build` and manually load the plugin in Logseq.

**Option 3:** Download the [latest release](https://github.com/hkgnp/logseq-wordcount-plugin/releases) and after extracting the zip file, manually load the plugin in Logseq.

## Help

Please look for me on Discord or open an issue if you have any feedback!

## Credits

[pengx17](https://github.com/pengx17) for his suggestions and [Ken Lee](https://stackoverflow.com/users/11854986/ken-lee) for his word counting algorithm.
