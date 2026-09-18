import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Add imports
content = content.replace(
  /ChevronRight, FileText, ListPlus, SlidersHorizontal, Activity, Users, Bot, User, Check/,
  `ChevronRight, FileText, ListPlus, SlidersHorizontal, Activity, Users, Bot, User, Check, Mic, AudioLines`
);

// Add buttons
const buttonsHtml = `
            <div className="flex items-center justify-start gap-3 sm:gap-5 w-full sm:w-auto mt-2 sm:mt-0">
              <button 
                onClick={handleAskLegalAdvisories}
                disabled={isLoading || (!prompt.trim() && uploadedFiles.length === 0)}
                className="flex-1 sm:flex-none bg-[#7b7b7b] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[13px] font-semibold hover:bg-gray-600 transition-colors shadow-sm disabled:opacity-50"
              >
                Ask Legal Advisories
              </button>
              
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  type="button" 
                  className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <Mic className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </button>
                <button 
                  type="button" 
                  className="w-8 h-8 sm:w-9 sm:h-9 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
                >
                  <AudioLines className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </button>
              </div>
            </div>
`;

content = content.replace(
  /<div className="flex items-center justify-start gap-5 w-full sm:w-auto mt-1 sm:mt-0">\s*<button\s*onClick=\{handleAskLegalAdvisories\}\s*disabled=\{isLoading \|\| \(\!prompt\.trim\(\) && uploadedFiles\.length === 0\)\}\s*className="w-full sm:w-auto bg-black text-white px-3 sm:px-4 py-1\.5 sm:py-2 rounded-md sm:rounded-lg text-\[13px\] font-semibold hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"\s*>\s*Ask Legal Advisories\s*<\/button>\s*<\/div>/,
  buttonsHtml
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
