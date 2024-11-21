# backend/models/dropdown_options.py
from datetime import datetime
from ..extensions import db

class DropdownOption(db.Model):
    __tablename__ = 'dropdown_options'
    
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(100), nullable=False)  # e.g., 'category', 'وحدة القياس', etc.
    value = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category,
            'value': self.value
        }
    
