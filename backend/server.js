// backend/server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');

// We still need AzureKeyCredential for initializing SearchClient for indexing,
// but we won't use searchClient.search for the actual search operation anymore.
const { AzureKeyCredential } = require('@azure/core-auth');
const { SearchClient } = require('@azure/search-documents');
const storeRoutes = require('./routes/storeRoutes'); 
const virtualTryOnRoutes = require('./routes/virtualTryOnRoutes'); // NEW IMPORT

const app = express();
const PORT = process.env.PORT || 5000;

// --- Azure AI Vision Configuration ---
const visionEndpoint = process.env.AZURE_VISION_ENDPOINT;
const visionKey = process.env.AZURE_VISION_KEY;
const VISION_API_VERSION = '2024-02-01'; // Ensure this matches your actual API version

console.log('--- Azure AI Vision Config ---');
console.log('Vision Endpoint:', visionEndpoint);
console.log('Vision Key (first 5 chars):', visionKey ? visionKey.substring(0, 5) + '...' : 'NOT SET');
console.log('------------------------------');

if (!visionEndpoint || !visionKey) {
    console.error('Missing Azure AI Vision credentials. Please check your .env file.');
    process.exit(1);
}

// --- Azure AI Search Configuration ---
const searchEndpoint = process.env.AZURE_SEARCH_ENDPOINT;
const searchKey = process.env.AZURE_SEARCH_KEY;
const searchIndexName = process.env.AZURE_SEARCH_INDEX_NAME;
const SEARCH_API_VERSION = '2024-07-01'; // Match API version used in Portal, if possible

console.log('--- Azure AI Search Config ---');
console.log('Search Endpoint:', searchEndpoint);
console.log('Search Key (first 5 chars):', searchKey ? searchKey.substring(0, 5) + '...' : 'NOT SET');
console.log('------------------------------');

if (!searchEndpoint || !searchKey || !searchIndexName) {
    console.error('Missing Azure AI Search credentials or index name. Please check your .env file.');
    process.exit(1);
}
// searchClient will now only be used for indexing if needed, not for search queries
const searchClient = new SearchClient(searchEndpoint, searchIndexName, new AzureKeyCredential(searchKey));


// --- Middleware ---
app.use(cors());
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });


// --- Mock Product Data (KEEP THIS) ---
// This mockProducts array is used by your /api/index-products endpoint
const mockProducts = [
    {
        _id: "p1",
        name: "Grey Denim Pants",
        description: "Stylish Grey Denim Pants for all seasons.",
        image: ["https://storage21102005.blob.core.windows.net/punintended/image 1.jpg"],
        price: 79.99,
        sizes: ["S", "M", "L"]
    },
    {
        _id: "p2",
        name: "Men's Shirt",
        description: "Comfortable t-shirt for daily wear.",
        image: ["https://storage21102005.blob.core.windows.net/punintended/image 2.jpg"],
        price: 24.50,
        sizes: ["S", "M", "L", "XL"]
    },
    {
        _id: "p3",
        name: "Men shoes",
        description: "Men shoes.",
        image: ["https://storage21102005.blob.core.windows.net/punintended/image 3.jpg"],
        price: 120.00,
        sizes: ["7", "8", "9", "10"]
    }
];

