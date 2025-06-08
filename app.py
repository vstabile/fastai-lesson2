from fastai.vision.all import *
import gradio as gr

# Load the learner
learn = load_learner("models/dogs_cats.pkl")

# Get list of classes
labels = learn.dls.vocab

# Define prediction function
def predict(img):
    pred, idx, probs = learn.predict(img)
    return {labels[i]: float(probs[i]) for i in range(len(labels))}

# Create Gradio interface
iface = gr.Interface(fn=predict, inputs=gr.Image(type="pil"), outputs=gr.Label())
iface.launch()