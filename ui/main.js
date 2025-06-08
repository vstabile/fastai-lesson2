import { Client, handle_file } from "@gradio/client";

// DOM Elements
const uploadZone = document.getElementById("uploadZone");
const fileInput = document.getElementById("fileInput");
const previewSection = document.getElementById("previewSection");
const previewImage = document.getElementById("previewImage");
const loading = document.getElementById("loading");
const resultsList = document.getElementById("resultsList");
const resetButton = document.getElementById("resetButton");

// Initialize Gradio client
let app = null;

async function initializeClient() {
  try {
    // Then initialize the client
    app = await Client.connect("http://localhost:3000/gradio");

    console.log("Client initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing Gradio client:", error);
    alert("Error connecting to the model server. Please try again later.");
    return false;
  }
}

// Initialize client when the page loads
(async () => {
  await initializeClient();
})();

// File handling functions
async function handleFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    alert("Please upload an image file.");
    return;
  }

  // Initialize client if not already initialized
  if (!app) {
    const initialized = await initializeClient();
    if (!initialized) {
      return;
    }
  }

  previewImage.src = URL.createObjectURL(file);
  uploadZone.style.display = "none";
  previewSection.style.display = "block";
  await classifyImage(file);
}

async function classifyImage(file) {
  if (!app) {
    alert("Error: Model not initialized. Please refresh the page.");
    return;
  }

  try {
    loading.style.display = "flex";
    resultsList.innerHTML = "";

    // Make prediction using the predict endpoint
    const result = await app.predict("/predict", [handle_file(file)]);

    console.log("Prediction result:", result);

    // Display results
    const predictions = result.data[0];
    resultsList.innerHTML = Object.entries(predictions)
      .sort(([, a], [, b]) => b - a)
      .map(
        ([label, probability]) => `
                <div class="result-item">
                    <span class="result-label">${label}</span>
                    <span class="result-probability">${(
                      probability * 100
                    ).toFixed(1)}%</span>
                </div>
            `
      )
      .join("");
  } catch (error) {
    console.error("Error classifying image:", error);

    resultsList.innerHTML = `
            <div class="result-item" style="color: #ef4444;">
                Error classifying image. Please try again.
            </div>
        `;
  } finally {
    loading.style.display = "none";
  }
}

// Event Listeners
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (file) await handleFile(file);
});

uploadZone.addEventListener("click", () => {
  fileInput.click();
});

uploadZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadZone.classList.add("dragover");
});

uploadZone.addEventListener("dragleave", () => {
  uploadZone.classList.remove("dragover");
});

uploadZone.addEventListener("drop", async (e) => {
  e.preventDefault();
  uploadZone.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file) await handleFile(file);
});

resetButton.addEventListener("click", () => {
  previewImage.src = "";
  resultsList.innerHTML = "";
  previewSection.style.display = "none";
  uploadZone.style.display = "block";
  fileInput.value = "";
});