// --- HELPER FUNCTION: Get Image Embedding from Azure AI Vision ---
async function getImageEmbedding(source) {
    try {
        console.log(`[DEBUG] Current visionEndpoint: ${visionEndpoint}`);
        console.log(`[DEBUG] Current VISION_API_VERSION: ${VISION_API_VERSION}`);
        const apiUrl = `${visionEndpoint}/computervision/retrieval:vectorizeImage?api-version=${VISION_API_VERSION}&model-version=2023-04-15`;
        console.log(`[DEBUG] Final constructed apiUrl: ${apiUrl}`);

        let headers = {
            'Ocp-Apim-Subscription-Key': visionKey,
            'Content-Type': '',
        };
        let requestBody = {};

        if (typeof source === 'string') {
            headers['Content-Type'] = 'application/json';
            requestBody = { url: source };
            console.log(`[Vision Call] Requesting embedding for URL: ${source}`);
        } else if (source instanceof Buffer) {
            headers['Content-Type'] = 'application/octet-stream';
            requestBody = source;
            console.log(`[Vision Call] Requesting embedding for Buffer (size: ${source.length} bytes)`);
        } else {
            throw new Error('Invalid source for image embedding. Must be URL or Buffer.');
        }

        const response = await axios.post(apiUrl, requestBody, { headers: headers });

        if (response.data && response.data.vector) {
            const receivedVector = response.data.vector;
            console.log(`[Vision Response] FULL RECEIVED VECTOR: [${receivedVector.join(', ')}]`); 

            console.log(`[Vision Response] Received vector (first 5 elements): [ ${receivedVector.slice(0, 5).join(', ')} ]`);
            console.log(`[Vision Response] Received vector (last 5 elements): [ ${receivedVector.slice(-5).join(', ')} ]`);
            console.log(`[Vision Response] Vector length: ${receivedVector.length}`);
            const vectorSum = receivedVector.reduce((acc, val) => acc + val, 0);
            console.log(`[Vision Response] Vector sum (for quick comparison): ${vectorSum}`);

            return receivedVector; // The actual vector/embedding
        } else {
            throw new Error('Image embedding response did not contain a vector.');
        }

    } catch (error) {
        console.error('Error getting image embedding:', error.response ? error.response.data : error.message);
        throw new Error('Failed to get image embedding from Azure AI Vision.');
    }
}

// --- Product Indexing Endpoint (One-time or periodic) ---
app.post('/api/index-products', async (req, res) => {
    console.log('*** HIT: Received POST request for /api/index-products ***'); 

    try {
        console.log('Starting product indexing...');
        const productsToIndex = await Promise.all(
            mockProducts.map(async p => {
                const imageUrl = p.image[0]; // Assuming only one image URL per product
                const imageVector = await getImageEmbedding(imageUrl);

                return {
                    id: p._id,
                    productName: p.name,
                    description: p.description,
                    imageUrl: imageUrl,
                    price: p.price,
                    sizes: p.sizes,
                    imageVector: imageVector // Add the generated vector
                };
            })
        );

        const indexResult = await searchClient.uploadDocuments(productsToIndex);
        console.log('Product indexing complete:', indexResult);
        res.status(200).json({ message: 'Products indexed successfully', result: indexResult });
    } catch (error) {
        console.error('Error during product indexing:', error);
        res.status(500).json({ message: 'Failed to index products', error: error.message });
    }
});

// --- Image Search Endpoint (NOW USING DIRECT REST API CALL) ---
app.post('/api/search-by-image', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded.' });
    }

    try {
        const imageBuffer = req.file.buffer;

        const queryVector = await getImageEmbedding(imageBuffer);

        console.log('Query Vector Length:', queryVector.length);
        console.log('First 5 elements of Query Vector:', queryVector.slice(0, 5));

        // --- DIRECT REST API CALL TO AZURE AI SEARCH ---
        const searchApiUrl = `${searchEndpoint}/indexes('${searchIndexName}')/docs/search?api-version=${SEARCH_API_VERSION}`;
        const searchHeaders = {
            'api-key': searchKey,
            'Content-Type': 'application/json'
        };

        const searchRequestBody = {
            search: null, // For pure vector search, or "*" for hybrid
            vectorQueries: [
                {
                    kind: "vector", // Explicitly define kind for direct API call
                    vector: queryVector,
                    fields: "imageVector",
                    k: 5 // Top k nearest neighbors
                }
            ],
            // Explicitly select fields, @search.score will be returned as an annotation
            select: "id,productName,imageUrl,price,description,sizes"
        };

        console.log('[Search API] Sending direct search request...');
        const searchApiResponse = await axios.post(searchApiUrl, searchRequestBody, { headers: searchHeaders });

        const products = [];
        // The results are in searchApiResponse.data.value for direct API calls
        for (const item of searchApiResponse.data.value) {
            // Here, '@search.score' will be directly available as it comes from the raw API response
            const finalScore = item['@search.score']; 

            console.log(`Product: ${item.productName}`);
            console.log(`     Reported Score (from Direct API): ${finalScore}`); 

            products.push({
                id: item.id,
                productName: item.productName,
                imageUrl: item.imageUrl,
                price: item.price,
                description: item.description,
                sizes: item.sizes,
                score: finalScore 
            });
        }
        // --- END DIRECT REST API CALL ---

        res.json({ message: 'Image search successful', products });
    } catch (error) {
        console.error('Error during image search:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Failed to perform image search', error: error.response ? error.response.data : error.message });
    }
});

