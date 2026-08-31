import fs from 'fs';

let content = fs.readFileSync('src/pages/Options.tsx', 'utf8');

const replacement = `                    </div>

                    {/* Saved Documents */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm col-span-1 md:col-span-2">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">Saved Documents</h3>
                      {dashboardData.savedDocs && dashboardData.savedDocs.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                              <tr>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dashboardData.savedDocs.map((doc: any) => (
                                <tr key={doc.id} className="border-b">
                                  <td className="px-4 py-3">{new Date(doc.created_at).toLocaleDateString()}</td>
                                  <td className="px-4 py-3 font-medium text-gray-900">{doc.title || "Untitled Document"}</td>
                                  <td className="px-4 py-3">{doc.type || "Analysis"}</td>
                                  <td className="px-4 py-3">
                                    <button className="text-blue-600 hover:underline">View</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No saved documents found.</p>
                      )}
                    </div>
                  </div>`;

content = content.replace(/                    <\/div>\n                  <\/div>/, replacement);
fs.writeFileSync('src/pages/Options.tsx', content);
