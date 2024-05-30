from flask import Flask, jsonify,request
import tensorflow as tf
from PIL import Image  
import numpy as np
from flask_cors import CORS


app = Flask(__name__)
cors=CORS(app,origins='*')

model = tf.keras.models.load_model("cat_dog_classifier.h5")

@app.route("/predict", methods=["POST"])
def predict():
    if request.method == "POST":
        print(request.files)
        if 'file' not in request.files:  
            return jsonify({"error": "No images uploaded"})

        predictions = []
        for image_file in request.files.getlist('file'):
            try:
                image = Image.open(image_file)
                image = image.resize((128, 128))
                image_data = np.array(image) / 255.0
                image_data = np.expand_dims(image_data, axis=0)

                prediction = model.predict(image_data)
                predictions.append(prediction.tolist()[0])  # Extract single prediction
            except Exception as e:
                print(f"Error processing image: {e}")
                return jsonify({"error": "Error processing image"})

        return {"predictions": predictions}

    else:
        return jsonify({"error": "Only POST requests allowed"})



if __name__=="__main__":
    app.run()