// --- ADD A SIMPLE TEST GET ENDPOINT ---
app.get('/test-connection', (req, res) => {
    console.log('*** HIT: /test-connection GET endpoint was reached! ***');
    res.status(200).send('Backend connection OK!');
});


// --- Discount Service API URL ---
const DISCOUNT_SERVICE_URL = 'http://localhost:5001/get-discount'; // Ensure this matches your Flask app's port

// --- NEW: Flask Catalog Service API URL ---
const FLASK_CATALOG_URL = 'http://localhost:5001/get-catalog'; // Flask endpoint for full catalog

// --- NEW: Endpoint to get full product catalog from Flask (proxy) ---
app.get('/api/products-from-csv', async (req, res) => {
    try {
        console.log('[Backend] Fetching product catalog from Flask service...');
        const response = await axios.get(FLASK_CATALOG_URL);
        // Map Flask product_id to _id for frontend consistency if needed
        const products = response.data.map(item => ({
            _id: item.product_id, // Use product_id from CSV as _id for frontend
            name: item.product_name,
            price: item.price,
            description: `Category: ${item.category}`, // Basic description from category
            image: [`https://via.placeholder.com/150/CCCCCC/000000?text=Product+${item.product_id}`], // Placeholder image
            sizes: ["One Size"] // Assuming default sizes as CSV doesn't have this, use "One Size" for simplicity
        }));
        res.json(products);
    } catch (error) {
        console.error('Error fetching product catalog from Flask:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Failed to fetch product catalog', error: error.response ? error.response.data : error.message });
    }
});


// --- Existing: Endpoint to get product discount ---
app.post('/api/get-product-discount', async (req, res) => {
    const { productId } = req.body;

    if (!productId) {
        return res.status(400).json({ message: "Product ID is required." });
    }

    try {
        console.log(`[Backend] Requesting discount for product ID: ${productId} from Python service.`);
        // Note: The product IDs in your mockProducts are "p1", "p2", etc.
        // Ensure that your product_catalog.csv and main_customer_data.csv also use these IDs
        // or a mapping is performed if they use different IDs.
        const response = await axios.post(DISCOUNT_SERVICE_URL, { product_id: productId });

        // The Python service returns a structured JSON response
        const discountData = response.data;
        console.log(`[Backend] Received discount data for ${productId}:`, discountData);

        res.json(discountData);
    } catch (error) {
        console.error('Error fetching product discount:', error.response ? error.response.data : error.message);
        res.status(500).json({ 
            message: 'Failed to fetch product discount', 
            error: error.response ? error.response.data : error.message 
        });
    }
});

// Use existing store routes
app.use('/api', storeRoutes);
// NEW: Use virtual try-on routes
app.use('/api', virtualTryOnRoutes); // Mount the new routes under /api


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log('Remember to run the /api/index-products endpoint once to populate your search index!');
    // NEW: Important reminder for the Python service
    console.log(`Ensure your Python discount service is running on ${DISCOUNT_SERVICE_URL.replace('/get-discount', '')}`);
    console.log('For store scanning, test with mock store IDs like: wm_ny_121 or wm_tx_007');
});



// // backend/server.js
// require('dotenv').config();

// const express = require('express');
// const cors = require('cors');
// const multer = require('multer');
// const axios = require('axios');

// // We still need AzureKeyCredential for initializing SearchClient for indexing,
// // but we won't use searchClient.search for the actual search operation anymore.
// const { AzureKeyCredential } = require('@azure/core-auth');
// const { SearchClient } = require('@azure/search-documents');
// const storeRoutes = require('./routes/storeRoutes'); 


