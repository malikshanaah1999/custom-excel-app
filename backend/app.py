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
from sqlalchemy.exc import IntegrityError
import os
import urllib.parse
import unicodedata
from sqlalchemy import text
from urllib.parse import unquote
if os.environ.get('ENVIRONMENT') == 'production':
    from models import (
        ProductCategory,
        Classification,
        ProductClassificationTag,
        MeasurementUnit,
        ProductSource,
        Sheet
    )
    from extensions import db
else:
    from backend.models import (
        ProductCategory,
        Classification,
        ProductClassificationTag,
        MeasurementUnit,
        ProductSource,
        Sheet
    )
    from backend.extensions import db


## Configure logging
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
# Database Configuration
database_url = os.environ.get('DATABASE_URL', 'postgresql://custom_excel_user:69Ncf6Uo7XjeyvTq10tWEat7SSXNgQs5@dpg-cssok43tq21c73a38p0g-a.oregon-postgres.render.com/myexcel')
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSON_ENSURE_ASCII'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_size': 5,
    'pool_timeout': 30,
    'pool_recycle': 1800,
}

# After database configuration and before app routes
@app.before_request
def log_request_info():
    logger.debug('Database URL: %s', app.config['SQLALCHEMY_DATABASE_URI'])
    try:
        # Test database connection
        with app.app_context():
            db.session.execute('SELECT 1')
            logger.info('Database connection successful')
    except Exception as e:
        logger.error('Database connection failed: %s', str(e))
        logger.error('Full error: %s', traceback.format_exc())



# Initialize the database connection
db.init_app(app)

# Create tables if they don't exist
with app.app_context():
    try:
        db.create_all()
        # Run seed script if INIT_DB is true
        if os.environ.get('INIT_DB') == 'true':
            from seed import seed_dropdown_options
            seed_dropdown_options()
    except Exception as e:
        print(f"Database initialization error: {str(e)}")

# Initialize SQLAlchemy
db.init_app(app)
app.app_context().push()
CORS(app, resources={r"/*": {"origins": "*"}})
app.wsgi_app = ProxyFix(app.wsgi_app)

CATEGORY_MAPPING = {
    'فئة المنتج': {'model': ProductCategory, 'parent': None},
    'التصنيف': {'model': Classification, 'parent': ProductCategory},
    'علامات تصنيف المنتج': {'model': ProductClassificationTag, 'parent': ProductCategory},
    'وحدة القياس': {'model': MeasurementUnit, 'parent': None},
    'مصدر المنتج': {'model': ProductSource, 'parent': None},
}

@app.route('/')
def index():
    """Root endpoint to verify API is running"""
    return jsonify({
        "status": "success",
        "message": "API is running",
        "version": "1.0"
    })

@app.route('/test/db-status')
def test_db_status():
    try:
        # Test connection
        db.session.execute('SELECT 1')
        
        # Get table counts
        stats = {
            'product_categories': db.session.query(ProductCategory).count(),
            'classifications': db.session.query(Classification).count(),
            'product_tags': db.session.query(ProductClassificationTag).count(),
            'measurement_units': db.session.query(MeasurementUnit).count(),
            'product_sources': db.session.query(ProductSource).count()
        }
        
        # Get sample data
        sample_category = db.session.query(ProductCategory).first()
        
        return jsonify({
            "status": "success",
            "database_connected": True,
            "table_counts": stats,
            "sample_category": sample_category.name if sample_category else None
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e),
            "traceback": traceback.format_exc()
        }), 500

