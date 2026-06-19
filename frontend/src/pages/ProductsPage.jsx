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

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', sku: '', description: '', price: '', stock_quantity: '' });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setProducts(await api.getProducts());
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', sku: '', description: '', price: '', stock_quantity: '' });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      sku: p.sku,
      description: p.description || '',
      price: String(p.price),
      stock_quantity: String(p.stock_quantity),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      sku: form.sku,
      description: form.description || null,
      price: parseFloat(form.price),
      stock_quantity: parseInt(form.stock_quantity, 10),
    };
    try {
      if (editing) {
        const { sku, ...update } = payload;
        await api.updateProduct(editing.id, update);
      } else {
        await api.createProduct(payload);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.deleteProduct(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const stockClass = (qty) => (qty === 0 ? 'stock-out' : qty < 10 ? 'stock-low' : 'stock-ok');

  return (
    <>
      <div className="page-header">
        <h2>Products</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card">
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="empty">No products yet. Add your first product.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td><code>{p.sku}</code></td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td className={stockClass(p.stock_quantity)}>{p.stock_quantity}</td>
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(p)}>Edit</button>{' '}
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showModal && (
        <Modal title={editing ? 'Edit Product' : 'Add Product'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>SKU</label>
              <input required disabled={!!editing} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Price</label>
              <input required type="number" step="0.01" min="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Stock Quantity</label>
              <input required type="number" min="0" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

export default ProductsPage;