// const app = express();
// const PORT = process.env.PORT || 5000;

// // --- Azure AI Vision Configuration ---
// const visionEndpoint = process.env.AZURE_VISION_ENDPOINT;
// const visionKey = process.env.AZURE_VISION_KEY;
// const VISION_API_VERSION = '2024-02-01'; // Ensure this matches your actual API version

// console.log('--- Azure AI Vision Config ---');
// console.log('Vision Endpoint:', visionEndpoint);
// console.log('Vision Key (first 5 chars):', visionKey ? visionKey.substring(0, 5) + '...' : 'NOT SET');
// console.log('------------------------------');

// if (!visionEndpoint || !visionKey) {
//     console.error('Missing Azure AI Vision credentials. Please check your .env file.');
//     process.exit(1);
// }

// // --- Azure AI Search Configuration ---
// const searchEndpoint = process.env.AZURE_SEARCH_ENDPOINT;
// const searchKey = process.env.AZURE_SEARCH_KEY;
// const searchIndexName = process.env.AZURE_SEARCH_INDEX_NAME;
// const SEARCH_API_VERSION = '2024-07-01'; // Match API version used in Portal, if possible

// console.log('--- Azure AI Search Config ---');
// console.log('Search Endpoint:', searchEndpoint);
// console.log('Search Key (first 5 chars):', searchKey ? searchKey.substring(0, 5) + '...' : 'NOT SET');
// console.log('------------------------------');

// if (!searchEndpoint || !searchKey || !searchIndexName) {
//     console.error('Missing Azure AI Search credentials or index name. Please check your .env file.');
//     process.exit(1);
// }
// // searchClient will now only be used for indexing if needed, not for search queries
// const searchClient = new SearchClient(searchEndpoint, searchIndexName, new AzureKeyCredential(searchKey));


// // --- Middleware ---
// app.use(cors());
// app.use(express.json());
// const upload = multer({ storage: multer.memoryStorage() });


// // --- Mock Product Data (KEEP THIS) ---
// const mockProducts = [
//     {
//         _id: "p1",
//         name: "Grey Denim Pants",
//         description: "Stylish Grey Denim Pants for all seasons.",
//         image: ["https://storage77adi11.blob.core.windows.net/product-images/Screenshot 2025-06-22 184630.png"],
//         price: 79.99,
//         sizes: ["S", "M", "L"]
//     },
//     {
//         _id: "p2",
//         name: "Men's Shirt",
//         description: "Comfortable t-shirt for daily wear.",
//         image: ["https://storage77adi11.blob.core.windows.net/product-images/Screenshot 2025-06-22 163024.png"],
//         price: 24.50,
//         sizes: ["S", "M", "L", "XL"]
//     },
//     {
//         _id: "p3",
//         name: "Men shoes",
//         description: "Men shoes.",
//         image: ["https://storage77adi11.blob.core.windows.net/product-images/menShoes.png"],
//         price: 120.00,
//         sizes: ["7", "8", "9", "10"]
//     }
// ];

// // --- HELPER FUNCTION: Get Image Embedding from Azure AI Vision ---
// async function getImageEmbedding(source) {
//     try {
//         console.log(`[DEBUG] Current visionEndpoint: ${visionEndpoint}`);
//         console.log(`[DEBUG] Current VISION_API_VERSION: ${VISION_API_VERSION}`);
//         const apiUrl = `${visionEndpoint}/computervision/retrieval:vectorizeImage?api-version=${VISION_API_VERSION}&model-version=2023-04-15`;
//         console.log(`[DEBUG] Final constructed apiUrl: ${apiUrl}`);

//         let headers = {
//             'Ocp-Apim-Subscription-Key': visionKey,
//             'Content-Type': '',
//         };
//         let requestBody = {};

//         if (typeof source === 'string') {
//             headers['Content-Type'] = 'application/json';
//             requestBody = { url: source };
//             console.log(`[Vision Call] Requesting embedding for URL: ${source}`);
//         } else if (source instanceof Buffer) {
//             headers['Content-Type'] = 'application/octet-stream';
//             requestBody = source;
//             console.log(`[Vision Call] Requesting embedding for Buffer (size: ${source.length} bytes)`);
//         } else {
//             throw new Error('Invalid source for image embedding. Must be URL or Buffer.');
//         }