@app.route('/test/db')
def test_db():
    try:
        # Test basic connection
        db.session.execute('SELECT 1')
        
        # Test categories
        categories = ProductCategory.query.all()
        categories_list = [{"id": c.id, "name": c.name} for c in categories]
        
        # Test classifications
        classifications = Classification.query.join(ProductCategory).filter(
            ProductCategory.name == 'All / ماركت'
        ).all()
        classifications_list = [{"id": c.id, "name": c.name} for c in classifications]
        
        return jsonify({
            "status": "success",
            "database_url": app.config['SQLALCHEMY_DATABASE_URI'],
            "categories_count": len(categories_list),
            "classifications_count": len(classifications_list),
            "sample_categories": categories_list[:5],
            "sample_classifications": classifications_list[:5]
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

# Test specific dropdown endpoint
@app.route('/test/dropdown/<category>')
def test_dropdown(category):
    try:
        logger.info(f"Testing dropdown for category: {category}")
        category_info = CATEGORY_MAPPING.get(category)
        
        if not category_info:
            return jsonify({'error': f'Invalid category: {category}'})
        
        model = category_info['model']
        parent_model = category_info['parent']
        
        # Get parent category from query params if it exists
        logger.info(f"Received category: {category}")
        parent_category = request.args.get('parent_category')
        if parent_category:
            parent_category = unquote(parent_category)
            logger.info(f"Received parent_category: {parent_category}")

        
        if parent_model and parent_category:
            parent = parent_model.query.filter_by(name=parent_category).first()
            if parent:
                options = model.query.filter_by(category_id=parent.id).all()
            else:
                options = []
        else:
            options = model.query.all()
        
        return jsonify({
            "status": "success",
            "category": category,
            "parent_category": parent_category,
            "count": len(options),
            "options": [{"id": opt.id, "name": opt.name} for opt in options]
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500
    
# backend/app.py
# Make sure these endpoints exist

@app.route('/admin/measurement-units', methods=['GET'])
def get_measurement_units():
    try:
        units = MeasurementUnit.query.all()
        return jsonify([{
            'id': unit.id,
            'name': unit.name
        } for unit in units])
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/admin/measurement-units', methods=['POST'])
def add_measurement_unit():
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        
        if not name:
            return jsonify({
                'status': 'error',
                'message': 'Name is required'
            }), 400

        unit = MeasurementUnit(name=name)
        db.session.add(unit)
        db.session.commit()

        return jsonify({
            'status': 'success',
            'id': unit.id,
            'name': unit.name
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/admin/product-sources', methods=['GET'])
def get_product_sources():
    try:
        sources = ProductSource.query.all()
        return jsonify([{
            'id': source.id,
            'name': source.name
        } for source in sources])
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
@app.route('/admin/measurement-units/validate', methods=['POST'])
def validate_measurement_unit():
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        existing = MeasurementUnit.query.filter_by(name=name).first()
        
        return jsonify({
            'isValid': existing is None
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
@app.route('/admin/product-sources/validate', methods=['POST'])
def validate_product_source():
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        exclude_id = data.get('excludeId')  # For edit validation
        
        if not name:
            return jsonify({
                'isValid': False,
                'message': 'Name is required'
            }), 400

        # Build query
        query = ProductSource.query.filter_by(name=name)
        
        # If we're editing, exclude the current item
        if exclude_id:
            query = query.filter(ProductSource.id != exclude_id)
            
        existing = query.first()
        
        return jsonify({
            'isValid': existing is None,
            'message': 'Product source already exists' if existing else None
        })
    except Exception as e:
        logger.error(f"Error validating product source: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
@app.route('/admin/product-sources', methods=['POST'])
def add_product_source():
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        
        if not name:
            return jsonify({
                'status': 'error',
                'message': 'Name is required'
            }), 400

        source = ProductSource(name=name)
        db.session.add(source)
        db.session.commit()

        return jsonify({
            'status': 'success',
            'id': source.id,
            'name': source.name
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
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
# Also modify your get_sheets route to add more logging
@app.route('/sheets', methods=['GET'])
def get_sheets():
    try:
        search_term = request.args.get('search', '')
        logger.info(f"Fetching sheets with search term: {search_term}")
        
        # Add debug logging
        logger.debug('Testing database connection...')
        db.session.execute('SELECT 1')
        logger.debug('Database connection successful')
        
        query = Sheet.query
        logger.debug('Created query object')

        if search_term:
            query = query.filter(Sheet.name.ilike(f'%{search_term}%'))
            logger.debug('Added search filter')

        sheets = query.order_by(Sheet.updated_at.desc()).all()
        logger.debug(f'Retrieved {len(sheets)} sheets')
        
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
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return jsonify({
            "status": "error",
            "message": "خطأ في جلب البيانات",
            "debug_info": str(e)  # Add this in development, remove in production
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
    category = unquote(category)
    try:
        logger.info(f"Fetching options for category: {category}")
        category_info = CATEGORY_MAPPING.get(category)
        
        if not category_info:
            logger.warning(f"Category not found in mapping: {category}")
            return jsonify({'error': 'Invalid category'}), 400
        
        model = category_info['model']
        parent_model = category_info['parent']
        
        # Add debug logging
        logger.info(f"Using model: {model.__name__}")
        
        try:
            # Test database connection
            db.session.execute('SELECT 1')
            logger.info("Database connection is alive")
        except Exception as e:
            logger.error(f"Database connection error: {str(e)}")
            return jsonify({"status": "error", "message": "Database connection error"}), 500

        if parent_model:
            parent_category = request.args.get('parent_category')
            if parent_category:
                parent_category = unquote(parent_category)
                logger.info(f"Looking up parent category: {parent_category}")
                
                parent = parent_model.query.filter_by(name=parent_category).first()
                if parent:
                    logger.info(f"Found parent with ID: {parent.id}")
                    options = model.query.filter_by(category_id=parent.id).all()
                else:
                    logger.warning(f"Parent category not found: {parent_category}")
                    options = []
            else:
                options = []
        else:
            options = model.query.all()
        
        result = [{'id': opt.id, 'value': opt.name} for opt in options]
        logger.info(f"Returning {len(result)} options")
        return jsonify(result)

    except Exception as e:
        logger.error(f"Error in dropdown_options: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
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
    
# backend/app.py

@app.route('/admin/categories/<int:category_id>/classifications', methods=['GET'])
def get_category_classifications(category_id):
    try:
        classifications = Classification.query.filter_by(category_id=category_id).all()
        return jsonify([{
            'id': c.id,
            'name': c.name
        } for c in classifications])
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/admin/categories/<int:category_id>/classifications', methods=['POST'])
def add_classification(category_id):
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        
        if not name:
            return jsonify({
                'status': 'error',
                'message': 'Name is required'
            }), 400

        classification = Classification(
            name=name,
            category_id=category_id
        )
        db.session.add(classification)
        db.session.commit()

        return jsonify({
            'status': 'success',
            'id': classification.id,
            'name': classification.name
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/admin/categories/<int:category_id>/tags', methods=['GET'])
def get_category_tags(category_id):
    try:
        tags = ProductClassificationTag.query.filter_by(category_id=category_id).all()
        return jsonify([{
            'id': t.id,
            'name': t.name
        } for t in tags])
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/admin/categories/<int:category_id>/tags', methods=['POST'])
def add_tag(category_id):
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        
        if not name:
            return jsonify({
                'status': 'error',
                'message': 'Name is required'
            }), 400

        tag = ProductClassificationTag(
            name=name,
            category_id=category_id
        )
        db.session.add(tag)
        db.session.commit()

        return jsonify({
            'status': 'success',
            'id': tag.id,
            'name': tag.name
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    
# backend/app.py
# Add these endpoints for classifications and tags

# Classifications endpoints
@app.route('/admin/classifications/<int:classification_id>', methods=['PUT'])
def update_classification(classification_id):
    try:
        classification = Classification.query.get_or_404(classification_id)
        data = request.get_json()
        name = data.get('name', '').strip()
        
        if not name:
            return jsonify({
                'status': 'error',
                'message': 'اسم التصنيف مطلوب'
            }), 400

        # Check if name already exists in the same category
        existing = Classification.query.filter(
            Classification.name == name,
            Classification.category_id == classification.category_id,
            Classification.id != classification_id
        ).first()
        
        if existing:
            return jsonify({
                'status': 'error',
                'message': 'يوجد تصنيف بنفس الاسم'
            }), 409

        classification.name = name
        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': 'تم تحديث التصنيف بنجاح'
        })

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating classification: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'فشل في تحديث التصنيف'
        }), 500

@app.route('/admin/classifications/<int:classification_id>', methods=['DELETE'])
def delete_classification(classification_id):
    try:
        logger.info(f"Attempting to delete classification {classification_id}")
        classification = Classification.query.get_or_404(classification_id)
        
        db.session.delete(classification)
        db.session.commit()
        logger.info(f"Successfully deleted classification {classification_id}")

        return jsonify({
            'status': 'success',
            'message': 'تم حذف التصنيف بنجاح'
        })

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting classification: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': 'فشل في حذف التصنيف'
        }), 500

# Tags endpoints
@app.route('/admin/tags/<int:tag_id>', methods=['PUT'])
def update_tag(tag_id):
    try:
        tag = ProductClassificationTag.query.get_or_404(tag_id)
        data = request.get_json()
        name = data.get('name', '').strip()
        
        if not name:
            return jsonify({
                'status': 'error',
                'message': 'اسم العلامة مطلوب'
            }), 400

        # Check if name already exists in the same category
        existing = ProductClassificationTag.query.filter(
            ProductClassificationTag.name == name,
            ProductClassificationTag.category_id == tag.category_id,
            ProductClassificationTag.id != tag_id
        ).first()
        
        if existing:
            return jsonify({
                'status': 'error',
                'message': 'توجد علامة بنفس الاسم'
            }), 409

        tag.name = name
        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': 'تم تحديث العلامة بنجاح'
        })

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating tag: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'فشل في تحديث العلامة'
        }), 500
@app.route('/admin/classifications/validate', methods=['POST'])
def validate_classification():
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        category_id = data.get('categoryId')
        exclude_id = data.get('excludeId')
        
        # Check if name exists
        if not name:
            return jsonify({
                'isValid': False,
                'message': 'Name is required'
            })

        # Build query with category filter
        query = Classification.query.filter_by(
            name=name,
            category_id=category_id
        )
        
        # If editing, exclude current classification
        if exclude_id:
            query = query.filter(Classification.id != exclude_id)
            
        existing = query.first()
        
        return jsonify({
            'isValid': existing is None
        })
    except Exception as e:
        logger.error(f"Error validating classification: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/admin/tags/validate', methods=['POST'])
def validate_tag():
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        category_id = data.get('categoryId')
        exclude_id = data.get('excludeId')
        
        if not name:
            return jsonify({
                'isValid': False,
                'message': 'Name is required'
            })

        query = ProductClassificationTag.query.filter_by(
            name=name,
            category_id=category_id  
        )
        
        if exclude_id:
            query = query.filter(ProductClassificationTag.id != exclude_id)
            
        existing = query.first()
        
        return jsonify({
            'isValid': existing is None
        })
    except Exception as e:
        logger.error(f"Error validating tag: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/admin/classifications/<int:classification_id>/check-usage', methods=['GET'])
def check_classification_usage(classification_id):
    try:
        classification = Classification.query.get_or_404(classification_id)
        from sqlalchemy import cast, String
        
        # Check if classification is used in any sheets
        is_in_use = Sheet.query.filter(
            cast(Sheet.data, String).ilike(f'%{classification.name}%')
        ).first() is not None
        
        logger.info(f"Checking usage for classification {classification.name} (ID: {classification_id}): {is_in_use}")
        
        return jsonify({
            'isInUse': is_in_use
        })
    except Exception as e:
        logger.error(f"Error checking classification usage: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/admin/tags/<int:tag_id>/check-usage', methods=['GET'])  
def check_tag_usage(tag_id):
    try:
        tag = ProductClassificationTag.query.get_or_404(tag_id)
        from sqlalchemy import cast, String
        
        # Check if tag is used in any sheets
        is_in_use = Sheet.query.filter(
            cast(Sheet.data, String).ilike(f'%{tag.name}%')
        ).first() is not None
        
        logger.info(f"Checking usage for tag {tag.name} (ID: {tag_id}): {is_in_use}")
        
        return jsonify({
            'isInUse': is_in_use
        })
    except Exception as e:
        logger.error(f"Error checking tag usage: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
@app.route('/admin/tags/<int:tag_id>', methods=['DELETE'])
def delete_tag(tag_id):
    try:
        logger.info(f"Attempting to delete tag {tag_id}")
        tag = ProductClassificationTag.query.get_or_404(tag_id)
        
        db.session.delete(tag)
        db.session.commit()
        logger.info(f"Successfully deleted tag {tag_id}")

        return jsonify({
            'status': 'success',
            'message': 'تم حذف العلامة بنجاح'
        })

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting tag: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': 'فشل في حذف العلامة'
        }), 500
# backend/app.py
# Add these new routes
@app.route('/admin/measurement-units/<int:unit_id>', methods=['PUT'])
def update_measurement_unit(unit_id):
    try:
        logger.info(f"Attempting to update measurement unit {unit_id}")
        unit = MeasurementUnit.query.get_or_404(unit_id)
        data = request.get_json()
        name = data.get('name', '').strip()
        
        if not name:
            return jsonify({
                'status': 'error',
                'message': 'اسم وحدة القياس مطلوب'
            }), 400

        # Check if name exists for another unit
        existing = MeasurementUnit.query.filter(
            MeasurementUnit.name == name,
            MeasurementUnit.id != unit_id
        ).first()
        
        if existing:
            return jsonify({
                'status': 'error',
                'message': 'وحدة القياس موجودة مسبقاً'
            }), 409

        unit.name = name
        db.session.commit()
        logger.info(f"Successfully updated measurement unit {unit_id}")

        return jsonify({
            'status': 'success',
            'message': 'تم تحديث وحدة القياس بنجاح'
        })

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating measurement unit: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': 'فشل في تحديث وحدة القياس'
        }), 500

@app.route('/admin/measurement-units/<int:unit_id>', methods=['DELETE'])
def delete_measurement_unit(unit_id):
    try:
        logger.info(f"Attempting to delete measurement unit {unit_id}")
        unit = MeasurementUnit.query.get_or_404(unit_id)
        
        db.session.delete(unit)
        db.session.commit()
        logger.info(f"Successfully deleted measurement unit {unit_id}")

        return jsonify({
            'status': 'success',
            'message': 'تم حذف وحدة القياس بنجاح'
        })

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting measurement unit: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': 'فشل في حذف وحدة القياس'
        }), 500

    

# Similar endpoints for ProductSources
@app.route('/admin/product-sources/<int:source_id>', methods=['PUT'])
def update_product_source(source_id):
    try:
        logger.info(f"Attempting to update product source {source_id}")
        source = ProductSource.query.get_or_404(source_id)
        data = request.get_json()
        name = data.get('name', '').strip()
        
        if not name:
            return jsonify({
                'status': 'error',
                'message': 'اسم مصدر المنتج مطلوب'
            }), 400

        # Check if name exists for another source
        existing = ProductSource.query.filter(
            ProductSource.name == name,
            ProductSource.id != source_id
        ).first()
        
        if existing:
            return jsonify({
                'status': 'error',
                'message': 'مصدر المنتج موجود مسبقاً'
            }), 409

        source.name = name
        db.session.commit()
        logger.info(f"Successfully updated product source {source_id}")

        return jsonify({
            'status': 'success',
            'message': 'تم تحديث مصدر المنتج بنجاح'
        })

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating product source: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': 'فشل في تحديث مصدر المنتج'
        }), 500

@app.route('/admin/product-sources/<int:source_id>', methods=['DELETE'])
def delete_product_source(source_id):
    try:
        logger.info(f"Attempting to delete product source {source_id}")
        source = ProductSource.query.get_or_404(source_id)

        db.session.delete(source)
        db.session.commit()
        logger.info(f"Successfully deleted product source {source_id}")

        return jsonify({
            'status': 'success',
            'message': 'تم حذف مصدر المنتج بنجاح'
        })

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting product source: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': 'فشل في حذف مصدر المنتج'
        }), 500
@app.route('/admin/categories', methods=['GET'])
def get_categories():
    try:
        categories = ProductCategory.query.all()
        return jsonify([{
            'id': category.id,
            'name': category.name
        } for category in categories])
    except Exception as e:
        logger.error(f"Error fetching categories: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to fetch categories'
        }), 500

@app.route('/admin/categories', methods=['POST'])
def add_category():
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        
        if not name:
            return jsonify({
                'status': 'error',
                'message': 'Category name is required'
            }), 400

        # Check if category already exists
        existing = ProductCategory.query.filter_by(name=name).first()
        if existing:
            return jsonify({
                'status': 'error',
                'message': 'Category already exists'
            }), 409

        new_category = ProductCategory(name=name)
        db.session.add(new_category)
        db.session.commit()

        return jsonify({
            'status': 'success',
            'id': new_category.id,
            'name': new_category.name
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error adding category: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to add category'
        }), 500

@app.route('/admin/categories/<int:category_id>', methods=['PUT'])
def update_category(category_id):
    try:
        category = ProductCategory.query.get_or_404(category_id)
        data = request.get_json()
        name = data.get('name', '').strip()
        
        if not name:
            return jsonify({
                'status': 'error',
                'message': 'Category name is required'
            }), 400

        # Check if new name already exists for different category
        existing = ProductCategory.query.filter(
            ProductCategory.name == name,
            ProductCategory.id != category_id
        ).first()
        if existing:
            return jsonify({
                'status': 'error',
                'message': 'Category name already exists'
            }), 409

        category.name = name
        db.session.commit()

        return jsonify({
            'status': 'success',
            'id': category.id,
            'name': category.name
        })

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating category: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to update category'
        }), 500

@app.route('/admin/categories/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    try:
        category = ProductCategory.query.get_or_404(category_id)
        
        # Check for related records
        if category.classifications or category.product_tags:
            return jsonify({
                'status': 'error',
                'message': 'Cannot delete category with existing classifications or tags'
            }), 400

        db.session.delete(category)
        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': 'Category deleted successfully'
        })

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting category: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to delete category'
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
# At the bottom of app.py
if __name__ == '__main__':
    if os.environ.get('INIT_DB') == 'true':
        with app.app_context():
            init_db()
            # Also run your seed script
            from seed import seed_dropdown_options
            seed_dropdown_options()
    
    # Start Flask application
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
