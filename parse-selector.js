import { JSDOM } from 'jsdom';
import fs from 'fs';

// I need the rendered HTML.
// I will just fetch the dev server HTML!
async function run() {
  try {
    const res = await fetch('http://localhost:3000');
    const html = await res.text();
    const dom = new JSDOM(html);
    const el = dom.window.document.querySelector("div#root:nth-of-type(1) > div:nth-of-type(1) > main:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(5) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3)");
    console.log("Element found:", el ? el.outerHTML : "null");
  } catch(e) {
    console.error(e);
  }
}
run();
