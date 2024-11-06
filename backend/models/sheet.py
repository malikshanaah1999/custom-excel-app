from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Sheet(db.Model):
    __tablename__ = 'sheets'
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.JSON)  # Stores the entire sheet data as JSON

    def __init__(self, data):
        self.data = data
