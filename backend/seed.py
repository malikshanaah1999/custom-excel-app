# backend/seed.py
from app import app, db
from models import DropdownOption

def seed_dropdown_options():
    with app.app_context():
        # Clear existing options
        DropdownOption.query.delete()
        
        # Category options
        categories = ["All", "غذائية", "مشروبات غازية"]
        for value in categories:
            db.session.add(DropdownOption(category="category", value=value))
        
        # وحدة القياس options
        measurement_units = ["حبة", "كرتونة", "صندوق"]
        for value in measurement_units:
            db.session.add(DropdownOption(category="وحدة القياس", value=value))
        
        # التصنيف options
        classifications = ["زيت", "سيريلاك", "كوكاكولا"]
        for value in classifications:
            db.session.add(DropdownOption(category="التصنيف", value=value))
        
        # مصدر المنتج options
        sources = ["مورد محلي", "مستورد"]
        for value in sources:
            db.session.add(DropdownOption(category="مصدر المنتج", value=value))
        
        db.session.commit()

if __name__ == "__main__":
    seed_dropdown_options()