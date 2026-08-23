const fs = require('fs');
const path = require('path');

const productsFile = path.join(__dirname, 'src/mocks/seed/storefront/products.json');
const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));

products.forEach(p => {
  // Normalize category
  if (p.categoryName === 'Birthday Cakes') p.categoryName = 'Cakes';

  // Apply per-category modifications
  switch (p.categoryName) {
    case 'Cookies':
      p.quantities = [
        { id: 'q1', label: 'Box of 4', pieces: 4, priceModifier: 0 },
        { id: 'q2', label: 'Box of 8', pieces: 8, priceModifier: 32000 },
        { id: 'q3', label: 'Box of 12', pieces: 12, priceModifier: 64000 }
      ];
      p.flavours = [];
      p.addOns = [
        { id: 'gw', name: 'Gift Wrap', price: 4900 },
        { id: 'cmt', name: 'Custom Message Tag', price: 2900 }
      ];
      p.faqs = [
        { question: 'How long do cookies stay fresh?', answer: 'Our cookies stay fresh for up to 5 days in an airtight container.' },
        { question: 'Can I warm them up?', answer: 'Yes! Microwave for 5-10 seconds for that fresh-out-of-the-oven taste.' }
      ];
      p.occasions = ['Birthday', 'Thank You', 'Festive', 'Just Because'];
      break;

    case 'Brownies':
      p.quantities = [
        { id: 'q1', label: 'Box of 2', pieces: 2, priceModifier: 0 },
        { id: 'q2', label: 'Box of 4', pieces: 4, priceModifier: 40000 },
        { id: 'q3', label: 'Box of 6', pieces: 6, priceModifier: 80000 }
      ];
      p.flavours = [];
      p.addOns = [
        { id: 'wp', name: 'Warm & Serve Packaging', price: 2900 },
        { id: 'gw', name: 'Gift Wrap', price: 4900 }
      ];
      p.faqs = [
        { question: 'How to store brownies?', answer: 'Keep them in an airtight container at room temperature for up to 4 days.' },
        { question: 'Are these fudgy or cakey?', answer: 'We specialize in rich, dense, and fudgy brownies!' }
      ];
      p.occasions = ['Birthday', 'Anniversary', 'Thank You', 'Just Because'];
      break;

    case 'Cake Pops':
      p.quantities = [
        { id: 'q1', label: 'Regular Box', pieces: 6, priceModifier: 0 },
        { id: 'q2', label: 'Party Box', pieces: 12, priceModifier: 32000 },
        { id: 'q3', label: 'Celebration Box', pieces: 24, priceModifier: 70000 }
      ];
      p.flavours = [
        { id: 'f1', name: 'Dark Chocolate', priceModifier: 0, colorHex: '#5B291A' },
        { id: 'f2', name: 'Milk Chocolate', priceModifier: 0, colorHex: '#7B3F00' },
        { id: 'f3', name: 'White Chocolate', priceModifier: 0, colorHex: '#FDFBF7' }
      ];
      p.addOns = [
        { id: 'driz', name: 'Chocolate Drizzle', price: 4000 },
        { id: 'sprnk', name: 'Rainbow Sprinkles', price: 3000 },
        { id: 'pkg', name: 'Premium Gift Packaging', price: 9900 }
      ];
      p.faqs = [
        { question: 'Do cake pops need refrigeration?', answer: 'For best results, store in the fridge but bring to room temp before eating.' },
        { question: 'Can I order custom colors?', answer: 'Yes, please reach out via our custom orders page!' }
      ];
      p.occasions = ['Birthday', 'Anniversary', 'Baby Shower', 'Thank You'];
      break;

    case 'Cupcakes':
      p.quantities = [
        { id: 'q1', label: 'Box of 4', pieces: 4, priceModifier: 0 },
        { id: 'q2', label: 'Box of 6', pieces: 6, priceModifier: 28000 },
        { id: 'q3', label: 'Box of 12', pieces: 12, priceModifier: 60000 }
      ];
      p.flavours = []; // Handled by inline options
      p.addOns = [
        { id: 'sprnk', name: 'Sprinkles', price: 2000 },
        { id: 'top', name: 'Edible Topper', price: 4900 },
        { id: 'gb', name: 'Gift Box', price: 6900 }
      ];
      p.faqs = [
        { question: 'How long do they last?', answer: 'Best enjoyed within 2 days. Store in an airtight container.' },
        { question: 'Can I mix flavors in a box?', answer: 'Our standard boxes come in a single flavor, but check out our assorted boxes!' }
      ];
      p.occasions = ['Birthday', 'Anniversary', 'Thank You', 'Just Because'];
      break;

    case 'Desserts':
      p.quantities = [
        { id: 'q1', label: 'Single', pieces: 1, priceModifier: 0 },
        { id: 'q2', label: 'Set of 2', pieces: 2, priceModifier: 35000 }
      ];
      p.flavours = [];
      p.addOns = [
        { id: 'gw', name: 'Gift Wrap', price: 4900 }
      ];
      p.faqs = [
        { question: 'How to serve?', answer: 'Instructions are included with each specific dessert.' },
        { question: 'Contains nuts?', answer: 'Check the allergens list. We do process nuts in our facility.' }
      ];
      p.occasions = ['Birthday', 'Thank You', 'Just Because'];
      break;

    case 'Cakes':
      p.quantities = [
        { id: 'q1', label: 'Mini 0.5kg', pieces: 1, priceModifier: 0 },
        { id: 'q2', label: 'Regular 1kg', pieces: 1, priceModifier: 80000 },
        { id: 'q3', label: 'Large 1.5kg', pieces: 1, priceModifier: 160000 }
      ];
      p.flavours = [
        { id: 'f1', name: 'Chocolate', priceModifier: 0, colorHex: '#5B291A' },
        { id: 'f2', name: 'Red Velvet', priceModifier: 0, colorHex: '#8B0000' },
        { id: 'f3', name: 'Vanilla', priceModifier: 0, colorHex: '#FDFBF7' }
      ];
      p.addOns = [
        { id: 'fondant', name: 'Fondant Topper', price: 19900 },
        { id: 'plaque', name: 'Message Plaque', price: 7900 },
        { id: 'candles', name: 'Candles Set', price: 4900 }
      ];
      p.faqs = [
        { question: 'How much notice do you need?', answer: 'We require 24 hours notice for standard cakes.' },
        { question: 'Can you write a message?', answer: 'Yes! Add a message plaque to your order.' }
      ];
      p.occasions = ['Birthday', 'Anniversary', 'Wedding', 'Graduation'];
      break;

    case 'Macarons':
      p.quantities = [
        { id: 'q1', label: 'Box of 6', pieces: 6, priceModifier: 0 },
        { id: 'q2', label: 'Box of 12', pieces: 12, priceModifier: 80000 }
      ];
      p.flavours = [];
      p.addOns = [
        { id: 'gbup', name: 'Gift Box Upgrade', price: 7900 }
      ];
      p.faqs = [
        { question: 'Are these gluten-free?', answer: 'Yes, our macarons are naturally gluten-free as they are made with almond flour.' },
        { question: 'Storage instructions?', answer: 'Refrigerate in an airtight container for up to 4 days.' }
      ];
      p.occasions = ['Birthday', 'Anniversary', 'Wedding', 'Thank You'];
      break;

    case 'Cake Jars':
      p.quantities = [
        { id: 'q1', label: 'Single Jar', pieces: 1, priceModifier: 0 },
        { id: 'q2', label: 'Set of 2', pieces: 2, priceModifier: 45000 }
      ];
      p.flavours = [];
      p.addOns = [
        { id: 'spoon', name: 'Spoon Set', price: 1900 },
        { id: 'gw', name: 'Gift Wrap', price: 4900 }
      ];
      p.faqs = [
        { question: 'How long do they last?', answer: 'Up to 5 days in the refrigerator.' },
        { question: 'Are the jars reusable?', answer: 'Yes! Our glass jars are fully washable and reusable.' }
      ];
      p.occasions = ['Birthday', 'Thank You', 'Just Because'];
      break;

    case 'Gift Boxes':
      p.quantities = [
        { id: 'q1', label: 'Classic 6 items', pieces: 1, priceModifier: 0 },
        { id: 'q2', label: 'Premium 12 items', pieces: 1, priceModifier: 150000 },
        { id: 'q3', label: 'Grand 18 items', pieces: 1, priceModifier: 300000 }
      ];
      p.flavours = [];
      p.addOns = [
        { id: 'ribbon', name: 'Custom Ribbon', price: 3900 },
        { id: 'note', name: 'Personal Note Card', price: 2900 },
        { id: 'outer', name: 'Premium Outer Box', price: 9900 }
      ];
      p.faqs = [
        { question: 'Can I customize the contents?', answer: 'Currently, gift boxes come with a pre-set assorted selection of our bestsellers.' },
        { question: 'Do you do corporate orders?', answer: 'Yes, we handle large corporate gifting. Visit our custom orders page!' }
      ];
      p.occasions = ['Birthday', 'Anniversary', 'Wedding', 'Thank You', 'Festive', 'Corporate'];
      break;
  }
});

fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
console.log('Successfully updated products.json');
