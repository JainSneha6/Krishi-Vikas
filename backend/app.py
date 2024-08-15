from flask import Flask, request, jsonify, send_from_directory
import requests
import google.generativeai as genai
from flask_cors import CORS
import re
from googletrans import Translator  
import joblib
import pandas as pd
import os
from werkzeug.utils import secure_filename
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)  # Enable CORS
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///farmers.db'
db = SQLAlchemy(app)

# Initialize the generative model
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel("gemini-1.5-flash")

# Initialize Google Translator
translator = Translator()

yield_model = joblib.load('crop_yield_model.pkl')

WEATHER_API_KEY = os.getenv('WEATHER_API_KEY')

@app.route('/chatbot', methods=['POST'])
def chatbot():
    data = request.json
    user_query = data.get('query')
    crop_name = data.get('crop_name')
    
    if not user_query or not crop_name:
        return jsonify({'error': 'Query and Crop name are required'}), 400

    try:
        # Prepare the query for the generative AI model
        query = f"{user_query} for {crop_name}. Provide a detailed and practical response.Give in a paragraph and do not give any asterisk"
        
        # Generate response using the AI model
        response = model.generate_content(query)
        response_text = response.text  # Ensure this is plain text

        # Process the response text
        response_text = response_text.strip()  # Clean up the text

        return jsonify({"response": response_text})
    except Exception as e:
        print(f"Error generating chatbot response: {e}")
        return jsonify({'error': 'Failed to get chatbot response'}), 500

@app.route('/weather', methods=['POST'])
def weather():
    data = request.json
    crop_name = data.get('cropName')
    weather_details = data.get('weatherDetails')

    if not crop_name or not weather_details:
        return jsonify({'error': 'Crop name and weather details are required'}), 400

    try:
        # Prepare the query for the generative AI model
        query = f"Provide farming tips for {crop_name} given the following 7-day weather forecast: {weather_details}. Give a brief and practical suggestion.Do not give asterisks and give in a paragraph"
        
        # Generate tips using the AI model
        response = model.generate_content(query)
        tips_text = response.text  # Ensure this is plain text
        
        tips = tips_text.strip()  # Clean up the text
        # print(tips)
        return jsonify({"tips": tips})
    except Exception as e:
        print(f"Error generating farming tips: {e}")
        return jsonify({'error': 'Failed to get farming tips'}), 500


def get_weather_data(lat, lon):
    url = f'http://api.weatherapi.com/v1/current.json?key={WEATHER_API_KEY}&q={lat},{lon}'
    try:
        response = requests.get(url)
        response.raise_for_status()
        # print(response.json)
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching weather data: {e}")
        return None
    
def get_weather_forecast(lat, lon):
    url = f'http://api.weatherapi.com/v1/forecast.json?key={WEATHER_API_KEY}&q={lat},{lon}&days=7'  # 7-day forecast
    try:
        response = requests.get(url)
        response.raise_for_status()
        # print(response.json())
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching weather forecast data: {e}")
        return None

def get_crop_image(crop_name):
    url = f"https://api.unsplash.com/search/photos?query={crop_name}&client_id={UNSPLASH_ACCESS_KEY}&per_page=1"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        if data['results']:
            return data['results'][0]['urls']['small']  # Return the URL of the image
        return None
    except requests.exceptions.RequestException as e:
        print(f"Error fetching image for {crop_name}: {e}")
        return None

def get_crop_recommendations(weather_data, category, lang):
    try:
        query = f"Generate 5 crop recommendations for the category: {category} given the weather conditions: {weather_data}. Give me only the name with one line information."
        response = model.generate_content(query)
        recommendations_text = response.text  # Ensure this is plain text

        # Process the response to extract crop names and one-line descriptions
        pattern = re.compile(r'\d+\.\s*([^\:]+):\s*([^\n]+)')
        matches = pattern.findall(recommendations_text)

        # Translate the recommendations if needed
        translated_recommendations = []
        for match in matches:
            name = match[0].strip().replace('**', '')
            ename = match[0].strip().replace('**', '')
            description = match[1].strip().replace('**', '')
            image = get_crop_image(name)

            if lang != 'en':
                name = translator.translate(name, dest=lang).text
                description = translator.translate(description, dest=lang).text

            translated_recommendations.append({
                'name': name,
                'ename':ename,
                'description': description,
                'image': image
            })

        return translated_recommendations
    except Exception as e:
        print(f"Error generating crop recommendations: {e}")
        return []

