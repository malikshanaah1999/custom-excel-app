from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Sheet(db.Model):
    __tablename__ = 'sheets'
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.JSON)  # Stores the entire sheet data as JSON
    # New columns
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    record_count = db.Column(db.Integer, default=0)  # To track number of records

    # In models/sheet.py

    def __init__(self, name, data=None, description=None):
        self.name = name
        self.data = data if data is not None else [["" for _ in range(17)]]  # Default empty row
        self.description = description
        self.record_count = len(self.data) if self.data else 0
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        
    def to_dict(self):  # Also add this method for serialization
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'data': self.data,
            'record_count': self.record_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
    }
