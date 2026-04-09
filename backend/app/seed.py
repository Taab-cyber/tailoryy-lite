# seed.py — Populate database with realistic sample data
# Run with: cd backend && venv/Scripts/python -m app.seed

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import uuid
from datetime import datetime, timedelta
from passlib.context import CryptContext

from app.database import SessionLocal, create_tables
from app.models.user import User
from app.models.order import Order
from app.models.portfolio_item import PortfolioItem
from app.models.fabric import Fabric
from app.models.review import Review
from app.models.promo_code import PromoCode
from app.models.message import Message
from app.models.conversation import Conversation
from app.utils.order_number import generate_order_number

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

PORTFOLIO_IMAGES = {
    "lehenga":     "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop",
    "saree":       "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop",
    "kurta":       "https://images.unsplash.com/photo-1596092921629-4f6e80c0af25?w=800&auto=format&fit=crop",
    "indo_western":"https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop",
    "upcycled":    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop",
    "western":     "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800&auto=format&fit=crop",
}


def seed():
    create_tables()
    db = SessionLocal()
    try:
        # ── Admin user ─────────────────────────────────────────────
        admin = db.query(User).filter(User.email == "admin@tailoryy.com").first()
        if not admin:
            admin = User(
                id=str(uuid.uuid4()),
                email="admin@tailoryy.com",
                full_name="Tailoryy Admin",
                phone="+91-9876543210",
                password_hash=pwd_context.hash("Admin@123"),
                role="admin",
                is_active=True,
                is_verified=True,
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print("[OK] Admin user created")

        # ── Customer users ─────────────────────────────────────────
        customers_data = [
            ("Priya Sharma",       "priya.sharma@gmail.com",   "+91-9811234567"),
            ("Meera Patel",        "meera.patel@gmail.com",    "+91-9822345678"),
            ("Ananya Reddy",       "ananya.reddy@gmail.com",   "+91-9833456789"),
            ("Kavitha Nair",       "kavitha.nair@gmail.com",   "+91-9844567890"),
            ("Sunita Agarwal",     "sunita.agarwal@gmail.com", "+91-9855678901"),
        ]
        customers = []
        for full_name, email, phone in customers_data:
            customer = db.query(User).filter(User.email == email).first()
            if not customer:
                customer = User(
                    id=str(uuid.uuid4()),
                    email=email,
                    full_name=full_name,
                    phone=phone,
                    password_hash=pwd_context.hash("Customer@123"),
                    role="customer",
                    is_active=True,
                    is_verified=True,
                )
                db.add(customer)
            customers.append(customer)
        db.commit()
        print(f"[OK] {len(customers_data)} customers seeded")

        # ── Portfolio items ────────────────────────────────────────
        portfolio_items_data = [
            ("Scarlet Bridal Lehenga",  "lehenga",     ["Bridal", "Embroidered", "Silk"],     True,  1),
            ("Navy Kanjivaram Saree",   "saree",       ["Silk", "Traditional", "Festive"],    True,  2),
            ("Ivory Anarkali Kurta",    "kurta",       ["Anarkali", "Cotton", "Summer"],      False, 3),
            ("Teal Indo-Western Gown",  "indo_western",["Fusion", "Party", "Georgette"],      True,  4),
            ("Upcycled Denim Jacket",   "upcycled",    ["Denim", "Casual", "Sustainable"],    False, 5),
            ("Blush Midi Dress",        "western",     ["Western", "Casual", "Linen"],        False, 6),
            ("Deep Red Lehenga Choli",  "lehenga",     ["Festive", "Zari Work", "Silk"],      True,  7),
            ("Pastel Georgette Saree",  "saree",       ["Light", "Summer", "Georgette"],      False, 8),
            ("Emerald Kurta Palazzo",   "kurta",       ["Comfort", "Festive", "Set"],         False, 9),
            ("Black Indo-Western Suit", "indo_western",["Formal", "Indo-Western", "Men"],     False, 10),
            ("Upcycled Sari Blouse",    "upcycled",    ["Upcycled", "Sustainable", "Elegant"],False, 11),
            ("Cream Off-Shoulder Gown", "western",     ["Western", "Formal", "Chiffon"],      True,  12),
            ("Peacock Blue Lehenga",    "lehenga",     ["Blue", "Mirror Work", "Wedding"],    True,  13),
            ("Gold Banarasi Saree",     "saree",       ["Banarasi", "Gold", "Wedding"],       True,  14),
            ("Mint Green Salwar Suit",  "kurta",       ["Cotton", "Daily Wear", "Mint"],      False, 15),
            ("Pink Palazzo Set",        "indo_western",["Pink", "Summer", "Comfort"],         False, 16),
            ("Upcycled Vintage Kurti",  "upcycled",    ["Vintage", "Upcycled", "Cotton"],     False, 17),
            ("Champagne Evening Gown",  "western",     ["Evening", "Silk", "Formal"],         False, 18),
            ("Royal Blue Sherwani",     "indo_western",["Sherwani", "Men", "Wedding"],        False, 19),
            ("Rust Handloom Saree",     "saree",       ["Handloom", "Earthy", "Casual"],      False, 20),
        ]
        pi_count = 0
        portfolio_ids = []
        for title, cat, tags, featured, order in portfolio_items_data:
            existing = db.query(PortfolioItem).filter(PortfolioItem.title == title).first()
            if not existing:
                item = PortfolioItem(
                    id=str(uuid.uuid4()),
                    title=title,
                    category=cat,
                    images=[PORTFOLIO_IMAGES.get(cat, PORTFOLIO_IMAGES["kurta"])],
                    description=f"A beautifully crafted {title.lower()} — tailored to perfection.",
                    tags=tags,
                    is_featured=featured,
                    display_order=order,
                )
                db.add(item)
                portfolio_ids.append(item.id)
                pi_count += 1
            else:
                portfolio_ids.append(existing.id)
        db.commit()
        print(f"[OK] {pi_count} portfolio items seeded")

        # ── Fabrics ────────────────────────────────────────────────
        fabrics_data = [
            ("Pure Banarasi Silk",    "silk",       "Ivory",       "#FAF7F2", 1800),
            ("Tussar Raw Silk",       "silk",       "Gold",        "#D4A847", 1400),
            ("Organic Khadi Cotton",  "cotton",     "White",       "#FAFAFA", 280),
            ("Mulmul Cotton",         "cotton",     "Pastel Pink", "#FFB5C2", 220),
            ("Chiffon Georgette",     "georgette",  "Teal",        "#008080", 480),
            ("Heavy Georgette",       "georgette",  "Navy",        "#1A2A5E", 620),
            ("Belgian Linen",         "linen",      "Sand",        "#C2B280", 750),
            ("Pure Linen",            "linen",      "Sage Green",  "#8FAF70", 680),
            ("Kashmiri Velvet",       "velvet",     "Burgundy",    "#800020", 1200),
            ("Silk Velvet",           "velvet",     "Emerald",     "#2E7D32", 1350),
            ("Bridal Net",            "net",        "Ivory",       "#FFFFF0", 380),
            ("Embroidered Net",       "net",        "Rose Gold",   "#B76E79", 520),
            ("Crepe Chiffon",         "chiffon",    "Lilac",       "#C8A2C8", 410),
            ("Pure Chiffon",          "chiffon",    "Sky Blue",    "#87CEEB", 350),
            ("Chanderi Silk",         "silk",       "Terracotta",  "#C4704A", 950),
        ]
        fab_count = 0
        for name, ftype, color, hex_code, price in fabrics_data:
            if not db.query(Fabric).filter(Fabric.name == name).first():
                db.add(Fabric(
                    id=str(uuid.uuid4()),
                    name=name,
                    fabric_type=ftype,
                    color=color,
                    hex_code=hex_code,
                    price_per_metre=price,
                    is_available=True,
                    description=f"Premium {name.lower()} available per metre.",
                ))
                fab_count += 1
        db.commit()
        print(f"[OK] {fab_count} fabrics seeded")

        # ── Sample orders ──────────────────────────────────────────
        db.commit()
        db.expire_all()
        customers = db.query(User).filter(User.role == "customer").all()

        orders_data = [
            (customers[0].id, "custom_stitch", "confirmed",  4500, 2250),
            (customers[0].id, "upcycle",        "stitching",  2000, 1000),
            (customers[1].id, "own_fabric",     "pending",    1500,    0),
            (customers[1].id, "custom_stitch",  "delivered",  8000, 4000),
            (customers[2].id, "upcycle",        "shipped",    3200, 1600),
            (customers[2].id, "custom_stitch",  "quality_check", 5500, 2750),
            (customers[3].id, "own_fabric",     "cutting",    2800, 1400),
            (customers[3].id, "custom_stitch",  "confirmed",  6200, 3100),
            (customers[4].id, "upcycle",        "pending",    1800,    0),
            (customers[4].id, "custom_stitch",  "delivered",  9500, 4750),
            (customers[0].id, "own_fabric",     "cancelled",  1200,    0),
            (customers[1].id, "custom_stitch",  "delivered",  7000, 3500),
        ]
        ord_count = 0
        order_ids_for_review = []
        for cust_id, svc, status, total, advance in orders_data:
            order = Order(
                id=str(uuid.uuid4()),
                order_number=f"TLR-20260409-{str(ord_count+1).zfill(4)}",
                customer_id=cust_id,
                service_type=svc,
                status=status,
                total_amount=float(total),
                subtotal=float(total),
                advance_paid=float(advance),
                balance_due=float(total - advance),
                measurements={"bust": 36, "waist": 30, "hip": 38, "shoulder": 14, "height": 162},
                shipping_address={"name": "Sample", "phone": "+91-9999999999",
                                  "address": "123 MG Road", "city": "Mumbai",
                                  "state": "Maharashtra", "pincode": "400001"},
                delivery_type="standard",
                estimated_delivery=datetime.utcnow() + timedelta(days=12),
            )
            db.add(order)
            if status == "delivered":
                order_ids_for_review.append((order.id, cust_id))
            ord_count += 1
        db.commit()
        print(f"[OK] {ord_count} orders seeded")

        # ── Reviews ────────────────────────────────────────────────
        db.expire_all()
        review_texts = [
            "Bilkul perfect stitching! The lehenga fit me like a dream. Bahut khush hoon!",
            "Amazing quality and delivered on time. Will definitely order again.",
            "The upcycling was done beautifully. My old saree now looks brand new!",
            "Excellent workmanship. Every detail was perfect. Highly recommend Tailoryy.",
            "Great communication, lovely fabric, and perfect measurements. 5 stars!",
            "My custom kurta was exactly what I envisioned. The team was very helpful.",
            "Top-notch quality. The embroidery work is stunning. Worth every rupee!",
            "Fast delivery and gorgeous outfit. The team really listens to your requirements.",
        ]
        rev_count = 0
        for idx, (order_id, cust_id) in enumerate(order_ids_for_review[:8]):
            if not db.query(Review).filter(Review.order_id == order_id).first():
                db.add(Review(
                    id=str(uuid.uuid4()),
                    order_id=order_id,
                    customer_id=cust_id,
                    rating=5 if idx % 3 != 2 else 4,
                    comment=review_texts[idx % len(review_texts)],
                    is_approved=True,
                ))
                rev_count += 1
        db.commit()
        print(f"[OK] {rev_count} reviews seeded")

        # ── Promo codes ────────────────────────────────────────────
        promos_data = [
            ("TAILORYY10", "percent", 10,  0,     100),
            ("FIRST20",    "percent", 20, 2000,    50),
            ("UPCYCLE15",  "percent", 15,  0,      75),
        ]
        promo_count = 0
        for code, ptype, value, min_order, max_uses in promos_data:
            if not db.query(PromoCode).filter(PromoCode.code == code).first():
                db.add(PromoCode(
                    id=str(uuid.uuid4()),
                    code=code,
                    type=ptype,
                    value=float(value),
                    min_order=float(min_order),
                    max_uses=max_uses,
                    is_active=True,
                    expires_at=datetime.utcnow() + timedelta(days=365),
                ))
                promo_count += 1
        db.commit()
        print(f"[OK] {promo_count} promo codes seeded")

        # ── Sample conversation ────────────────────────────────────
        db.expire_all()
        customer1 = db.query(User).filter(User.email == "priya.sharma@gmail.com").first()
        admin_u   = db.query(User).filter(User.email == "admin@tailoryy.com").first()
        if customer1 and admin_u:
            conv = db.query(Conversation).filter(Conversation.customer_id == customer1.id).first()
            if not conv:
                conv = Conversation(id=str(uuid.uuid4()), customer_id=customer1.id)
                db.add(conv)
                db.commit()
                db.refresh(conv)

            existing_msgs = db.query(Message).filter(Message.sender_id == customer1.id).count()
            if existing_msgs == 0:
                msgs = [
                    (customer1.id, admin_u.id, "Hi! I'd like to know more about getting a bridal lehenga stitched. Can you help?"),
                    (admin_u.id, customer1.id, "Hello Priya! Of course, we'd love to help you create your dream bridal lehenga. Could you tell us your preferred colours and any inspiration images you have?"),
                    (customer1.id, admin_u.id, "I'm thinking deep red and gold with heavy zari work. I'll upload some Pinterest images with the order form!"),
                ]
                for sender, recip, content in msgs:
                    db.add(Message(
                        id=str(uuid.uuid4()),
                        sender_id=sender,
                        recipient_id=recip,
                        content=content,
                    ))
                db.commit()
                print("[OK] Sample conversation seeded")

        print("\n[OK] Database seeding complete!")
        print("   Admin:    admin@tailoryy.com / Admin@123")
        print("   Customer: priya.sharma@gmail.com / Customer@123")

    except Exception as e:
        db.rollback()
        print(f"[FAIL] Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
