from flask import Flask, jsonify, request, Response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix
import logging
from datetime import datetime
import json
import traceback
from logging.handlers import RotatingFileHandler
import os

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Add file handler for logging
if not os.path.exists('logs'):
    os.makedirs('logs')
file_handler = RotatingFileHandler('logs/app.log', maxBytes=10240, backupCount=10)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
))
file_handler.setLevel(logging.INFO)
logger.addHandler(file_handler)

app = Flask(__name__)
CORS(app)
app.wsgi_app = ProxyFix(app.wsgi_app)

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:TiKelam1999#@localhost/custom_excel_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSON_ENSURE_ASCII'] = False  # Ensures proper handling of Arabic characters
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_size': 10,
    'pool_timeout': 30,
    'pool_recycle': 1800,
}

# Initialize SQLAlchemy
db = SQLAlchemy(app)

class Sheet(db.Model):
    __tablename__ = 'sheets'
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.JSON, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, data):
        self.data = data

    def to_dict(self):
        return {
            'id': self.id,
            'data': self.data,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

@app.route('/')
def index():
    """Root endpoint to verify API is running"""
    return jsonify({
        "status": "success",
        "message": "API is running",
        "version": "1.0"
    })

@app.route('/save', methods=['POST'])
def save_data():
    """Save spreadsheet data to database"""
    try:
        content = request.get_json(force=True)
        if not content or 'data' not in content:
            logger.error("No data provided in request")
            return jsonify({
                "status": "error",
                "message": "No data provided"
            }), 400

        data = content['data']
        
        # Clean and validate data
        cleaned_data = []
        for row in data:
            if row and any(str(cell).strip() for cell in row):  # Only include non-empty rows
                padded_row = row[:17]  # Limit to 17 columns
                # Ensure all cells are strings and properly encoded
                padded_row = [str(cell).strip() if cell is not None else '' for cell in padded_row]
                while len(padded_row) < 17:
                    padded_row.append('')
                cleaned_data.append(padded_row)

        try:
            # Begin transaction
            db.session.begin_nested()
            
            # Clear previous data
            Sheet.query.delete()
            
            # Create new sheet
            new_sheet = Sheet(data=cleaned_data)
            db.session.add(new_sheet)
            
            # Commit transaction
            db.session.commit()
            
            logger.info(f"Data saved successfully with ID: {new_sheet.id}")
            return jsonify({
                "status": "success",
                "message": "Data saved successfully",
                "id": new_sheet.id,
                "timestamp": new_sheet.timestamp.isoformat()
            }), 200

        except Exception as db_error:
            db.session.rollback()
            logger.error(f"Database error: {str(db_error)}")
            raise

    except Exception as e:
        logger.error(f"Error saving data: {str(e)}\n{traceback.format_exc()}")
        return jsonify({
            "status": "error",
            "message": "Failed to save data",
            "error": str(e)
        }), 500

@app.route('/data', methods=['GET'])
def get_data():
    """Retrieve latest spreadsheet data"""
    try:
        latest_sheet = Sheet.query.order_by(Sheet.timestamp.desc()).first()
        
        if latest_sheet:
            # Ensure proper encoding of Arabic text
            return jsonify({
                "status": "success",
                "message": "Data retrieved successfully",
                "data": latest_sheet.data,
                "id": latest_sheet.id,
                "timestamp": latest_sheet.timestamp.isoformat()
            }), 200
        
        return jsonify({
            "status": "success",
            "message": "No data found",
            "data": [["" for _ in range(17)]]
        }), 200
    
    except Exception as e:
        logger.error(f"Error retrieving data: {str(e)}\n{traceback.format_exc()}")
        return jsonify({
            "status": "error",
            "message": "Failed to retrieve data",
            "error": str(e)
        }), 500

@app.route('/delete-row/<int:row_index>', methods=['DELETE'])
def delete_row(row_index):
    """Delete a specific row from the spreadsheet"""
    try:
        latest_sheet = Sheet.query.order_by(Sheet.timestamp.desc()).first()
        if not latest_sheet:
            return jsonify({
                "status": "error",
                "message": "No data found"
            }), 404

        current_data = latest_sheet.data
        if 0 <= row_index < len(current_data):
            # Remove the row at the specified index
            current_data.pop(row_index)
            
            # Filter out empty rows
            current_data = [row for row in current_data if any(str(cell).strip() for cell in row)]
            
            try:
                # Begin transaction
                db.session.begin_nested()
                
                # Clear previous data and save updated data
                Sheet.query.delete()
                new_sheet = Sheet(data=current_data)
                db.session.add(new_sheet)
                
                # Commit transaction
                db.session.commit()
                
                return jsonify({
                    "status": "success",
                    "message": "Row deleted successfully",
                    "data": current_data
                }), 200
            
            except Exception as db_error:
                db.session.rollback()
                logger.error(f"Database error during row deletion: {str(db_error)}")
                raise

        else:
            return jsonify({
                "status": "error",
                "message": "Invalid row index"
            }), 400

    except Exception as e:
        logger.error(f"Error deleting row: {str(e)}\n{traceback.format_exc()}")
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "Failed to delete row",
            "error": str(e)
        }), 500

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({
        "status": "error",
        "message": "Resource not found"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({
        "status": "error",
        "message": "Internal server error"
    }), 500

def init_db():
    """Initialize the database and create tables"""
    with app.app_context():
        try:
            db.create_all()
            logger.info("Database tables created successfully")
        except Exception as e:
            logger.error(f"Error creating database tables: {str(e)}\n{traceback.format_exc()}")
            raise

if __name__ == '__main__':
    # Initialize database
    init_db()
    
    # Start Flask application
    app.run(debug=True, host='127.0.0.1', port=5000)