const fs = require('fs');
let content = fs.readFileSync('src/pages/Billing.tsx', 'utf8');

const replacement = `
  const getDiscountedPriceRaw = (price: number, planId?: string) => {
    if (!appliedCoupon) return price;
    if (appliedCoupon.minimumOrderAmount && price < appliedCoupon.minimumOrderAmount) return price;
    if (appliedCoupon.applicablePlan && appliedCoupon.applicablePlan !== "all" && planId && appliedCoupon.applicablePlan !== planId) return price;
    
    if (appliedCoupon.type === 'fixed') {
      return Math.max(0, price - (appliedCoupon.value || 0));
    }
    return Math.floor(price * (1 - (appliedCoupon.percentage || appliedCoupon.value || 0) / 100));
  };

  const renderPrice = (price: number, planId?: string) => {
    const discounted = getDiscountedPriceRaw(price, planId);
    if (discounted === price) return \`₹\${price.toLocaleString('en-IN')}\`;
    
    return (
      <span className="flex items-center gap-2">
        <span>₹{discounted.toLocaleString('en-IN')}</span>
        <span className="text-lg text-gray-400 line-through">₹{price.toLocaleString('en-IN')}</span>
      </span>
    );
  };
`;

content = content.replace(
/  const getDiscountedPrice = \(price: number\) => \{[\s\S]*?  \};\s*const renderPrice = \(price: number\) => \{[\s\S]*?  \};/g,
replacement.trim()
);

fs.writeFileSync('src/pages/Billing.tsx', content);