@app.route('/recommendations', methods=['POST'])
def recommendations():
    data = request.json
    lat = data.get('latitude')
    lon = data.get('longitude')
    category = data.get('category')
    lang = data.get('language', 'en')  # Default to English if no language is specified

    if not lat or not lon or not category:
        return jsonify({'error': 'Latitude, Longitude, and Category are required'}), 400

    weather_data = get_weather_data(lat, lon)
    if not weather_data:
        return jsonify({'error': 'Failed to get weather data'}), 500

    recommendations = get_crop_recommendations(weather_data, category, lang)
    if not recommendations:
        return jsonify({'error': 'Failed to get crop recommendations'}), 500

    return jsonify({"Recommendations": recommendations})

@app.route('/crop_steps', methods=['POST'])
def crop_steps():
    data = request.json
    crop_name = data.get('crop_name')
    lang = data.get('language', 'en')
    category = data.get('category')

    if not crop_name:
        return jsonify({'error': 'Crop name is required'}), 400
    
    if lang != 'en':
        crop_name = translator.translate(crop_name, dest='en').text

    try:
        if category:
            queries = [f"Give me a small paragraph on {category} for {crop_name} in language {lang}"]

        response = model.generate_content(queries)
        recommendations_text = response.text 
        return(recommendations_text)
    

    except Exception as e:
        print(f"Error generating crop growing steps: {e}")
        return jsonify({'error': 'Failed to get crop growing steps'}), 500

    
app.config['UPLOAD_FOLDER'] = './uploads'  # Make sure this folder exists and is writable

@app.route('/predict-disease', methods=['POST'])
def predict_disease():
    if 'image' not in request.files:
        return jsonify({'error': 'Image is required'}), 400

    try:
        image = request.files['image']
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(image.filename))
        image.save(image_path.replace('\\','/'))
        
        # Open the image and convert it to bytes
        with open(image_path, 'rb') as img_file:
            img_bytes = img_file.read()

        # Send image to Gemini AI model for disease prediction
        response = genai.upload_file(path=image_path)  # Ensure this function is defined
        prompt = "Identify the plant disease in this image and provide the result in plain text."
        prediction_response = model.generate_content([response, prompt]) 
        
        match = re.search(r'\\(.?)\\*', prediction_response.text)
        
        if match:
            return jsonify({'prediction': match.group(1)})
        else:
            return jsonify({'prediction': prediction_response.text})
        
    except Exception as e:
        print(f"Error making prediction with Gemini AI: {e}")
        return jsonify({'error': 'Failed to make prediction'}), 500

@app.route('/weather_data', methods=['POST'])
def weather_data():
    data = request.json
    lat = data.get('latitude')
    lon = data.get('longitude')

    if not lat or not lon:
        return jsonify({'error': 'Latitude and Longitude are required'}), 400

    weather_forecast = get_weather_forecast(lat, lon)
    if not weather_forecast:
        return jsonify({'error': 'Failed to get weather forecast data'}), 500

    # Extract average rainfall and temperature from the forecast
    try:
        current_weather = weather_forecast['current']
        avg_rainfall = current_weather['precip_mm']
        avg_temp = current_weather['temp_c']

        return jsonify({
            'average_rain_fall_mm_per_year': avg_rainfall,
            'avg_temp': avg_temp
        })
    except KeyError:
        return jsonify({'error': 'Error extracting weather data'}), 500

    
@app.route('/weather_forecast', methods=['POST'])
def weather_forecast():
    data = request.json
    lat = data.get('latitude')
    lon = data.get('longitude')

    if not lat or not lon:
        return jsonify({'error': 'Latitude and Longitude are required'}), 400

    forecast_data = get_weather_forecast(lat, lon)
    if not forecast_data:
        return jsonify({'error': 'Failed to get weather forecast data'}), 500

    return jsonify({"Forecast": forecast_data})


