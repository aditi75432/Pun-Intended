from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
app = FastAPI()

# CORS config for local frontend (Vite/React/Next etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Be strict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload/")
async def upload_image(image: UploadFile = File(...)):
    contents = await image.read()
    
    # Here, real OCR logic like pytesseract or EasyOCR can be added

    # 🔁 Mocked OCR-based matches with correct product links
    return {
    "matches": [
        {
            "name": "Women Round Neck Cotton Top",
            "price": 100,
            "link": "http://localhost:5173/product/aaaaa",
            "image": "https://via.placeholder.com/100"
        },
        {
            "name": "Men Round Neck Pure Cotton T-shirt",
            "price": 200,
            "link": "http://localhost:5173/product/aaaab",
            "image": "https://via.placeholder.com/100"
        }
    ]
}

