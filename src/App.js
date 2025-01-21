import React, { useState } from 'react';
import './App.css';

function App() {
    const [step, setStep] = useState('login'); // Steps: 'login', 'upload', 'palette'
    const [username, setUsername] = useState('');
    const [image, setImage] = useState(null);
    const [palette, setPalette] = useState([]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (username) {
            setStep('upload');
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(URL.createObjectURL(file));
        }
    };

    const generatePalette = async () => {
        if (!image) return;

        // Mock palette generation (replace with actual API call if needed)
        const colors = [
            '#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33A6'
        ];
        setPalette(colors);
        setStep('palette');
    };

    const resetApp = () => {
        setStep('login');
        setUsername('');
        setImage(null);
        setPalette([]);
    };

    return (
        <div className="app-container">
            {step === 'login' && (
                <div className="login-step">
                    <h1>Welcome! Log in to continue</h1>
                    <form onSubmit={handleLogin}>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <button type="submit">Log In</button>
                    </form>
                </div>
            )}

            {step === 'upload' && (
                <div className="upload-step">
                    <h1>Hello, {username}!</h1>
                    <p>Upload an image to generate a color palette:</p>
                    <input type="file" accept="image/*" onChange={handleImageUpload} />
                    {image && (
                        <div className="image-preview">
                            <img src={image} alt="Uploaded Preview" />
                        </div>
                    )}
                    <button onClick={generatePalette} disabled={!image}>Generate Palette</button>
                </div>
            )}

            {step === 'palette' && (
                <div className="palette-step">
                    <h1>Your Color Palette</h1>
                    <div className="palette">
                        {palette.map((color, index) => (
                            <div
                                key={index}
                                className="color-box"
                                style={{ backgroundColor: color }}
                            >
                                {color}
                            </div>
                        ))}
                    </div>
                    <button onClick={resetApp}>Start Over</button>
                </div>
            )}
        </div>
    );
}

export default App;

