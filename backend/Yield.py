from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import pandas as pd
import joblib

# Load the cleaned data
data = pd.read_csv('backend/cleaned_data.csv')

# Define features and target
X = data[['Item', 'average_rain_fall_mm_per_year', 'pesticides_tonnes', 'avg_temp']]
y = data['hg/ha_yield']

# Preprocessing for categorical data
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(), ['Item']),
        ('num', StandardScaler(), ['average_rain_fall_mm_per_year', 'pesticides_tonnes', 'avg_temp'])
    ])

# Create the pipeline
pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('model', RandomForestRegressor(n_estimators=100, random_state=42))
])

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the model
pipeline.fit(X_train, y_train)

# Make predictions
y_pred = pipeline.predict(X_test)

# Evaluate the model
mse = mean_squared_error(y_test, y_pred)
print(f"Mean Squared Error: {mse}")

# Print model accuracy
accuracy = 100 - (mse / y_test.mean()) * 100
print(f"Model Accuracy: {accuracy:.2f}%")

# Save the model
joblib.dump(pipeline, 'crop_yield_model.pkl')
