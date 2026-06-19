import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setInventory(await api.getInventory());
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalStock = inventory.reduce((sum, i) => sum + i.current_stock, 0);
  const lowStock = inventory.filter((i) => i.current_stock > 0 && i.current_stock < 10).length;
  const outOfStock = inventory.filter((i) => i.current_stock === 0).length;

  const stockClass = (qty) => (qty === 0 ? 'stock-out' : qty < 10 ? 'stock-low' : 'stock-ok');

  return (
    <>
      <div className="page-header">
        <h2>Inventory Tracking</h2>
        <button className="btn btn-secondary" onClick={load}>Refresh</button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Total Products</div>
          <div className="value">{inventory.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Units in Stock</div>
          <div className="value">{totalStock}</div>
        </div>
        <div className="stat-card">
          <div className="label">Low Stock (&lt;10)</div>
          <div className="value" style={{ color: 'var(--warning)' }}>{lowStock}</div>
        </div>
        <div className="stat-card">
          <div className="label">Out of Stock</div>
          <div className="value" style={{ color: 'var(--danger)' }}>{outOfStock}</div>
        </div>
      </div>
      <div className="card">
        {loading ? (
          <div className="loading">Loading inventory...</div>
        ) : inventory.length === 0 ? (
          <div className="empty">No inventory data. Add products first.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Current Stock</th>
                  <th>Unit Price</th>
                  <th>Stock Value</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.product_id}>
                    <td>{item.product_name}</td>
                    <td><code>{item.sku}</code></td>
                    <td className={stockClass(item.current_stock)}>{item.current_stock}</td>
                    <td>${Number(item.price).toFixed(2)}</td>
                    <td>${(Number(item.price) * item.current_stock).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default InventoryPage;
