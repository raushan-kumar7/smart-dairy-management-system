import numpy as np
from sklearn.linear_model import LinearRegression

# Sample data for training (this should be replaced with actual data)
# Features: [age, weight, health_score]
X = np.array([[1, 200, 8], [2, 250, 7], [3, 300, 9], [4, 350, 6]])
# Target: feed amount
y = np.array([10, 15, 20, 25])

# Create and train the model
model = LinearRegression()
model.fit(X, y)

def predict_feed(age, weight, health_score):
    """
    Predict the amount of feed required based on age, weight, and health score.
    """
    input_data = np.array([[age, weight, health_score]])
    predicted_feed = model.predict(input_data)
    return predicted_feed[0]

# Example usage
if __name__ == "__main__":
    age = 3  # Example input
    weight = 280  # Example input
    health_score = 8  # Example input
    feed_amount = predict_feed(age, weight, health_score)
    print(f"Predicted feed amount: {feed_amount}")
