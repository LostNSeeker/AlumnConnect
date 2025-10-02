from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import sqlite3
import os
import json
import uuid
from datetime import datetime, timedelta

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

jwt = JWTManager(app)
CORS(app)

# Create uploads directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Add general request debugging
@app.before_request
def log_request_info():
    print(f"DEBUG: Incoming request: {request.method} {request.path}")
    print(f"DEBUG: Headers: {dict(request.headers)}")
    if request.method == 'POST':
        print(f"DEBUG: Body: {request.get_data(as_text=True)}")

# Helper function to get user ID from JWT identity
def get_user_id_from_jwt():
    identity = get_jwt_identity()
    return int(identity.replace('user_', ''))

# Add JWT error handler
@jwt.invalid_token_loader
def invalid_token_callback(error_string):
    print(f"DEBUG: Invalid token error: {error_string}")
    return jsonify({'error': f'Invalid token: {error_string}'}), 422

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print(f"DEBUG: Expired token")
    return jsonify({'error': 'Token has expired'}), 422

@jwt.unauthorized_loader
def missing_token_callback(error_string):
    print(f"DEBUG: Missing token error: {error_string}")
    return jsonify({'error': f'Missing token: {error_string}'}), 422

# Database initialization
def init_db():
    conn = sqlite3.connect('launchpad.db')
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('student', 'alumni')),
            graduation_year INTEGER,
            department TEXT,
            hall TEXT,
            branch TEXT,
            bio TEXT,
            current_company TEXT,
            current_position TEXT,
            location TEXT,
            work_preference TEXT CHECK (work_preference IN ('onsite', 'remote', 'hybrid')),
            phone TEXT,
            website TEXT,
            linkedin TEXT,
            github TEXT,
            avatar TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Add new columns if they don't exist (for existing databases)
    try:
        cursor.execute('ALTER TABLE users ADD COLUMN hall TEXT')
    except:
        pass
    try:
        cursor.execute('ALTER TABLE users ADD COLUMN branch TEXT')
    except:
        pass
    try:
        cursor.execute('ALTER TABLE users ADD COLUMN bio TEXT')
    except:
        pass
    try:
        cursor.execute('ALTER TABLE users ADD COLUMN current_company TEXT')
    except:
        pass
    try:
        cursor.execute('ALTER TABLE users ADD COLUMN current_position TEXT')
    except:
        pass
    try:
        cursor.execute('ALTER TABLE users ADD COLUMN location TEXT')
    except:
        pass
    try:
        cursor.execute('ALTER TABLE users ADD COLUMN work_preference TEXT')
    except:
        pass
    try:
        cursor.execute('ALTER TABLE users ADD COLUMN phone TEXT')
    except:
        pass
    try:
        cursor.execute('ALTER TABLE users ADD COLUMN website TEXT')
    except:
        pass
    try:
        cursor.execute('ALTER TABLE users ADD COLUMN linkedin TEXT')
    except:
        pass
    try:
        cursor.execute('ALTER TABLE users ADD COLUMN github TEXT')
    except:
        pass
    try:
        cursor.execute('ALTER TABLE users ADD COLUMN avatar TEXT')
    except:
        pass
    
    # Add new columns to projects table if they don't exist
    try:
        cursor.execute('ALTER TABLE projects ADD COLUMN stipend INTEGER')
    except:
        pass
    try:
        cursor.execute('ALTER TABLE projects ADD COLUMN duration TEXT')
    except:
        pass
    try:
        cursor.execute('ALTER TABLE projects ADD COLUMN skills_required TEXT')
    except:
        pass
    try:
        cursor.execute('ALTER TABLE projects ADD COLUMN location TEXT')
    except:
        pass
    try:
        cursor.execute('ALTER TABLE projects ADD COLUMN work_type TEXT')
    except:
        pass
    
    # Projects table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'paused')),
            team_members TEXT,
            tags TEXT,
            stipend INTEGER,
            duration TEXT,
            skills_required TEXT,
            location TEXT,
            work_type TEXT CHECK (work_type IN ('remote', 'onsite', 'hybrid')),
            created_by INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users (id)
        )
    ''')
    
    # Blog posts table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS blog_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT,
            author_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (author_id) REFERENCES users (id)
        )
    ''')
    
    # Conversations table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user1_id INTEGER NOT NULL,
            user2_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user1_id) REFERENCES users (id),
            FOREIGN KEY (user2_id) REFERENCES users (id),
            UNIQUE(user1_id, user2_id)
        )
    ''')
    
    # Messages table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_read INTEGER DEFAULT 0,
            FOREIGN KEY (sender_id) REFERENCES users (id),
            FOREIGN KEY (receiver_id) REFERENCES users (id)
        )
    ''')
    
    # Blog likes table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS blog_likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            blog_post_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (blog_post_id) REFERENCES blog_posts (id),
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(blog_post_id, user_id)
        )
    ''')
    
    # Mentorship requests table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS mentorship_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            alumni_id INTEGER NOT NULL,
            message TEXT,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES users (id),
            FOREIGN KEY (alumni_id) REFERENCES users (id)
        )
    ''')
    
    # Project applications table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS project_applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            project_id INTEGER NOT NULL,
            message TEXT,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES users (id),
            FOREIGN KEY (project_id) REFERENCES projects (id)
        )
    ''')
    
    # User skills table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            skill_name TEXT NOT NULL,
            skill_type TEXT DEFAULT 'technical' CHECK (skill_type IN ('technical', 'soft', 'language')),
            proficiency_level TEXT DEFAULT 'intermediate' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # User achievements table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            achievement_type TEXT DEFAULT 'award' CHECK (achievement_type IN ('award', 'certification', 'project', 'publication', 'other')),
            date_earned DATE,
            issuer TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # User languages table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_languages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            language_name TEXT NOT NULL,
            proficiency_level TEXT DEFAULT 'intermediate' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'native')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# Auth routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['name', 'email', 'password', 'role']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    # Validate role
    if data['role'] not in ['student', 'alumni']:
        return jsonify({'error': 'Invalid role'}), 400
    
    # Validate alumni-specific fields
    if data['role'] == 'alumni':
        if not data.get('graduation_year') or not data.get('department'):
            return jsonify({'error': 'Graduation year and department are required for alumni'}), 400
    
    conn = sqlite3.connect('launchpad.db')
    cursor = conn.cursor()
    
    try:
        # Check if user already exists
        cursor.execute('SELECT id FROM users WHERE email = ?', (data['email'],))
        if cursor.fetchone():
            return jsonify({'error': 'User already exists'}), 400
        
        # Hash password
        password_hash = generate_password_hash(data['password'])
        
        # Insert user
        cursor.execute('''
            INSERT INTO users (name, email, password_hash, role, graduation_year, department)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            data['name'],
            data['email'],
            password_hash,
            data['role'],
            data.get('graduation_year'),
            data.get('department')
        ))
        
        user_id = cursor.lastrowid
        
        # Create access token
        access_token = create_access_token(identity=f"user_{user_id}")
        
        # Get user data
        cursor.execute('SELECT id, name, email, role, graduation_year, department FROM users WHERE id = ?', (user_id,))
        user_data = cursor.fetchone()
        
        user = {
            'id': user_data[0],
            'name': user_data[1],
            'email': user_data[2],
            'role': user_data[3],
            'graduation_year': user_data[4],
            'department': user_data[5]
        }
        
        conn.commit()
        return jsonify({
            'token': access_token,
            'user': user
        }), 201
        
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    conn = sqlite3.connect('launchpad.db')
    cursor = conn.cursor()
    
    try:
        # Get user
        cursor.execute('SELECT id, name, email, password_hash, role, graduation_year, department FROM users WHERE email = ?', (data['email'],))
        user_data = cursor.fetchone()
        
        if not user_data or not check_password_hash(user_data[3], data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Create access token
        access_token = create_access_token(identity=f"user_{user_data[0]}")
        
        user = {
            'id': user_data[0],
            'name': user_data[1],
            'email': user_data[2],
            'role': user_data[4],
            'graduation_year': user_data[5],
            'department': user_data[6]
        }
        
        return jsonify({
            'token': access_token,
            'user': user
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Protected routes
@app.route('/api/projects', methods=['GET'])
def get_projects():
    conn = sqlite3.connect('launchpad.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            SELECT p.id, p.title, p.description, p.category, p.status, p.team_members, p.tags, p.skills_required, 
                   p.stipend, p.duration, p.location, p.work_type, p.created_at, u.name as created_by_name
            FROM projects p
            LEFT JOIN users u ON p.created_by = u.id
            ORDER BY p.created_at DESC
        ''')
        
        projects = []
        for row in cursor.fetchall():
            projects.append({
                'id': row[0],
                'title': row[1],
                'description': row[2],
                'category': row[3],
                'status': row[4],
                'team_members': json.loads(row[5]) if row[5] else [],
                'tags': json.loads(row[6]) if row[6] else [],
                'skills_required': json.loads(row[7]) if row[7] else [],
                'stipend': row[8],
                'duration': row[9],
                'location': row[10],
                'work_type': row[11],
                'created_at': row[12],
                'created_by_name': row[13]
            })
        
        return jsonify(projects), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Create a project (alumni only)
@app.route('/api/projects', methods=['POST'])
@jwt_required()
def create_project():
    try:
        user_id = get_user_id_from_jwt()
        print(f"DEBUG: User ID from JWT: {user_id}")
    except Exception as e:
        print(f"DEBUG: JWT Error: {e}")
        return jsonify({'error': f'JWT Error: {str(e)}'}), 422
    
    data = request.get_json()
    print(f"DEBUG: Request data: {data}")
    print(f"DEBUG: Authorization header: {request.headers.get('Authorization')}")
    print(f"DEBUG: All headers: {dict(request.headers)}")

    conn = sqlite3.connect('launchpad.db')
    cursor = conn.cursor()

    try:
        cursor.execute('SELECT role FROM users WHERE id = ?', (user_id,))
        role_row = cursor.fetchone()
        if not role_row or role_row[0] != 'alumni':
            return jsonify({'error': 'Only alumni can create projects'}), 403

        required = ['title', 'description', 'category']
        for field in required:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400

        status = data.get('status') or 'active'
        team_members = json.dumps(data.get('team_members', []))
        tags = json.dumps(data.get('tags', []))
        skills_required = json.dumps(data.get('skills_required', []))

        cursor.execute('''
            INSERT INTO projects (title, description, category, status, team_members, tags, skills_required, stipend, duration, location, work_type, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''' , (
            data['title'], data['description'], data['category'], status, team_members, tags, skills_required,
            data.get('stipend'), data.get('duration'), data.get('location'), data.get('work_type'), user_id
        ))

        conn.commit()
        project_id = cursor.lastrowid
        return jsonify({'id': project_id, 'message': 'Project created'}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/blog', methods=['GET'])
def get_blog_posts():
    conn = sqlite3.connect('launchpad.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            SELECT b.id, b.title, b.content, b.category, b.created_at, b.updated_at,
                   u.name as author_name, b.author_id
            FROM blog_posts b
            LEFT JOIN users u ON b.author_id = u.id
            ORDER BY b.created_at DESC
        ''')
        
        posts = []
        for row in cursor.fetchall():
            post_id = row[0]
            
            # Get likes count for this post
            cursor.execute('SELECT COUNT(*) FROM blog_likes WHERE blog_post_id = ?', (post_id,))
            likes_count = cursor.fetchone()[0]
            
            posts.append({
                'id': post_id,
                'title': row[1],
                'content': row[2],
                'category': row[3],
                'created_at': row[4],
                'updated_at': row[5],
                'author_name': row[6],
                'author_id': row[7],
                'likes_count': likes_count,
                'is_liked': False  # Will be updated if user is logged in
            })
        
        return jsonify(posts), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/blog', methods=['POST'])
@jwt_required()
def create_blog_post():
    try:
        user_id = get_user_id_from_jwt()
        print(f"DEBUG: User ID from JWT: {user_id}")
    except Exception as e:
        print(f"DEBUG: JWT Error: {e}")
        return jsonify({'error': f'JWT Error: {str(e)}'}), 422
    
    data = request.get_json()
    print(f"DEBUG: Request data: {data}")
    print(f"DEBUG: Authorization header: {request.headers.get('Authorization')}")
    print(f"DEBUG: All headers: {dict(request.headers)}")

    conn = sqlite3.connect('launchpad.db')
    cursor = conn.cursor()

    try:
        cursor.execute('SELECT role FROM users WHERE id = ?', (user_id,))
        role_row = cursor.fetchone()
        if not role_row or role_row[0] != 'alumni':
            return jsonify({'error': 'Only alumni can create blog posts'}), 403

        required = ['title', 'content']
        for field in required:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400

        cursor.execute('''
            INSERT INTO blog_posts (title, content, category, author_id)
            VALUES (?, ?, ?, ?)
        ''', (data['title'], data['content'], data.get('category'), user_id))

        conn.commit()
        post_id = cursor.lastrowid
        return jsonify({'id': post_id, 'message': 'Blog post created'}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/blog/<int:post_id>', methods=['GET'])
def get_blog_post(post_id):
    conn = sqlite3.connect('launchpad.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            SELECT b.id, b.title, b.content, b.category, b.created_at, b.updated_at,
                   u.name as author_name, b.author_id
            FROM blog_posts b
            LEFT JOIN users u ON b.author_id = u.id
            WHERE b.id = ?
        ''', (post_id,))
        
        post_data = cursor.fetchone()
        
        if not post_data:
            return jsonify({'error': 'Blog post not found'}), 404
        
        # Get likes count
        cursor.execute('SELECT COUNT(*) FROM blog_likes WHERE blog_post_id = ?', (post_id,))
        likes_count = cursor.fetchone()[0]
        
        # Check if current user has liked this post (if user is logged in)
        is_liked = False
        # Note: We'll need to get user_id from JWT token for this to work properly
        
        post = {
            'id': post_data[0],
            'title': post_data[1],
            'content': post_data[2],
            'category': post_data[3],
            'created_at': post_data[4],
            'updated_at': post_data[5],
            'author_name': post_data[6],
            'author_id': post_data[7],
            'likes_count': likes_count,
            'is_liked': is_liked
        }
        
        return jsonify(post), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_user_id_from_jwt()
    
    conn = sqlite3.connect('launchpad.db')
    cursor = conn.cursor()
    
    try:
        # Get basic user info
        cursor.execute('''
            SELECT id, name, email, role, graduation_year, department, hall, branch, bio,
                   current_company, current_position, location, work_preference,
                   phone, website, linkedin, github, avatar
            FROM users WHERE id = ?
        ''', (user_id,))
        user_data = cursor.fetchone()
        
        if not user_data:
            return jsonify({'error': 'User not found'}), 404
        
        # Get skills
        cursor.execute('SELECT skill_name, skill_type, proficiency_level FROM user_skills WHERE user_id = ?', (user_id,))
        skills_data = cursor.fetchall()
        
        # Get achievements
        cursor.execute('SELECT title, description, achievement_type, date_earned, issuer FROM user_achievements WHERE user_id = ?', (user_id,))
        achievements_data = cursor.fetchall()
        
        # Get languages
        cursor.execute('SELECT language_name, proficiency_level FROM user_languages WHERE user_id = ?', (user_id,))
        languages_data = cursor.fetchall()
        
        user = {
            'id': user_data[0],
            'name': user_data[1],
            'email': user_data[2],
            'role': user_data[3],
            'graduation_year': user_data[4],
            'department': user_data[5],
            'hall': user_data[6],
            'branch': user_data[7],
            'bio': user_data[8],
            'current_company': user_data[9],
            'current_position': user_data[10],
            'location': user_data[11],
            'work_preference': user_data[12],
            'phone': user_data[13],
            'website': user_data[14],
            'linkedin': user_data[15],
            'github': user_data[16],
            'avatar': user_data[17],
            'skills': [{'name': s[0], 'type': s[1], 'proficiency': s[2]} for s in skills_data],
            'achievements': [{'title': a[0], 'description': a[1], 'type': a[2], 'date_earned': a[3], 'issuer': a[4]} for a in achievements_data],
            'languages': [{'name': l[0], 'proficiency': l[1]} for l in languages_data]
        }
        
        return jsonify(user), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Update profile endpoint
@app.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_user_id_from_jwt()
    data = request.get_json()
    
    conn = sqlite3.connect('launchpad.db')
    cursor = conn.cursor()
    
    try:
        # Update basic profile info
        cursor.execute('''
            UPDATE users SET 
                name = COALESCE(?, name),
                bio = COALESCE(?, bio),
                hall = COALESCE(?, hall),
                branch = COALESCE(?, branch),
                current_company = COALESCE(?, current_company),
                current_position = COALESCE(?, current_position),
                location = COALESCE(?, location),
                work_preference = COALESCE(?, work_preference),
                phone = COALESCE(?, phone),
                website = COALESCE(?, website),
                linkedin = COALESCE(?, linkedin),
                github = COALESCE(?, github),
                avatar = COALESCE(?, avatar)
            WHERE id = ?
        ''', (
            data.get('name'), data.get('bio'), data.get('hall'), data.get('branch'),
            data.get('current_company'), data.get('current_position'), data.get('location'),
            data.get('work_preference'), data.get('phone'), data.get('website'),
            data.get('linkedin'), data.get('github'), data.get('avatar'), user_id
        ))
        
        # Update skills if provided
        if 'skills' in data:
            # Delete existing skills
            cursor.execute('DELETE FROM user_skills WHERE user_id = ?', (user_id,))
            # Insert new skills
            for skill in data['skills']:
                cursor.execute('''
                    INSERT INTO user_skills (user_id, skill_name, skill_type, proficiency_level)
                    VALUES (?, ?, ?, ?)
                ''', (user_id, skill.get('name'), skill.get('type', 'technical'), skill.get('proficiency', 'intermediate')))
        
        # Update achievements if provided
        if 'achievements' in data:
            # Delete existing achievements
            cursor.execute('DELETE FROM user_achievements WHERE user_id = ?', (user_id,))
            # Insert new achievements
            for achievement in data['achievements']:
                cursor.execute('''
                    INSERT INTO user_achievements (user_id, title, description, achievement_type, date_earned, issuer)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (user_id, achievement.get('title'), achievement.get('description'), 
                      achievement.get('type', 'award'), achievement.get('date_earned'), achievement.get('issuer')))
        
        # Update languages if provided
        if 'languages' in data:
            # Delete existing languages
            cursor.execute('DELETE FROM user_languages WHERE user_id = ?', (user_id,))
            # Insert new languages
            for language in data['languages']:
                cursor.execute('''
                    INSERT INTO user_languages (user_id, language_name, proficiency_level)
                    VALUES (?, ?, ?)
                ''', (user_id, language.get('name'), language.get('proficiency', 'intermediate')))
        
        conn.commit()
        return jsonify({'message': 'Profile updated successfully'}), 200
        
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()





@app.route('/api/users/<int:user_id>', methods=['GET'])
@jwt_required() # Still require login to view profiles
def get_user_profile(user_id):
    conn = sqlite3.connect('launchpad.db')
    cursor = conn.cursor()
    
    try:
        # Get basic user info
        cursor.execute('''
            SELECT id, name, email, role, graduation_year, department, hall, branch, bio,
                   current_company, current_position, location, work_preference,
                   phone, website, linkedin, github, avatar
            FROM users WHERE id = ?
        ''', (user_id,))
        user_data = cursor.fetchone()
        
        if not user_data:
            return jsonify({'error': 'User not found'}), 404
            
        # Get skills, achievements, and languages (same logic as the /api/profile endpoint)
        cursor.execute('SELECT skill_name, skill_type, proficiency_level FROM user_skills WHERE user_id = ?', (user_id,))
        skills_data = cursor.fetchall()
        
        cursor.execute('SELECT title, description, achievement_type, date_earned, issuer FROM user_achievements WHERE user_id = ?', (user_id,))
        achievements_data = cursor.fetchall()
        
        cursor.execute('SELECT language_name, proficiency_level FROM user_languages WHERE user_id = ?', (user_id,))
        languages_data = cursor.fetchall()
        
        user = {
            'id': user_data[0],
            'name': user_data[1],
            'email': user_data[2],
            'role': user_data[3],
            'graduation_year': user_data[4],
            'department': user_data[5],
            'hall': user_data[6],
            'branch': user_data[7],
            'bio': user_data[8],
            'current_company': user_data[9],
            'current_position': user_data[10],
            'location': user_data[11],
            'work_preference': user_data[12],
            'phone': user_data[13],
            'website': user_data[14],
            'linkedin': user_data[15],
            'github': user_data[16],
            'avatar': user_data[17],
            'skills': [{'name': s[0], 'type': s[1], 'proficiency': s[2]} for s in skills_data],
            'achievements': [{'title': a[0], 'description': a[1], 'type': a[2], 'date_earned': a[3], 'issuer': a[4]} for a in achievements_data],
            'languages': [{'name': l[0], 'proficiency': l[1]} for l in languages_data]
        }
        
        return jsonify(user), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Project application endpoints
@app.route('/api/projects/<int:project_id>/apply', methods=['POST'])
@jwt_required()
def apply_to_project(project_id):
    user_id = get_user_id_from_jwt()
    data = request.get_json()
    
    conn = sqlite3.connect('launchpad.db')
    cursor = conn.cursor()
    
    try:
        # Check if user is a student
        cursor.execute('SELECT role FROM users WHERE id = ?', (user_id,))
        user_role = cursor.fetchone()
        
        if not user_role or user_role[0] != 'student':
            return jsonify({'error': 'Only students can apply to projects'}), 403
        
        # Check if project exists
        cursor.execute('SELECT id FROM projects WHERE id = ?', (project_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Project not found'}), 404
        
        # Check if already applied
        cursor.execute('SELECT id FROM project_applications WHERE student_id = ? AND project_id = ?', (user_id, project_id))
        if cursor.fetchone():
            return jsonify({'error': 'You have already applied to this project'}), 400
        
        # Create application
        cursor.execute('''
            INSERT INTO project_applications (student_id, project_id, message)
            VALUES (?, ?, ?)
        ''', (user_id, project_id, data.get('message', '')))
        
        conn.commit()
        return jsonify({'message': 'Application submitted successfully'}), 201
        
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Get projects a student applied to
@app.route('/api/students/applied-projects', methods=['GET'])
@jwt_required()
def get_student_applied_projects():
    user_id = get_user_id_from_jwt()

    conn = sqlite3.connect('launchpad.db')
    cursor = conn.cursor()

    try:
        cursor.execute('SELECT role FROM users WHERE id = ?', (user_id,))
        role_row = cursor.fetchone()
        if not role_row or role_row[0] != 'student':
            return jsonify({'error': 'Only students can view applied projects'}), 403

        cursor.execute('''
            SELECT p.id, p.title, p.description, p.category, p.status, p.team_members, p.tags, p.created_at,
                   u.name as created_by_name, pa.status as application_status, pa.created_at as applied_at
            FROM project_applications pa
            JOIN projects p ON pa.project_id = p.id
            LEFT JOIN users u ON p.created_by = u.id
            WHERE pa.student_id = ?
            ORDER BY pa.created_at DESC
        ''', (user_id,))

        results = []
        for row in cursor.fetchall():
            results.append({
                'id': row[0],
                'title': row[1],
                'description': row[2],
                'category': row[3],
                'status': row[4],
                'team_members': json.loads(row[5]) if row[5] else [],
                'tags': json.loads(row[6]) if row[6] else [],
                'created_at': row[7],
                'created_by_name': row[8],
                'application_status': row[9],
                'applied_at': row[10]
            })

        return jsonify(results), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/projects/<int:project_id>', methods=['GET'])
def get_project_detail(project_id):
    conn = sqlite3.connect('launchpad.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            SELECT p.id, p.title, p.description, p.category, p.status, p.team_members, p.tags, p.skills_required,
                   p.stipend, p.duration, p.location, p.work_type, p.created_at, u.name as created_by_name, u.email as created_by_email
            FROM projects p
            LEFT JOIN users u ON p.created_by = u.id
            WHERE p.id = ?
        ''', (project_id,))
        
        project_data = cursor.fetchone()
        
        if not project_data:
            return jsonify({'error': 'Project not found'}), 404
        
        project = {
            'id': project_data[0],
            'title': project_data[1],
            'description': project_data[2],
            'category': project_data[3],
            'status': project_data[4],
            'team_members': json.loads(project_data[5]) if project_data[5] else [],
            'tags': json.loads(project_data[6]) if project_data[6] else [],
            'skills_required': json.loads(project_data[7]) if project_data[7] else [],
            'stipend': project_data[8],
            'duration': project_data[9],
            'location': project_data[10],
            'work_type': project_data[11],
            'created_at': project_data[12],
            'created_by_name': project_data[13],
            'created_by_email': project_data[14]
        }
        
        return jsonify(project), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Mentorship request endpoints
@app.route('/api/mentorship/request', methods=['POST'])
@jwt_required()
def request_mentorship():
    user_id = get_user_id_from_jwt()
    data = request.get_json()
    
    conn = sqlite3.connect('launchpad.db')
    cursor = conn.cursor()
    
    try:
        # Check if user is a student
        cursor.execute('SELECT role FROM users WHERE id = ?', (user_id,))
        user_role = cursor.fetchone()
        
        if not user_role or user_role[0] != 'student':
            return jsonify({'error': 'Only students can request mentorship'}), 403
        
        alumni_id = data.get('alumni_id')
        if not alumni_id:
            return jsonify({'error': 'Alumni ID is required'}), 400
        
        # Check if alumni exists and is actually an alumni
        cursor.execute('SELECT role FROM users WHERE id = ?', (alumni_id,))
        alumni_role = cursor.fetchone()
        
        if not alumni_role or alumni_role[0] != 'alumni':
            return jsonify({'error': 'Invalid alumni ID'}), 400
        
        # Check if already requested
        cursor.execute('SELECT id FROM mentorship_requests WHERE student_id = ? AND alumni_id = ?', (user_id, alumni_id))
        if cursor.fetchone():
            return jsonify({'error': 'You have already sent a mentorship request to this alumni'}), 400
        
        # Create mentorship request
        cursor.execute('''
            INSERT INTO mentorship_requests (student_id, alumni_id, message)
            VALUES (?, ?, ?)
        ''', (user_id, alumni_id, data.get('message', '')))
        
        conn.commit()
        return jsonify({'message': 'Mentorship request sent successfully'}), 201
        
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/mentorship/requests', methods=['GET'])
@jwt_required()
def get_mentorship_requests():
    user_id = get_user_id_from_jwt()
    
    conn = sqlite3.connect('launchpad.db')
    cursor = conn.cursor()
    
    try:
        # Get user role
        cursor.execute('SELECT role FROM users WHERE id = ?', (user_id,))
        user_role = cursor.fetchone()
        
        if not user_role:
            return jsonify({'error': 'User not found'}), 404
        
        if user_role[0] == 'student':
            # Get requests sent by student
            cursor.execute('''
                SELECT mr.id, mr.message, mr.status, mr.created_at,
                       u.name as alumni_name, u.email as alumni_email
                FROM mentorship_requests mr
                LEFT JOIN users u ON mr.alumni_id = u.id
                WHERE mr.student_id = ?
                ORDER BY mr.created_at DESC
            ''', (user_id,))
        else:
            # Get requests received by alumni
            cursor.execute('''
                SELECT mr.id, mr.message, mr.status, mr.created_at,
                       u.name as student_name, u.email as student_email
                FROM mentorship_requests mr
                LEFT JOIN users u ON mr.student_id = u.id
                WHERE mr.alumni_id = ?
                ORDER BY mr.created_at DESC
            ''', (user_id,))
        
        requests = []
        for row in cursor.fetchall():
            requests.append({
                'id': row[0],
                'message': row[1],
                'status': row[2],
                'created_at': row[3],
                'other_user_name': row[4],
                'other_user_email': row[5]
            })
        
        return jsonify(requests), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Get alumni list for mentorship
@app.route('/api/alumni', methods=['GET'])
def get_alumni():
    conn = sqlite3.connect('launchpad.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            SELECT id, name, email, graduation_year, department
            FROM users
            WHERE role = 'alumni'
            ORDER BY name
        ''')
        
        alumni = []
        for row in cursor.fetchall():
            alumni.append({
                'id': row[0],
                'name': row[1],
                'email': row[2],
                'graduation_year': row[3],
                'department': row[4]
            })
        
        return jsonify(alumni), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Student dashboard statistics
@app.route('/api/students/dashboard-stats', methods=['GET'])
@jwt_required()
def get_student_dashboard_stats():
    user_id = get_user_id_from_jwt()
    
    conn = sqlite3.connect('launchpad.db')
    cursor = conn.cursor()
    
    try:
        # Check if user is a student
        cursor.execute('SELECT role FROM users WHERE id = ?', (user_id,))
        user_role = cursor.fetchone()
        
        if not user_role or user_role[0] != 'student':
            return jsonify({'error': 'Only students can access dashboard stats'}), 403
        
        # Get applied projects count
        cursor.execute('SELECT COUNT(*) FROM project_applications WHERE student_id = ?', (user_id,))
        applied_projects = cursor.fetchone()[0]
        
        # Get accepted projects count
        cursor.execute('SELECT COUNT(*) FROM project_applications WHERE student_id = ? AND status = "accepted"', (user_id,))
        accepted_projects = cursor.fetchone()[0]
        
        # Get pending applications count
        cursor.execute('SELECT COUNT(*) FROM project_applications WHERE student_id = ? AND status = "pending"', (user_id,))
        pending_applications = cursor.fetchone()[0]
        
        # Get mentorship requests count
        cursor.execute('SELECT COUNT(*) FROM mentorship_requests WHERE student_id = ?', (user_id,))
        mentorship_requests = cursor.fetchone()[0]
        
        stats = {
            'applied_projects': applied_projects,
            'accepted_projects': accepted_projects,
            'pending_applications': pending_applications,
            'mentorship_requests': mentorship_requests
        }
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Alumni dashboard statistics
@app.route('/api/alumni/dashboard-stats', methods=['GET'])
@jwt_required()
def get_alumni_dashboard_stats():
    user_id = get_user_id_from_jwt()
    
    conn = sqlite3.connect('launchpad.db')
    cursor = conn.cursor()
    
    try:
        # Check if user is an alumni
        cursor.execute('SELECT role FROM users WHERE id = ?', (user_id,))
        user_role = cursor.fetchone()
        
        if not user_role or user_role[0] != 'alumni':
            return jsonify({'error': 'Only alumni can access dashboard stats'}), 403
        
        # Get active projects count
        cursor.execute('SELECT COUNT(*) FROM projects WHERE created_by = ? AND status = "active"', (user_id,))
        active_projects = cursor.fetchone()[0]
        
        # Get total projects count
        cursor.execute('SELECT COUNT(*) FROM projects WHERE created_by = ?', (user_id,))
        total_projects = cursor.fetchone()[0]
        
        # Get mentees count (accepted mentorship requests)
        cursor.execute('SELECT COUNT(*) FROM mentorship_requests WHERE alumni_id = ? AND status = "accepted"', (user_id,))
        mentees = cursor.fetchone()[0]
        
        # Get blog posts count
        cursor.execute('SELECT COUNT(*) FROM blog_posts WHERE author_id = ?', (user_id,))
        blog_posts = cursor.fetchone()[0]
        
        # Get pending mentorship requests count
        cursor.execute('SELECT COUNT(*) FROM mentorship_requests WHERE alumni_id = ? AND status = "pending"', (user_id,))
        pending_mentorship_requests = cursor.fetchone()[0]
        
        # Get pending project applications count
        cursor.execute('''
            SELECT COUNT(*) FROM project_applications pa
            JOIN projects p ON pa.project_id = p.id
            WHERE p.created_by = ? AND pa.status = "pending"
        ''', (user_id,))
        pending_project_applications = cursor.fetchone()[0]
        
        stats = {
            'active_projects': active_projects,
            'total_projects': total_projects,
            'mentees': mentees,
            'blog_posts': blog_posts,
            'pending_mentorship_requests': pending_mentorship_requests,
            'pending_project_applications': pending_project_applications
        }
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Accept/Decline mentorship request
@app.route('/api/mentorship/<int:request_id>/<action>', methods=['POST'])
@jwt_required()
def handle_mentorship_request(request_id, action):
    user_id = get_user_id_from_jwt()
    
    if action not in ['accept', 'decline']:
        return jsonify({'error': 'Invalid action'}), 400
    
    conn = sqlite3.connect('launchpad.db')
    cursor = conn.cursor()
    
    try:
        # Check if user is an alumni and owns this request
        cursor.execute('''
            SELECT mr.id, mr.alumni_id, u.role
            FROM mentorship_requests mr
            JOIN users u ON mr.alumni_id = u.id
            WHERE mr.id = ?
        ''', (request_id,))
        
        request_data = cursor.fetchone()
        
        if not request_data:
            return jsonify({'error': 'Mentorship request not found'}), 404
        
        if request_data[1] != user_id:
            return jsonify({'error': 'You can only handle your own mentorship requests'}), 403
        
        if request_data[2] != 'alumni':
            return jsonify({'error': 'Only alumni can handle mentorship requests'}), 403
        
        # Update request status
        new_status = 'accepted' if action == 'accept' else 'declined'
        cursor.execute('''
            UPDATE mentorship_requests 
            SET status = ?
            WHERE id = ?
        ''', (new_status, request_id))
        
        conn.commit()
        return jsonify({'message': f'Mentorship request {action}ed successfully'}), 200
        
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Get project applications for alumni
@app.route('/api/alumni/project-applications', methods=['GET'])
@jwt_required()
def get_alumni_project_applications():
    user_id = get_user_id_from_jwt()
    
    conn = sqlite3.connect('launchpad.db')
    cursor = conn.cursor()
    
    try:
        # Check if user is an alumni
        cursor.execute('SELECT role FROM users WHERE id = ?', (user_id,))
        user_role = cursor.fetchone()
        
        if not user_role or user_role[0] != 'alumni':
            return jsonify({'error': 'Only alumni can view project applications'}), 403
        
        # Get project applications for alumni's projects
        cursor.execute('''
            SELECT pa.id, pa.message, pa.status, pa.created_at,
                   p.title as project_title, p.id as project_id,
                   u.name as student_name, u.email as student_email
            FROM project_applications pa
            JOIN projects p ON pa.project_id = p.id
            JOIN users u ON pa.student_id = u.id
            WHERE p.created_by = ?
            ORDER BY pa.created_at DESC
        ''', (user_id,))
        
        applications = []
        for row in cursor.fetchall():
            applications.append({
                'id': row[0],
                'message': row[1],
                'status': row[2],
                'created_at': row[3],
                'project_title': row[4],
                'project_id': row[5],
                'student_name': row[6],
                'student_email': row[7]
            })
        
        return jsonify(applications), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()
  
#Submit application        
@app.route('/api/project-applications', methods=['POST'])
@jwt_required()
def create_project_application():
    user_id = get_user_id_from_jwt()
    data = request.get_json()

    project_id = data.get('project_id')
    message = data.get('message', '')

    if not project_id:
        return jsonify({'error': 'Project ID is required'}), 400

    conn = sqlite3.connect('launchpad.db')
    cursor = conn.cursor()

    try:
        # Check if project exists
        cursor.execute('SELECT id FROM projects WHERE id = ?', (project_id,))
        project = cursor.fetchone()
        if not project:
            return jsonify({'error': 'Project not found'}), 404

        # Insert application
        cursor.execute('''
            INSERT INTO project_applications (project_id, student_id, message, status, created_at)
            VALUES (?, ?, ?, ?, datetime('now'))
        ''', (project_id, user_id, message, 'pending'))

        conn.commit()
        return jsonify({'message': 'Application submitted successfully'}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Accept/Decline project application
@app.route('/api/project-applications/<int:application_id>/<action>', methods=['POST'])
@jwt_required()
def handle_project_application(application_id, action):
    user_id = get_user_id_from_jwt()
    
    if action not in ['accept', 'decline']:
        return jsonify({'error': 'Invalid action'}), 400
    
    conn = sqlite3.connect('launchpad.db')
    cursor = conn.cursor()
    
    try:
        # Check if user is an alumni and owns the project
        cursor.execute('''
            SELECT pa.id, p.created_by, u.role
            FROM project_applications pa
            JOIN projects p ON pa.project_id = p.id
            JOIN users u ON p.created_by = u.id
            WHERE pa.id = ?
        ''', (application_id,))
        
        application_data = cursor.fetchone()
        
        if not application_data:
            return jsonify({'error': 'Project application not found'}), 404
        
        if application_data[1] != user_id:
            return jsonify({'error': 'You can only handle applications for your own projects'}), 403
        
        if application_data[2] != 'alumni':
            return jsonify({'error': 'Only alumni can handle project applications'}), 403
        
        # Update application status
        new_status = 'accepted' if action == 'accept' else 'declined'
        cursor.execute('''
            UPDATE project_applications 
            SET status = ?
            WHERE id = ?
        ''', (new_status, application_id))
        
        conn.commit()
        return jsonify({'message': f'Project application {action}ed successfully'}), 200
        
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Get alumni's projects
@app.route('/api/alumni/projects', methods=['GET'])
@jwt_required()
def get_alumni_projects():
    user_id = get_user_id_from_jwt()
    
    conn = sqlite3.connect('launchpad.db')
    cursor = conn.cursor()
    
    try:
        # Check if user is an alumni
        cursor.execute('SELECT role FROM users WHERE id = ?', (user_id,))
        user_role = cursor.fetchone()
        
        if not user_role or user_role[0] != 'alumni':
            return jsonify({'error': 'Only alumni can view their projects'}), 403
        
        # Get alumni's projects
        cursor.execute('''
            SELECT p.id, p.title, p.description, p.category, p.status, p.team_members, p.tags, p.created_at,
                   (SELECT COUNT(*) FROM project_applications WHERE project_id = p.id) as application_count
            FROM projects p
            WHERE p.created_by = ?
            ORDER BY p.created_at DESC
        ''', (user_id,))
        
        projects = []
        for row in cursor.fetchall():
            projects.append({
                'id': row[0],
                'title': row[1],
                'description': row[2],
                'category': row[3],
                'status': row[4],
                'team_members': json.loads(row[5]) if row[5] else [],
                'tags': json.loads(row[6]) if row[6] else [],
                'created_at': row[7],
                'application_count': row[8]
            })
        
        return jsonify(projects), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Get alumni's blog posts
@app.route('/api/alumni/blog-posts', methods=['GET'])
@jwt_required()
def get_alumni_blog_posts():
    user_id = get_user_id_from_jwt()
    
    conn = sqlite3.connect('launchpad.db')
    cursor = conn.cursor()
    
    try:
        # Check if user is an alumni
        cursor.execute('SELECT role FROM users WHERE id = ?', (user_id,))
        user_role = cursor.fetchone()
        
        if not user_role or user_role[0] != 'alumni':
            return jsonify({'error': 'Only alumni can view their blog posts'}), 403
        
        # Get alumni's blog posts
        cursor.execute('''
            SELECT id, title, content, category, created_at, updated_at
            FROM blog_posts
            WHERE author_id = ?
            ORDER BY created_at DESC
        ''', (user_id,))
        
        posts = []
        for row in cursor.fetchall():
            posts.append({
                'id': row[0],
                'title': row[1],
                'content': row[2],
                'category': row[3],
                'created_at': row[4],
                'updated_at': row[5]
            })
        
        return jsonify(posts), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Messaging endpoints
@app.route('/api/messages/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    try:
        user_id = get_user_id_from_jwt()
        conn = sqlite3.connect('launchpad.db')
        cursor = conn.cursor()
        
        # Get all conversations for the user
        cursor.execute('''
            SELECT DISTINCT 
                CASE 
                    WHEN user1_id = ? THEN user2_id 
                    ELSE user1_id 
                END as other_user_id,
                u.name as other_user_name,
                u.email as other_user_email,
                u.role as other_user_role
            FROM conversations c
            JOIN users u ON u.id = CASE 
                WHEN c.user1_id = ? THEN c.user2_id 
                ELSE c.user1_id 
            END
            WHERE c.user1_id = ? OR c.user2_id = ?
            ORDER BY c.updated_at DESC
        ''', (user_id, user_id, user_id, user_id))
        
        conversations = []
        for row in cursor.fetchall():
            other_user_id = row[0]
            other_user_name = row[1]
            other_user_email = row[2]
            other_user_role = row[3]
            
            # Get last message and unread count
            cursor.execute('''
                SELECT content, created_at, is_read
                FROM messages
                WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
                ORDER BY created_at DESC
                LIMIT 1
            ''', (user_id, other_user_id, other_user_id, user_id))
            
            last_message_data = cursor.fetchone()
            last_message = last_message_data[0] if last_message_data else None
            last_message_time = last_message_data[1] if last_message_data else None
            
            # Count unread messages
            cursor.execute('''
                SELECT COUNT(*) FROM messages
                WHERE sender_id = ? AND receiver_id = ? AND is_read = 0
            ''', (other_user_id, user_id))
            unread_count = cursor.fetchone()[0]
            
            # Get the actual conversation ID from database
            cursor.execute('''
                SELECT id FROM conversations
                WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
            ''', (user_id, other_user_id, other_user_id, user_id))
            conversation_data = cursor.fetchone()
            conversation_id = conversation_data[0] if conversation_data else None
            
            conversations.append({
                'id': conversation_id,
                'other_user_id': other_user_id,
                'other_user_name': other_user_name,
                'other_user_email': other_user_email,
                'other_user_role': other_user_role,
                'last_message': last_message,
                'last_message_time': last_message_time,
                'unread_count': unread_count,
                'is_online': False  # TODO: Implement online status
            })
        
        return jsonify(conversations), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/messages/conversations', methods=['POST'])
@jwt_required()
def create_conversation():
    try:
        user_id = get_user_id_from_jwt()
        data = request.get_json()
        other_user_id = data.get('other_user_id')
        
        if not other_user_id:
            return jsonify({'error': 'other_user_id is required'}), 400
        
        conn = sqlite3.connect('launchpad.db')
        cursor = conn.cursor()
        
        # Check if conversation already exists
        cursor.execute('''
            SELECT id FROM conversations
            WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
        ''', (user_id, other_user_id, other_user_id, user_id))
        
        existing = cursor.fetchone()
        if existing:
            return jsonify({'id': existing[0]}), 200
        
        # Create new conversation
        cursor.execute('''
            INSERT INTO conversations (user1_id, user2_id, created_at, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ''', (min(user_id, other_user_id), max(user_id, other_user_id)))
        
        conversation_id = cursor.lastrowid
        conn.commit()
        
        return jsonify({'id': conversation_id}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/messages/conversations/<int:conversation_id>', methods=['GET'])
@jwt_required()
def get_conversation(conversation_id):
    try:
        user_id = get_user_id_from_jwt()
        conn = sqlite3.connect('launchpad.db')
        cursor = conn.cursor()
        
        # Get conversation details
        cursor.execute('''
            SELECT user1_id, user2_id FROM conversations WHERE id = ?
        ''', (conversation_id,))
        
        conversation = cursor.fetchone()
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        # Check if user is part of this conversation
        if user_id not in [conversation[0], conversation[1]]:
            return jsonify({'error': 'Access denied'}), 403
        
        # Get other user details
        other_user_id = conversation[1] if conversation[0] == user_id else conversation[0]
        cursor.execute('''
            SELECT id, name, email, role, department, graduation_year
            FROM users WHERE id = ?
        ''', (other_user_id,))
        
        other_user_data = cursor.fetchone()
        if not other_user_data:
            return jsonify({'error': 'User not found'}), 404
        
        other_user = {
            'id': other_user_data[0],
            'name': other_user_data[1],
            'email': other_user_data[2],
            'role': other_user_data[3],
            'department': other_user_data[4],
            'graduation_year': other_user_data[5],
            'is_online': False  # TODO: Implement online status
        }
        
        return jsonify({'other_user': other_user}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/messages/conversations/<int:conversation_id>/messages', methods=['GET'])
@jwt_required()
def get_messages(conversation_id):
    try:
        user_id = get_user_id_from_jwt()
        conn = sqlite3.connect('launchpad.db')
        cursor = conn.cursor()
        
        # Verify user is part of conversation
        cursor.execute('''
            SELECT user1_id, user2_id FROM conversations WHERE id = ?
        ''', (conversation_id,))
        
        conversation = cursor.fetchone()
        if not conversation or user_id not in [conversation[0], conversation[1]]:
            return jsonify({'error': 'Access denied'}), 403
        
        # Get messages
        cursor.execute('''
            SELECT id, sender_id, receiver_id, content, created_at, is_read
            FROM messages
            WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
            ORDER BY created_at ASC
        ''', (conversation[0], conversation[1], conversation[1], conversation[0]))
        
        messages = []
        for row in cursor.fetchall():
            messages.append({
                'id': row[0],
                'sender_id': row[1],
                'receiver_id': row[2],
                'content': row[3],
                'created_at': row[4],
                'is_read': bool(row[5])
            })
        
        # Mark messages as read
        cursor.execute('''
            UPDATE messages SET is_read = 1
            WHERE receiver_id = ? AND is_read = 0
        ''', (user_id,))
        conn.commit()
        
        return jsonify(messages), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/messages/conversations/<int:conversation_id>/messages', methods=['POST'])
@jwt_required()
def send_message(conversation_id):
    try:
        user_id = get_user_id_from_jwt()
        data = request.get_json()
        content = data.get('content')
        
        if not content:
            return jsonify({'error': 'Message content is required'}), 400
        
        conn = sqlite3.connect('launchpad.db')
        cursor = conn.cursor()
        
        # Verify user is part of conversation
        cursor.execute('''
            SELECT user1_id, user2_id FROM conversations WHERE id = ?
        ''', (conversation_id,))
        
        conversation = cursor.fetchone()
        if not conversation or user_id not in [conversation[0], conversation[1]]:
            return jsonify({'error': 'Access denied'}), 403
        
        # Determine receiver
        receiver_id = conversation[1] if conversation[0] == user_id else conversation[0]
        
        # Insert message
        cursor.execute('''
            INSERT INTO messages (sender_id, receiver_id, content, created_at, is_read)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP, 0)
        ''', (user_id, receiver_id, content))
        
        message_id = cursor.lastrowid
        
        # Update conversation timestamp
        cursor.execute('''
            UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
        ''', (conversation_id,))
        
        conn.commit()
        
        # Return the new message
        cursor.execute('''
            SELECT id, sender_id, receiver_id, content, created_at, is_read
            FROM messages WHERE id = ?
        ''', (message_id,))
        
        message_data = cursor.fetchone()
        message = {
            'id': message_data[0],
            'sender_id': message_data[1],
            'receiver_id': message_data[2],
            'content': message_data[3],
            'created_at': message_data[4],
            'is_read': bool(message_data[5])
        }
        
        return jsonify(message), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/messages/available-users', methods=['GET'])
@jwt_required()
def get_available_users():
    try:
        user_id = get_user_id_from_jwt()
        conn = sqlite3.connect('launchpad.db')
        cursor = conn.cursor()
        
        # Get current user's role
        cursor.execute('SELECT role FROM users WHERE id = ?', (user_id,))
        user_role = cursor.fetchone()
        if not user_role:
            return jsonify({'error': 'User not found'}), 404
        
        # Get available users (opposite role)
        target_role = 'alumni' if user_role[0] == 'student' else 'student'
        cursor.execute('''
            SELECT id, name, email, role, department, graduation_year, 
                   current_company, current_position, location, bio, 
                   linkedin, github, website, hall, branch
            FROM users
            WHERE role = ? AND id != ?
            ORDER BY name
        ''', (target_role, user_id))
        
        users = []
        for row in cursor.fetchall():
            users.append({
                'id': row[0],
                'name': row[1],
                'email': row[2],
                'role': row[3],
                'department': row[4],
                'graduation_year': row[5],
                'current_company': row[6],
                'current_position': row[7],
                'location': row[8],
                'bio': row[9],
                'linkedin': row[10],
                'github': row[11],
                'website': row[12],
                'hall': row[13],
                'branch': row[14]
            })
        
        return jsonify(users), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Blog likes endpoints
@app.route('/api/blog/<int:post_id>/like', methods=['POST'])
@jwt_required()
def toggle_blog_like(post_id):
    try:
        user_id = get_user_id_from_jwt()
        conn = sqlite3.connect('launchpad.db')
        cursor = conn.cursor()
        
        # Check if user has already liked this post
        cursor.execute('SELECT id FROM blog_likes WHERE blog_post_id = ? AND user_id = ?', (post_id, user_id))
        existing_like = cursor.fetchone()
        
        if existing_like:
            # Unlike the post
            cursor.execute('DELETE FROM blog_likes WHERE blog_post_id = ? AND user_id = ?', (post_id, user_id))
            action = 'unliked'
        else:
            # Like the post
            cursor.execute('INSERT INTO blog_likes (blog_post_id, user_id) VALUES (?, ?)', (post_id, user_id))
            action = 'liked'
        
        # Get updated likes count
        cursor.execute('SELECT COUNT(*) FROM blog_likes WHERE blog_post_id = ?', (post_id,))
        likes_count = cursor.fetchone()[0]
        
        conn.commit()
        
        return jsonify({
            'action': action,
            'likes_count': likes_count,
            'is_liked': action == 'liked'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Profile picture upload endpoint
@app.route('/api/profile/upload-picture', methods=['POST'])
@jwt_required()
def upload_profile_picture():
    try:
        user_id = get_user_id_from_jwt()
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file:
            # Generate unique filename
            filename = secure_filename(file.filename)
            file_extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
            
            if file_extension not in ['jpg', 'jpeg', 'png', 'gif']:
                return jsonify({'error': 'Invalid file type. Only JPG, PNG, and GIF are allowed.'}), 400
            
            unique_filename = f"{user_id}_{uuid.uuid4().hex}.{file_extension}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(file_path)
            
            # Update user's avatar in database
            conn = sqlite3.connect('launchpad.db')
            cursor = conn.cursor()
            
            cursor.execute('UPDATE users SET avatar = ? WHERE id = ?', (unique_filename, user_id))
            conn.commit()
            conn.close()
            
            return jsonify({
                'message': 'Profile picture uploaded successfully',
                'filename': unique_filename,
                'url': f'/api/profile/picture/{unique_filename}'
            }), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Serve profile pictures
@app.route('/api/profile/picture/<filename>')
def get_profile_picture(filename):
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        return jsonify({'error': 'File not found'}), 404

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5001)
