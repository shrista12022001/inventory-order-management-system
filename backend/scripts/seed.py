#!/usr/bin/env python3
"""Seed sample data for demo purposes."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from decimal import Decimal

from app.database import Base, SessionLocal, engine
from app.models import Customer, Product


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Product).count() > 0:
            print("Database already has data. Skipping seed.")
            return

        products = [
            Product(name="Wireless Mouse", sku="WM-001", description="Ergonomic wireless mouse", price=Decimal("29.99"), stock_quantity=150),
            Product(name="Mechanical Keyboard", sku="KB-002", description="RGB mechanical keyboard", price=Decimal("89.99"), stock_quantity=75),
            Product(name="USB-C Hub", sku="HUB-003", description="7-in-1 USB-C hub", price=Decimal("45.00"), stock_quantity=200),
            Product(name="Monitor Stand", sku="MS-004", description="Adjustable monitor stand", price=Decimal("35.50"), stock_quantity=5),
            Product(name="Webcam HD", sku="WC-005", description="1080p HD webcam", price=Decimal("59.99"), stock_quantity=0),
        ]
        customers = [
            Customer(name="Alice Johnson", email="alice@example.com", phone="555-0101", address="123 Main St"),
            Customer(name="Bob Smith", email="bob@example.com", phone="555-0102", address="456 Oak Ave"),
            Customer(name="Carol Williams", email="carol@example.com", phone="555-0103", address="789 Pine Rd"),
        ]
        db.add_all(products + customers)
        db.commit()
        print("Seed data created successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
