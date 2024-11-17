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
from dotenv import load_dotenv
from sqlalchemy.exc import IntegrityError
from backend.models.dropdown_options import DropdownOption
from backend.models.sheet import Sheet
from backend.extensions import db

# Load environment variables
load_dotenv()

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

# Initialize Flask app
app = Flask(__name__)

# Database Configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:TiKelam1999#@localhost/custom_excel_db')

# Handle Render's postgres:// vs postgresql:// URL scheme
if DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

# For production on Render
if os.getenv('RENDER'):
    DATABASE_URL = "postgresql://custom_excel_user:69Ncf6Uo7XjeyvTq21c73a38p0g-a.frankfurt-postgres.render.com/myexcel"

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSON_ENSURE_ASCII'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_size': 10,
    'pool_timeout': 30,
    'pool_recycle': 1800,
}

# Initialize SQLAlchemy
db.init_app(app)
app.app_context().push()

# Configure CORS
if os.getenv('RENDER'):
    # In production, specify your frontend URL
    CORS(app, resources={r"/*": {"origins": "https://your-frontend-url.onrender.com"}})
else:
    # In development, allow all origins
    CORS(app, resources={r"/*": {"origins": "*"}})

app.wsgi_app = ProxyFix(app.wsgi_app)

@app.route('/')
def index():
    """Root endpoint to verify API is running"""
    return jsonify({
        "status": "success",
        "message": "API is running",
        "version": "1.0"
    })

@app.route('/save/<int:sheet_id>', methods=['POST'])
def save_data(sheet_id):
    try:
        sheet = Sheet.query.get_or_404(sheet_id)
        content = request.get_json(force=True)
        
        if not content or 'data' not in content:
            return jsonify({
                "status": "error",
                "message": "No data provided"
            }), 400

        # Update sheet data
        sheet.data = content['data']
        sheet.record_count = len(content['data'])
        sheet.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": "Data saved successfully",
            "id": sheet.id,
            "updated_at": sheet.updated_at.isoformat()
        }), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error saving data: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Failed to save data",
            "error": str(e)
        }), 500

# Get all sheets (for landing page)
@app.route('/sheets', methods=['GET'])
def get_sheets():
    try:
        search_term = request.args.get('search', '')
        logger.info(f"Fetching sheets with search term: {search_term}")
        
        query = Sheet.query

        if search_term:
            query = query.filter(Sheet.name.ilike(f'%{search_term}%'))

        sheets = query.order_by(Sheet.updated_at.desc()).all()
        
        # Return empty array instead of error when no sheets found
        return jsonify({
            "status": "success",
            "sheets": [{
                "id": sheet.id,
                "name": sheet.name,
                "description": sheet.description,
                "record_count": sheet.record_count,
                "created_at": sheet.created_at.isoformat() if sheet.created_at else None,
                "updated_at": sheet.updated_at.isoformat() if sheet.updated_at else None
            } for sheet in sheets] if sheets else []
        }), 200

    except Exception as e:
        logger.error(f"Error fetching sheets: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "خطأ في جلب البيانات"
        }), 500

# Create new sheet
@app.route('/sheets', methods=['POST'])
def create_sheet():
    try:
        content = request.get_json(force=True)
        logger.info(f"Received sheet creation request: {content}")
        
        if not content.get('name'):
            logger.warning("Sheet creation failed: No name provided")
            return jsonify({
                "status": "error",
                "message": "اسم الجدول مطلوب"
            }), 400

        # Check if name already exists
        existing_sheet = Sheet.query.filter(Sheet.name == content['name'].strip()).first()
        if existing_sheet:
            return jsonify({
                "status": "error",
                "message": "هذا الاسم مستخدم بالفعل"
            }), 409  # 409 Conflict

        new_sheet = Sheet(
            name=content['name'],
            description=content.get('description', ''),
            data=[["" for _ in range(17)]]
        )
        
        try:
            db.session.add(new_sheet)
            db.session.commit()
            logger.info(f"Sheet created successfully with ID: {new_sheet.id}")

            return jsonify({
                "status": "success",
                "message": "تم إنشاء الجدول بنجاح",
                "id": new_sheet.id,
                "name": new_sheet.name,
                "description": new_sheet.description
            }), 201

        except IntegrityError as e:
            db.session.rollback()
            logger.error(f"Integrity error during sheet creation: {str(e)}")
            return jsonify({
                "status": "error",
                "message": "هذا الاسم مستخدم بالفعل"
            }), 409

        except Exception as db_error:
            db.session.rollback()
            logger.error(f"Database error during sheet creation: {str(db_error)}")
            return jsonify({
                "status": "error",
                "message": "خطأ في قاعدة البيانات"
            }), 500

    except Exception as e:
        logger.error(f"Error creating sheet: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "فشل في إنشاء الجدول"
        }), 500

