const products = [
  {
    id: 1,
    title: 'Керамическая кружка',
    description: 'Большая кружка для чая, кофе и спокойных вечеров.',
    price: 850,
  },
  {
    id: 2,
    title: 'Ароматическая свеча',
    description: 'Свеча с мягким ванильным ароматом и хлопковым фитилем.',
    price: 620,
  },
  {
    id: 3,
    title: 'Плед из хлопка',
    description: 'Легкий плед для дивана, кресла или прогулок на балконе.',
    price: 2490,
  },
  {
    id: 4,
    title: 'Декоративная подушка',
    description: 'Мягкая подушка с минималистичным узором.',
    price: 1190,
  },
  {
    id: 5,
    title: 'Настольная лампа',
    description: 'Компактная лампа с теплым светом для рабочего стола.',
    price: 3190,
  },
  {
    id: 6,
    title: 'Органайзер для мелочей',
    description: 'Деревянный органайзер для ключей, украшений и канцелярии.',
    price: 990,
  },
];

const productList = document.querySelector('#product-list');
const productTemplate = document.querySelector('#product-card-template');
const cartItems = document.querySelector('#cart-items');
const cartCount = document.querySelector('#cart-count');
const cartTotal = document.querySelector('#cart-total');
const checkoutButton = document.querySelector('#checkout-button');
const orderSection = document.querySelector('#order');
const orderForm = document.querySelector('#order-form');
const orderMessage = document.querySelector('#order-message');

let cart = loadCart();

function formatPrice(value) {
  return `${value.toLocaleString('ru-RU')} ₽`;
}

function saveCart() {
  localStorage.setItem('shopCart', JSON.stringify(cart));
}

function loadCart() {
  const savedCart = localStorage.getItem('shopCart');

  if (!savedCart) {
    return [];
  }

  try {
    return JSON.parse(savedCart);
  } catch {
    return [];
  }
}

function getProductById(productId) {
  return products.find((product) => product.id === productId);
}

function renderProducts() {
  products.forEach((product) => {
    const card = productTemplate.content.cloneNode(true);
    const title = card.querySelector('h3');
    const description = card.querySelector('.product-description');
    const price = card.querySelector('.product-price');
    const button = card.querySelector('button');

    title.textContent = product.title;
    description.textContent = product.description;
    price.textContent = formatPrice(product.price);
    button.addEventListener('click', () => addToCart(product.id));

    productList.append(card);
  });
}

function addToCart(productId) {
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  updateCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCart();
}

function changeQuantity(productId, difference) {
  const item = cart.find((cartItem) => cartItem.id === productId);

  if (!item) {
    return;
  }

  item.quantity += difference;

  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  updateCart();
}

function getCartTotals() {
  return cart.reduce(
    (totals, item) => {
      const product = getProductById(item.id);

      if (!product) {
        return totals;
      }

      totals.count += item.quantity;
      totals.sum += product.price * item.quantity;
      return totals;
    },
    { count: 0, sum: 0 }
  );
}

function renderCart() {
  cartItems.innerHTML = '';

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Корзина пока пустая. Добавьте товары из каталога.</p>';
    orderSection.hidden = true;
    orderMessage.textContent = '';
    return;
  }

  cart.forEach((item) => {
    const product = getProductById(item.id);

    if (!product) {
      return;
    }

    const cartItem = document.createElement('article');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <div>
        <h3>${product.title}</h3>
        <p>${formatPrice(product.price)} за штуку</p>
      </div>
      <div class="quantity-control" aria-label="Количество товара ${product.title}">
        <button type="button" data-action="decrease" aria-label="Уменьшить количество">−</button>
        <span>${item.quantity}</span>
        <button type="button" data-action="increase" aria-label="Увеличить количество">+</button>
      </div>
      <button class="remove-button" type="button" data-action="remove">Удалить</button>
    `;

    cartItem.querySelector('[data-action="decrease"]').addEventListener('click', () => {
      changeQuantity(product.id, -1);
    });

    cartItem.querySelector('[data-action="increase"]').addEventListener('click', () => {
      changeQuantity(product.id, 1);
    });

    cartItem.querySelector('[data-action="remove"]').addEventListener('click', () => {
      removeFromCart(product.id);
    });

    cartItems.append(cartItem);
  });
}

function updateCart() {
  const totals = getCartTotals();

  cartCount.textContent = totals.count;
  cartTotal.textContent = formatPrice(totals.sum);
  checkoutButton.disabled = cart.length === 0;

  saveCart();
  renderCart();
}

checkoutButton.addEventListener('click', () => {
  if (cart.length === 0) {
    return;
  }

  orderSection.hidden = false;
  orderSection.scrollIntoView({ behavior: 'smooth' });
});

orderForm.addEventListener('submit', (event) => {
  event.preventDefault();
  orderMessage.textContent = 'Заказ создан!';
  orderForm.reset();
});

renderProducts();
updateCart();
