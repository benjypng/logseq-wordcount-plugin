export function provideStyles() {
  logseq.provideStyle(`
		.wordcount-toolbar {
			  font-family: "Courier New", monospace;
			  font-size: 13px;
			  padding: 0 5px;
			  border: 1px solid;
				border-radius: 8px;
				vertical-align: middle;
		}
		`);

  logseq.provideStyle(`
		.wordcount-btn {
		  appearance: none;
		  background-color: #FAFBFC;
		  border: 1px solid rgba(27, 31, 35, 0.15);
		  border-radius: 6px;
		  box-shadow: rgba(27, 31, 35, 0.04) 0 1px 0, rgba(255, 255, 255, 0.25) 0 1px 0 inset;
		  box-sizing: border-box;
		  color: #24292E;
		  cursor: pointer;
		  display: inline-block;
		  font-family: -apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
		  font-size: 12px;
		  font-weight: 500;
		  line-height: 18px;
		  list-style: none;
		  padding: 6px 16px;
		  position: relative;
		  transition: background-color 0.2s cubic-bezier(0.3, 0, 0.5, 1);
		  user-select: none;
		  -webkit-user-select: none;
		  touch-action: manipulation;
		  vertical-align: middle;
		  white-space: nowrap;
		  word-wrap: break-word;
		}

		.wordcount-btn:hover {
		  background-color: #F3F4F6;
		  text-decoration: none;
		  transition-duration: 0.1s;
		}

		.wordcount-btn:before {
		  display: none;
		}
    `);
}