# Delete sheet
@app.route('/sheets/<int:sheet_id>', methods=['DELETE'])
def delete_sheet(sheet_id):
    try:
        sheet = Sheet.query.get_or_404(sheet_id)
        db.session.delete(sheet)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Sheet deleted successfully"
        }), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting sheet: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Failed to delete sheet"
        }), 500

@app.route('/data/<int:sheet_id>', methods=['GET'])
def get_data(sheet_id):
    try:
        sheet = Sheet.query.get_or_404(sheet_id)
        return jsonify({
            "status": "success",
            "message": "Data retrieved successfully",
            "data": sheet.data,
            "id": sheet.id,
            "name": sheet.name,
            "description": sheet.description,
            "updated_at": sheet.updated_at.isoformat()
        }), 200
    except Exception as e:
        logger.error(f"Error retrieving data: {str(e)}")
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

@app.route('/sheets/<int:sheet_id>', methods=['PATCH'])
def update_sheet(sheet_id):
    try:
        sheet = Sheet.query.get_or_404(sheet_id)
        content = request.get_json(force=True)
        
        if 'name' in content:
            new_name = content['name'].strip()
            if not new_name:
                return jsonify({
                    "status": "error",
                    "message": "اسم الجدول مطلوب"
                }), 400
                
            # Check if name already exists for different sheet
            existing_sheet = Sheet.query.filter(
                Sheet.name == new_name,
                Sheet.id != sheet_id
            ).first()
            if existing_sheet:
                return jsonify({
                    "status": "error",
                    "message": "هذا الاسم مستخدم بالفعل"
                }), 409

            sheet.name = new_name
            
        if 'description' in content:
            sheet.description = content['description']
            
        sheet.updated_at = datetime.utcnow()
        
        try:
            db.session.commit()
            logger.info(f"Sheet updated successfully with ID: {sheet.id}")

            return jsonify({
                "status": "success",
                "message": "تم تحديث الجدول بنجاح",
                "id": sheet.id,
                "name": sheet.name,
                "description": sheet.description
            }), 200

        except IntegrityError as e:
            db.session.rollback()
            logger.error(f"Integrity error during sheet update: {str(e)}")
            return jsonify({
                "status": "error",
                "message": "هذا الاسم مستخدم بالفعل"
            }), 409

        except Exception as db_error:
            db.session.rollback()
            logger.error(f"Database error during sheet update: {str(db_error)}")
            return jsonify({
                "status": "error",
                "message": "خطأ في قاعدة البيانات"
            }), 500

    except Exception as e:
        logger.error(f"Error updating sheet: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "فشل في تحديث الجدول"
        }), 500

@app.route('/api/dropdown-options/<category>', methods=['GET'])
def get_dropdown_options(category):
    if not category:
        return jsonify([])
        
    try:
        options = DropdownOption.query.filter_by(category=category).all()
        return jsonify([{
            'id': option.id,
            'value': option.value,
            'label': option.value
        } for option in options])
    except Exception as e:
        logger.error(f"Error fetching dropdown options: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/dropdown-options/<category>', methods=['POST'])
def add_dropdown_option(category):
    try:
        data = request.get_json()
        value = data.get('value')
        if not value:
            return jsonify({
                "status": "error",
                "message": "Value is required"
            }), 400

        new_option = DropdownOption(category=category, value=value)
        db.session.add(new_option)
        db.session.commit()

        return jsonify({
            "status": "success",
            "option": new_option.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/dropdown-options/<int:option_id>', methods=['PUT'])
def update_dropdown_option(option_id):
    try:
        option = DropdownOption.query.get_or_404(option_id)
        data = request.get_json()
        
        if 'value' in data:
            option.value = data['value']
            option.updated_at = datetime.utcnow()
            
        db.session.commit()
        return jsonify({
            "status": "success",
            "option": option.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/dropdown-options/<int:option_id>', methods=['DELETE'])
def delete_dropdown_option(option_id):
    try:
        option = DropdownOption.query.get_or_404(option_id)
        db.session.delete(option)
        db.session.commit()
        return jsonify({
            "status": "success",
            "message": "Option deleted successfully"
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": str(e)
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