//         const response = await axios.post(apiUrl, requestBody, { headers: headers });

//         if (response.data && response.data.vector) {
//             const receivedVector = response.data.vector;
//             console.log(`[Vision Response] FULL RECEIVED VECTOR: [${receivedVector.join(', ')}]`); 

//             console.log(`[Vision Response] Received vector (first 5 elements): [ ${receivedVector.slice(0, 5).join(', ')} ]`);
//             console.log(`[Vision Response] Received vector (last 5 elements): [ ${receivedVector.slice(-5).join(', ')} ]`);
//             console.log(`[Vision Response] Vector length: ${receivedVector.length}`);
//             const vectorSum = receivedVector.reduce((acc, val) => acc + val, 0);
//             console.log(`[Vision Response] Vector sum (for quick comparison): ${vectorSum}`);

//             return receivedVector; // The actual vector/embedding
//         } else {
//             throw new Error('Image embedding response did not contain a vector.');
//         }

//     } catch (error) {
//         console.error('Error getting image embedding:', error.response ? error.response.data : error.message);
//         throw new Error('Failed to get image embedding from Azure AI Vision.');
//     }
// }

// // --- Product Indexing Endpoint (One-time or periodic) ---
// app.post('/api/index-products', async (req, res) => {
//     console.log('*** HIT: Received POST request for /api/index-products ***'); 

//     try {
//         console.log('Starting product indexing...');
//         const productsToIndex = await Promise.all(
//             mockProducts.map(async p => {
//                 const imageUrl = p.image[0]; // Assuming only one image URL per product
//                 const imageVector = await getImageEmbedding(imageUrl);

//                 return {
//                     id: p._id,
//                     productName: p.name,
//                     description: p.description,
//                     imageUrl: imageUrl,
//                     price: p.price,
//                     sizes: p.sizes,
//                     imageVector: imageVector // Add the generated vector
//                 };
//             })
//         );

//         const indexResult = await searchClient.uploadDocuments(productsToIndex);
//         console.log('Product indexing complete:', indexResult);
//         res.status(200).json({ message: 'Products indexed successfully', result: indexResult });
//     } catch (error) {
//         console.error('Error during product indexing:', error);
//         res.status(500).json({ message: 'Failed to index products', error: error.message });
//     }
// });

// // --- Image Search Endpoint (NOW USING DIRECT REST API CALL) ---
// app.post('/api/search-by-image', upload.single('image'), async (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ message: 'No image file uploaded.' });
//     }

//     try {
//         const imageBuffer = req.file.buffer;

//         const queryVector = await getImageEmbedding(imageBuffer);

//         console.log('Query Vector Length:', queryVector.length);
//         console.log('First 5 elements of Query Vector:', queryVector.slice(0, 5));

//         // --- DIRECT REST API CALL TO AZURE AI SEARCH ---
//         const searchApiUrl = `${searchEndpoint}/indexes('${searchIndexName}')/docs/search?api-version=${SEARCH_API_VERSION}`;
//         const searchHeaders = {
//             'api-key': searchKey,
//             'Content-Type': 'application/json'
//         };

//         const searchRequestBody = {
//             search: null, // For pure vector search, or "*" for hybrid
//             vectorQueries: [
//                 {
//                     kind: "vector", // Explicitly define kind for direct API call
//                     vector: queryVector,
//                     fields: "imageVector",
//                     k: 5 // Top k nearest neighbors
//                 }
//             ],
//             // Explicitly select fields, @search.score will be returned as an annotation
//             select: "id,productName,imageUrl,price,description,sizes"
//         };

//         console.log('[Search API] Sending direct search request...');
//         const searchApiResponse = await axios.post(searchApiUrl, searchRequestBody, { headers: searchHeaders });

//         const products = [];
//         // The results are in searchApiResponse.data.value for direct API calls
//         for (const item of searchApiResponse.data.value) {
//             // Here, '@search.score' will be directly available as it comes from the raw API response
//             const finalScore = item['@search.score']; 

