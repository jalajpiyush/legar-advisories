import fs from 'fs';
import { parse } from 'node-html-parser';

const html = `
<div id="root">
  <div class="div1">
    <main class="main1">
      <div class="div1">
        <div class="div1">
          <div class="div2">
            <div class="div1">
              <div class="div2">
                 <!-- embedded Billing -->
                 <div class="div1">
                    <div class="header"></div> <!-- 1 -->
                    <div class="currentPlan"></div> <!-- 2 -->
                    <div class="toggles"></div> <!-- 3 -->
                    <div class="grid"> <!-- 4 -->
                       <div class="plan1"> <!-- 1 -->
                          <div class="badge"></div> <!-- 1 -->
                          <h3 class="title"></h3>
                          <p class="desc"></p>
                          <div class="price"></div> <!-- 2 -->
                          <ul class="features"></ul>
                          <button class="btn"></button>
                       </div>
                    </div>
                    <div class="history"></div> <!-- 5 -->
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>
`;
// ... Wait, that's not helping. I'm just guessing what the components output.
