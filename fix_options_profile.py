import re

with open("src/pages/Options.tsx", "r") as f:
    content = f.read()

pattern = re.compile(r'          // Fetch user data directly from Firestore client side.*?            limits: \{.*?\n            \}\n          \}\);\n', re.DOTALL)
new_code = """          try {
            const token = await user.getIdToken();
            const res = await fetch("/api/user/profile", { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
              const data = await res.json();
              
              let savedDocs: any[] = [];
              try {
                const docsSnap = await getDocs(query(collection(db, 'documents'), where('userId', '==', user.uid), orderBy('created_at', 'desc'), limit(5)));
                savedDocs = docsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
              } catch(e) {}
              
              setDashboardData({
                plan: data.plan,
                usage: data.usage,
                limits: data.limits,
                billingHistory: data.history ? data.history.slice(0, 5) : [],
                savedDocs
              });
            } else {
               console.error("Failed to fetch profile");
            }
          } catch(e) {
             console.error("Error fetching profile", e);
          }\n"""

if re.search(pattern, content):
    content = pattern.sub(new_code, content)
    with open("src/pages/Options.tsx", "w") as f:
        f.write(content)
    print("Replaced Options.tsx logic")
else:
    print("Could not find regex pattern in Options.tsx")
