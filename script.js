const productList = document.querySelector('#product-list');
const productTemplate = document.querySelector('#product-card-template');
const cartItemTemplate = document.querySelector('#cart-item-template');
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

function renderEmptyCart() {
  const emptyMessage = document.createElement('p');
  emptyMessage.className = 'cart-empty';
  emptyMessage.textContent = 'Корзина пока пустая. Добавьте товары из каталога.';
  cartItems.append(emptyMessage);

  orderSection.hidden = true;
  orderMessage.textContent = '';
}

function createCartItem(item, product) {
  const cartItem = cartItemTemplate.content.cloneNode(true);
  const title = cartItem.querySelector('h3');
  const price = cartItem.querySelector('p');
  const quantityControl = cartItem.querySelector('.quantity-control');
  const quantity = cartItem.querySelector('span');
  const decreaseButton = cartItem.querySelector('[data-action="decrease"]');
  const increaseButton = cartItem.querySelector('[data-action="increase"]');
  const removeButton = cartItem.querySelector('[data-action="remove"]');

  title.textContent = product.title;
  price.textContent = `${formatPrice(product.price)} за штуку`;
  quantity.textContent = item.quantity;
  quantityControl.setAttribute('aria-label', `Количество товара ${product.title}`);
  decreaseButton.setAttribute('aria-label', 'Уменьшить количество');
  increaseButton.setAttribute('aria-label', 'Увеличить количество');

  decreaseButton.addEventListener('click', () => {
    changeQuantity(product.id, -1);
  });

  increaseButton.addEventListener('click', () => {
    changeQuantity(product.id, 1);
  });

  removeButton.addEventListener('click', () => {
    removeFromCart(product.id);
  });

  return cartItem;
}

function renderCart() {
  cartItems.replaceChildren();

  if (cart.length === 0) {
    renderEmptyCart();
    return;
  }

  cart.forEach((item) => {
    const product = getProductById(item.id);

    if (!product) {
      return;
    }

    cartItems.append(createCartItem(item, product));
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
