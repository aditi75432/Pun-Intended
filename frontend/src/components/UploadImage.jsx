import React, { useState } from "react";
import axios from "axios";

export default function UploadImage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [results, setResults] = useState([]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await axios.post("http://localhost:8000/upload/", formData);
      setResults(response.data.matches);
    } catch (err) {
      console.error("Error uploading:", err);
    }
  };

  return (
    <div>
      <h2>Upload Shopping List</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload}>Detect Items</button>

      <h3>Detected Items</h3>
      <ul>
        {results.map((item, index) => (
          <li key={index}>
            {item.name} - ₹{item.price} -
            <a href={item.link} target="_blank" rel="noreferrer">Buy</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
