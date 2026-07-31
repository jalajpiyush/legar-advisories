const fs = require('fs');
let content = fs.readFileSync('src/pages/Billing.tsx', 'utf8');

const target = `          <button 
            onClick={() => {
              if (couponCode.trim().toLowerCase() === 'save20') {
                setDiscountPercent(20);
                alert("20% discount applied!");
              } else if (couponCode.trim().toLowerCase() === 'save10') {
                setDiscountPercent(10);
                alert("10% discount applied!");
              } else if (couponCode.trim() !== '') {
                setDiscountPercent(0);
                alert("Invalid coupon code");
              } else {
                setDiscountPercent(0);
              }
            }}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
          >
            Apply
          </button>
        </div>
        {discountPercent > 0 && (
          <p className="text-sm text-green-600 font-medium mt-2">
            {discountPercent}% discount active!
          </p>
        )}`;

const replacement = `          <button 
            onClick={async () => {
              const code = couponCode.trim();
              if (!code) return setAppliedCoupon(null);
              
              try {
                const docRef = doc(db, 'coupons', code);
                const docSnap = await getDoc(docRef);
                
                if (!docSnap.exists()) {
                  alert("Coupon not found");
                  return;
                }
                
                const data = docSnap.data();
                
                if (data.status === 'inactive' || data.active === false) {
                  alert("Coupon inactive");
                  return;
                }
                
                if (data.expiryDate) {
                  const expiry = data.expiryDate.toDate ? data.expiryDate.toDate() : new Date(data.expiryDate);
                  if (expiry < new Date()) {
                    alert("Coupon expired");
                    return;
                  }
                }
                
                if (data.usageLimit && (data.usageCount || 0) >= data.usageLimit) {
                  alert("Coupon usage limit reached");
                  return;
                }
                
                setAppliedCoupon(data);
                alert("Coupon Applied Successfully");
              } catch (err) {
                console.error(err);
                alert("Failed to validate coupon");
              }
            }}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
          >
            Apply
          </button>
        </div>
        {appliedCoupon && (
          <p className="text-sm text-green-600 font-medium mt-2">
            {appliedCoupon.type === 'fixed' ? \`₹\${appliedCoupon.value} off applied!\` : \`\${appliedCoupon.percentage || appliedCoupon.value}% discount active!\`}
          </p>
        )}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/pages/Billing.tsx', content);