@app.route('/yield-prediction', methods=['POST'])
def yield_prediction():
    data = request.json
    crop_name = data.get('crop_name')
    average_rain_fall = data.get('average_rain_fall_mm_per_year')
    pesticides_tonnes = data.get('pesticides_tonnes')
    avg_temp = data.get('avg_temp')
    
    crop_name = translator.translate(crop_name, dest='en').text

    if not crop_name or average_rain_fall is None or pesticides_tonnes is None or avg_temp is None:
        return jsonify({'error': 'All fields are required'}), 400

    try:
        # Create a DataFrame with the provided data
        features = pd.DataFrame({
            'Item':[crop_name],
            'average_rain_fall_mm_per_year': [average_rain_fall],
            'pesticides_tonnes': [pesticides_tonnes],
            'avg_temp': [avg_temp]
        })

        # Predict yield
        prediction = yield_model.predict(features)
        return jsonify({'predicted_yield': prediction[0]})
    except Exception as e:
        print(f"Error predicting crop yield: {e}")
        return jsonify({'error': 'Failed to predict crop yield'}), 500
    
@app.route('/yield-improvement-chatbot', methods=['POST'])
def yield_improvement_chatbot():
    data = request.json
    crop_name = data.get('crop_name')
    category = data.get('category')
    avg_temp = data.get('avg_temp')
    average_rain_fall_mm_per_year = data.get('average_rain_fall_mm_per_year')
    language = data.get('language')
    
    if not crop_name:
        return jsonify({'error': 'Crop name is required'}), 400

    try:
        query = f"How can I {category} of {crop_name} with average temperature {avg_temp}? Provide practical tips and strategies in a paragraph. Do not include any asterisks. Give me the answer in language {language}"
        
        response = model.generate_content(query)
        response_text = response.text.strip()  # Ensure this is plain text

        return jsonify({"response": response_text})
    except Exception as e:
        print(f"Error generating yield improvement response: {e}")
        return jsonify({'error': 'Failed to get yield improvement response'}), 500

        
class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    media_url = db.Column(db.String(256), nullable=True)

@app.route('/api/posts', methods=['GET'])
def get_posts():
    posts = Post.query.all()
    return jsonify([{'id': post.id, 'content': post.content, 'media_url': post.media_url} for post in posts])

@app.route('/api/posts', methods=['POST'])
def create_post():
    data = request.form
    file = request.files.get('media')
    media_url = None
    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        media_url = filename

    new_post = Post(content=data['content'], media_url=media_url)
    db.session.add(new_post)
    db.session.commit()
    return jsonify({'message': 'Post created successfully'}), 201

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/chatbot-expert', methods=['POST'])
def chatbot_expert():
    data = request.json
    user_query = data.get('query')
    language = data.get('language')
    print(language)

    if not user_query:
        return jsonify({'error': 'Query is required'}), 400

    try:
        # Prepare the query for the generative AI model
        query = f"Provide expert advice for the following query: {user_query}. Give a detailed and practical response in small paragraph. Give me the answer in language {language}"

        # Generate response using the AI model
        response = model.generate_content(query)
        response_text = response.text.strip()  # Ensure this is plain text

        return jsonify({"response": response_text})
    except Exception as e:
        print(f"Error generating chatbot response: {e}")
        return jsonify({'error': 'Failed to get chatbot response'}), 500
    
class Blog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(100), nullable=False)

@app.route('/api/blogs', methods=['GET'])
def get_blogs():
    blogs = Blog.query.all()
    return jsonify([{'id': b.id, 'title': b.title, 'content': b.content, 'author': b.author} for b in blogs])

@app.route('/api/blogs', methods=['POST'])
def create_blog():
    data = request.json
    new_blog = Blog(title=data['title'], content=data['content'], author=data['author'])
    db.session.add(new_blog)
    db.session.commit()
    return jsonify({'id': new_blog.id, 'title': new_blog.title, 'content': new_blog.content, 'author': new_blog.author}), 201

crop_calendar = []

@app.route('/calendar', methods=['GET'])
def get_calendar():
    return jsonify(crop_calendar)

@app.route('/calendar', methods=['POST'])
def add_entry():
    data = request.json
    data['date'] = data.get('date')
    crop_calendar.append(data)
    return jsonify(data), 201

@app.route('/calendar/<int:index>', methods=['DELETE'])
def delete_entry(index):
    if 0 <= index < len(crop_calendar):
        removed_entry = crop_calendar.pop(index)
        return jsonify(removed_entry)
    return jsonify({'error': 'Entry not found'}), 404


if __name__ == '__main__':
    
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
        
    app.run(debug=True)
    

