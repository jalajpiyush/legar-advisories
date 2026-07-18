const fs = require('fs');
let code = fs.readFileSync('src/pages/Options.tsx', 'utf-8');

const plusFeature = `                        <li className="flex items-start gap-3 text-[14px] text-gray-700">
                          <div className="mt-0.5 text-blue-600">
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                          </div>
                          Add my website feature
                        </li>`;

code = code.replace(
  'Projects and custom GPTs\n                        </li>\n                      </ul>',
  'Projects and custom GPTs\n                        </li>\n' + plusFeature + '\n                      </ul>'
);

const businessFeature = `                        <li className="flex items-start gap-3 text-[14px] text-gray-700">
                          <div className="mt-0.5 text-gray-600">
                            <Globe className="w-[18px] h-[18px]" />
                          </div>
                          Add my website feature
                        </li>`;

code = code.replace(
  'No training on your business data by default\n                        </li>\n                      </ul>',
  'No training on your business data by default\n                        </li>\n' + businessFeature + '\n                      </ul>'
);

fs.writeFileSync('src/pages/Options.tsx', code);
