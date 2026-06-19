from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Customer, Order, OrderItem, OrderStatus, Product
from app.schemas import (
    CustomerCreate,
    CustomerResponse,
    CustomerUpdate,
    InventoryLogResponse,
    OrderCreate,
    OrderItemResponse,
    OrderResponse,
    OrderStatusUpdate,
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)

router = APIRouter()


def _product_to_response(product: Product) -> ProductResponse:
    return ProductResponse.model_validate(product)


def _customer_to_response(customer: Customer) -> CustomerResponse:
    return CustomerResponse.model_validate(customer)


def _order_to_response(order: Order) -> OrderResponse:
    items = [
        OrderItemResponse(
            id=item.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            subtotal=item.subtotal,
            product_name=item.product.name if item.product else None,
            product_sku=item.product.sku if item.product else None,
        )
        for item in order.items
    ]
    return OrderResponse(
        id=order.id,
        customer_id=order.customer_id,
        status=order.status,
        total_amount=order.total_amount,
        notes=order.notes,
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=items,
        customer_name=order.customer.name if order.customer else None,
    )


# --- Products ---


@router.get("/products", response_model=list[ProductResponse])
def list_products(db: Session = Depends(get_db)):
    return [_product_to_response(p) for p in db.query(Product).order_by(Product.name).all()]


@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return _product_to_response(product)


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    product = Product(**payload.model_dump())
    db.add(product)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Product SKU must be unique")
    db.refresh(product)
    return _product_to_response(product)


@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return _product_to_response(product)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()


# --- Customers ---


@router.get("/customers", response_model=list[CustomerResponse])
def list_customers(db: Session = Depends(get_db)):
    return [_customer_to_response(c) for c in db.query(Customer).order_by(Customer.name).all()]


@router.get("/customers/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return _customer_to_response(customer)


@router.post("/customers", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    customer = Customer(**payload.model_dump())
    db.add(customer)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Customer email must be unique")
    db.refresh(customer)
    return _customer_to_response(customer)


@router.put("/customers/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: int, payload: CustomerUpdate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(customer, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Customer email must be unique")
    db.refresh(customer)
    return _customer_to_response(customer)


@router.delete("/customers/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(customer)
    db.commit()


# --- Orders ---


@router.get("/orders", response_model=list[OrderResponse])
def list_orders(db: Session = Depends(get_db)):
    orders = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.customer))
        .order_by(Order.created_at.desc())
        .all()
    )
    return [_order_to_response(o) for o in orders]


@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.customer))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return _order_to_response(order)


@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    product_ids = [item.product_id for item in payload.items]
    if len(product_ids) != len(set(product_ids)):
        raise HTTPException(status_code=400, detail="Duplicate products in order are not allowed")

    products = db.query(Product).filter(Product.id.in_(product_ids)).all()
    product_map = {p.id: p for p in products}

    if len(products) != len(product_ids):
        missing = set(product_ids) - set(product_map.keys())
        raise HTTPException(status_code=404, detail=f"Products not found: {sorted(missing)}")

    for item in payload.items:
        product = product_map[item.product_id]
        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Insufficient stock for product '{product.name}' (SKU: {product.sku}). "
                    f"Available: {product.stock_quantity}, Requested: {item.quantity}"
                ),
            )

    order = Order(
        customer_id=payload.customer_id,
        status=OrderStatus.CONFIRMED,
        notes=payload.notes,
        total_amount=Decimal("0"),
    )
    db.add(order)
    db.flush()

    total = Decimal("0")
    for item in payload.items:
        product = product_map[item.product_id]
        unit_price = Decimal(str(product.price))
        subtotal = unit_price * item.quantity
        total += subtotal

        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=item.quantity,
            unit_price=unit_price,
            subtotal=subtotal,
        )
        db.add(order_item)
        product.stock_quantity -= item.quantity

    order.total_amount = total
    db.commit()

    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.customer))
        .filter(Order.id == order.id)
        .first()
    )
    return _order_to_response(order)


@router.patch("/orders/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db)):
    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product), joinedload(Order.customer))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status == OrderStatus.CANCELLED:
        raise HTTPException(status_code=400, detail="Cannot update a cancelled order")

    if payload.status == OrderStatus.CANCELLED and order.status != OrderStatus.CANCELLED:
        for item in order.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                product.stock_quantity += item.quantity

    order.status = payload.status
    db.commit()
    db.refresh(order)
    return _order_to_response(order)


# --- Inventory ---


@router.get("/inventory", response_model=list[InventoryLogResponse])
def get_inventory(db: Session = Depends(get_db)):
    products = db.query(Product).order_by(Product.name).all()
    return [
        InventoryLogResponse(
            product_id=p.id,
            product_name=p.name,
            sku=p.sku,
            current_stock=p.stock_quantity,
            price=p.price,
        )
        for p in products
    ]
