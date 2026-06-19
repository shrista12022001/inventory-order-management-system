import { useState } from 'react';
import ProductsPage from './pages/ProductsPage';
import CustomersPage from './pages/CustomersPage';
import OrdersPage from './pages/OrdersPage';
import InventoryPage from './pages/InventoryPage';

const PAGES = [
  { id: 'products', label: 'Products', component: ProductsPage },
  { id: 'customers', label: 'Customers', component: CustomersPage },
  { id: 'orders', label: 'Orders', component: OrdersPage },
  { id: 'inventory', label: 'Inventory', component: InventoryPage },
];

function App() {
  const [activePage, setActivePage] = useState('products');
  const ActiveComponent = PAGES.find((p) => p.id === activePage)?.component || ProductsPage;

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>Inventory System</h1>
        <p className="subtitle">Order Management</p>
        {PAGES.map((page) => (
          <button
            key={page.id}
            className={`nav-btn ${activePage === page.id ? 'active' : ''}`}
            onClick={() => setActivePage(page.id)}
          >
            {page.label}
          </button>
        ))}
      </aside>
      <main className="main">
        <ActiveComponent />
      </main>
    </div>
  );
}

export default App;