//             console.log(`Product: ${item.productName}`);
//             console.log(`    Reported Score (from Direct API): ${finalScore}`); 

//             products.push({
//                 id: item.id,
//                 productName: item.productName,
//                 imageUrl: item.imageUrl,
//                 price: item.price,
//                 description: item.description,
//                 sizes: item.sizes,
//                 score: finalScore 
//             });
//         }
//         // --- END DIRECT REST API CALL ---

//         res.json({ message: 'Image search successful', products });
//     } catch (error) {
//         console.error('Error during image search:', error.response ? error.response.data : error.message);
//         res.status(500).json({ message: 'Failed to perform image search', error: error.response ? error.response.data : error.message });
//     }
// });

// // --- ADD A SIMPLE TEST GET ENDPOINT ---
// app.get('/test-connection', (req, res) => {
//     console.log('*** HIT: /test-connection GET endpoint was reached! ***');
//     res.status(200).send('Backend connection OK!');
// });


// // --- Discount Service API URL ---
// const DISCOUNT_SERVICE_URL = 'http://localhost:5001/get-discount'; // Ensure this matches your Flask app's port

// // --- NEW: Flask Catalog Service API URL ---
// const FLASK_CATALOG_URL = 'http://localhost:5001/get-catalog'; // Flask endpoint for full catalog

// // --- NEW: Endpoint to get full product catalog from Flask (proxy) ---
// app.get('/api/products-from-csv', async (req, res) => {
//     try {
//         console.log('[Backend] Fetching product catalog from Flask service...');
//         const response = await axios.get(FLASK_CATALOG_URL);
//         // Map Flask product_id to _id for frontend consistency if needed
//         const products = response.data.map(item => ({
//             _id: item.product_id, // Use product_id from CSV as _id for frontend
//             name: item.product_name,
//             price: item.price,
//             description: `Category: ${item.category}`, // Basic description from category
//             image: [`https://via.placeholder.com/150/CCCCCC/000000?text=Product+${item.product_id}`], // Placeholder image
//             sizes: ["One Size"] // Assuming default sizes as CSV doesn't have this, use "One Size" for simplicity
//         }));
//         res.json(products);
//     } catch (error) {
//         console.error('Error fetching product catalog from Flask:', error.response ? error.response.data : error.message);
//         res.status(500).json({ message: 'Failed to fetch product catalog', error: error.response ? error.response.data : error.message });
//     }
// });


// // --- Existing: Endpoint to get product discount ---
// app.post('/api/get-product-discount', async (req, res) => {
//     const { productId } = req.body;

//     if (!productId) {
//         return res.status(400).json({ message: "Product ID is required." });
//     }

//     try {
//         console.log(`[Backend] Requesting discount for product ID: ${productId} from Python service.`);
//         // Note: The product IDs in your mockProducts are "p1", "p2", etc.
//         // Ensure that your product_catalog.csv and main_customer_data.csv also use these IDs
//         // or a mapping is performed if they use different IDs.
//         const response = await axios.post(DISCOUNT_SERVICE_URL, { product_id: productId });

//         // The Python service returns a structured JSON response
//         const discountData = response.data;
//         console.log(`[Backend] Received discount data for ${productId}:`, discountData);

//         res.json(discountData);
//     } catch (error) {
//         console.error('Error fetching product discount:', error.response ? error.response.data : error.message);
//         res.status(500).json({ 
//             message: 'Failed to fetch product discount', 
//             error: error.response ? error.response.data : error.message 
//         });
//     }
// });

// app.use('/api', storeRoutes);


// // --- Start Server ---
// app.listen(PORT, () => {
//     console.log(`Backend server running on http://localhost:${PORT}`);
//     console.log('Remember to run the /api/index-products endpoint once to populate your search index!');
//     // NEW: Important reminder for the Python service
//     console.log(`Ensure your Python discount service is running on ${DISCOUNT_SERVICE_URL.replace('/get-discount', '')}`);
//     console.log('For store scanning, test with mock store IDs like: wm_ny_121 or wm_tx_007');
// });



