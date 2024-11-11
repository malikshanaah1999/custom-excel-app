# backend/models/sheet.py

from datetime import datetime
from extensions import db

class Sheet(db.Model):
    __tablename__ = 'sheets'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    data = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)
    record_count = db.Column(db.Integer, default=0)

    def __init__(self, name, data=None, description=None):
        self.name = name
        self.data = data if data is not None else [["" for _ in range(17)]]
        self.description = description
        self.record_count = len(self.data) if self.data else 0
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'data': self.data,
            'record_count': self.record_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def update_data(self, data):
        self.data = data
        self.record_count = len(data)
        self.updated_at = datetime.utcnow()