export function provideStyles() {
  logseq.provideStyle(`
		.wordcount-toolbar {
			  font-family: "Courier New", monospace;
			  font-size: 13px;
			  padding: 0 5px;
			  border: 1px solid;
				border-radius: 8px;
		}
		`);

  logseq.provideStyle(`
    .wordcount-btn {
       border: 1px solid var(--ls-border-color);
       white-space: initial;
       padding: 2px 4px;
       border-radius: 4px;
       user-select: none;
       cursor: default;
       display: flex;
       align-content: center;
    }
    `);
}
