import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ customer_id: '', notes: '', items: [{ product_id: '', quantity: 1 }] });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersData, customersData, productsData] = await Promise.all([
        api.getOrders(),
        api.getCustomers(),
        api.getProducts(),
      ]);
      setOrders(ordersData);
      setCustomers(customersData);
      setProducts(productsData);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setForm({
      customer_id: customers[0]?.id ? String(customers[0].id) : '',
      notes: '',
      items: [{ product_id: products[0]?.id ? String(products[0].id) : '', quantity: 1 }],
    });
    setShowModal(true);
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { product_id: '', quantity: 1 }] });
  };

  const removeItem = (idx) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: value };
    setForm({ ...form, items });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    const payload = {
      customer_id: parseInt(form.customer_id, 10),
      notes: form.notes || null,
      items: form.items.map((item) => ({
        product_id: parseInt(item.product_id, 10),
        quantity: parseInt(item.quantity, 10),
      })),
    };
    try {
      await api.createOrder(payload);
      setShowModal(false);
      setSuccess('Order created successfully. Stock has been reduced.');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.updateOrderStatus(orderId, status);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="page-header">
        <h2>Orders</h2>
        <button className="btn btn-primary" onClick={openCreate} disabled={!customers.length || !products.length}>
          + Create Order
        </button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <div className="card">
        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty">No orders yet. Create your first order.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{o.customer_name}</td>
                    <td>
                      {o.items.map((item) => (
                        <div key={item.id} style={{ fontSize: '0.85rem' }}>
                          {item.product_name} × {item.quantity}
                        </div>
                      ))}
                    </td>
                    <td>${Number(o.total_amount).toFixed(2)}</td>
                    <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td>
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        disabled={o.status === 'cancelled'}
                        style={{ fontSize: '0.8rem', padding: '0.3rem' }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showModal && (
        <Modal title="Create Order" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Customer</label>
              <select required value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </div>
            <div className="order-items-section">
              <label style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order Items</label>
              {form.items.map((item, idx) => (
                <div key={idx} className="order-item-row">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <select
                      required
                      value={item.product_id}
                      onChange={(e) => updateItem(idx, 'product_id', e.target.value)}
                    >
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Stock: {p.stock_quantity}) — ${Number(p.price).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input
                      required
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                      placeholder="Qty"
                    />
                  </div>
                  {form.items.length > 1 && (
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => removeItem(idx)}>×</button>
                  )}
                </div>
              ))}
              <button type="button" className="add-item-btn" onClick={addItem}>+ Add another item</button>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Place Order</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

export default OrdersPage;
