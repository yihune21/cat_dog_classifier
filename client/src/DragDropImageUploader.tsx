import "./DragDropImageUploader.css";
import { useState, useRef } from "react";

import axios from "axios";

function DragDropImageUploader() {
  const url = "http://127.0.0.1:5000/predict";
  const [imagesToShow, setImagesToShow] = useState<any>([]);
  const [imagesToSend, setImagesToSend] = useState<any>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function selectFiles() {
    fileInputRef.current?.click();
  }

  function deleteImage(index: number) {
    setImagesToShow((prevImage: any) => {
      return prevImage.filter((_: any, i: number) => i != index);
    });

    setImagesToSend((prevImage: any) => {
      return prevImage.filter((_: any, i: number) => i != index);
    });
  }

  function getPredictions(value: number): string {
    if (value > 0.5) {
      return "Dog";
    } else if (value <= 0.5) {
      return "Cat";
    } else {
      return "------";
    }
  }

  function onFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const files2 = event?.target.files;
    if (!files2 || files2.length === 0) return;
    for (let i = 0; i < files2.length; i++) {
      if (files2[i].type.split("/")[0] !== "image") {
        console.log("file is not an image");
        continue;
      }
      if (!imagesToShow.some((e: any) => e.name === files2[i].name)) {
        setImagesToShow((prevImages: any) => [
          ...prevImages,
          {
            name: files2[i].name,
            url: URL.createObjectURL(files2[i]),
          },
        ]);
      }
    }

    const files = event.target.files;
    if (!files) return; // Add null check for event.target
    const newImages: { dataURL: string | ArrayBuffer | null; name: string }[] =
      [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Read the image data using FileReader
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        // Add null check for e.target
        if (e.target) {
          newImages.push({ dataURL: e.target.result, name: file.name });

          setImagesToSend((prevImages: any) => {
            console.log({ prevImages, newImages });
            return [...prevImages, ...newImages];
          });
        }
      };
    }
  }

  function dataURLtoBlob(dataURL: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", dataURL);
      xhr.responseType = "blob";
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(xhr.response);
        } else {
          reject(new Error("Failed to convert data URL to Blob"));
        }
      };
      xhr.onerror = () => {
        reject(new Error("Failed to convert data URL to Blob"));
      };
      xhr.send();
    });
  }

  async function handleUpload() {
    const formData = new FormData();
    for (let i = 0; i < imagesToSend.length; i++) {
      const image = imagesToSend[i];
      // Convert DataURL to Blob (optional, depending on backend)
      const blob = await dataURLtoBlob(image.dataURL);
      formData.append("file", blob, image.name);
    }

    try {
      // console.log(formData);

      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // console.log(response.data.predictions);

      // Handle successful upload response from backend (e.g., predictions)
      setPredictions(response.data.predictions); // Assuming predictions in response
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  }

  return (
    <div className="mainContainer">
      <div className="card">
        <div className="top">
          <p>Cat or Dog ?</p>
        </div>
        <div className="drag-area">
          {isDragging ? (
            <span className="select">Drop images here</span>
          ) : (
            <>
              Drop an image here or
              <span onClick={selectFiles} role="button" className="select">
                Browse
              </span>
            </>
          )}

          <input
            onChange={onFileSelect}
            ref={fileInputRef}
            type="file"
            name="file"
            className="file"
            multiple={true}
          />
        </div>
        <div>
          <button onClick={handleUpload} type="button">
            Predict !
          </button>
        </div>
      </div>

      <div className="result-container">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            backgroundColor: "white",
            color: "#581c1c",
          }}
        >
          <p
            style={{
              fontWeight: "bold",
              fontSize: 40,
            }}
          >
            Results
          </p>
        </div>

        <div
          style={{
            flex: 1,
            height: "100%",
            // padding: "10px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",

            alignItems: "center",
            overflow: "vertical",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              height: "250px",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              overflowY: "scroll",
              scrollbarWidth: "none",
              gap: "10px",

              // backgroundColor: "yellow",
            }}
            className="container"
          >
            {imagesToShow?.map((images: any, index: number) => (
              <div key={index} className="image">
                <div className="imageContainer">
                  <img
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: "5px",
                    }}
                    src={images.url}
                    alt={images.name}
                  />
                  <span
                    onClick={() => {
                      deleteImage(index);
                    }}
                    className="delete"
                  >
                    &times;
                  </span>
                  <span
                    style={{
                      marginLeft: 10,
                      textDecoration: "underline",
                      color: "white",
                      fontWeight: "bold",
                      fontFamily: "sans-serif",
                      textAlign: "center",
                    }}
                  >
                    {/* {predictions.length > 0 && (
                      <ul>
                        {predictions.map((prediction, index) => (
                          <li key={index}>{getPredictions(prediction)}</li>
                        ))}
                      </ul>
                    )} */}
                    {getPredictions(predictions[index])}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DragDropImageUploader;
